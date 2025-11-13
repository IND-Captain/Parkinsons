from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pydub import AudioSegment
import joblib
import numpy as np
import warnings
import io
import librosa
from audio_processor import analyze_audio_quality, butter_bandpass_filter, reduce_noise_spectral_gating, extract_features
from result_export import generate_pdf_report, generate_csv_report

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# --- Load Model and Scaler ---
try:
    model = joblib.load('parkinsons_model.pkl')
    scaler = joblib.load('feature_scaler.pkl')
    print("✅ Model and scaler loaded successfully.")
except FileNotFoundError:
    model = None
    scaler = None
    print("❌ Error: parkinsons_model.pkl or feature_scaler.pkl not found.")
    print("Please run train_parkinsons_model.py to generate the model files.")

def make_error_response(message, code, status_code):
    """Helper to create a structured error response."""
    return jsonify({
        'error': {
            'code': code,
            'message': message
        }}), status_code

@app.route('/test_mic', methods=['POST'])
def test_mic():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    file = request.files['audio']
    audio_bytes = file.read()
    try:
        y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050)
    except Exception as e:
        return jsonify({'error': f'Could not process audio file: {e}'}), 400

    # --- Quality Checks ---
    quality_report = analyze_audio_quality(y, sr)
    if quality_report['warnings']:
        return jsonify({'error': '. '.join(quality_report['warnings'])}), 400

    return jsonify({
        'status': 'ok',
        'message': 'Microphone quality is good.',
        'quality_score': quality_report['quality_score'],
        'snr': quality_report['snr'],
        'amplitude': quality_report['amplitude']
    })

@app.route('/process_and_predict', methods=['POST'])
def process_and_predict():
    if not model or not scaler:
        return make_error_response('Model not loaded. Please contact support.', 'MODEL_NOT_FOUND', 500)

    try:
        if 'audio' not in request.files:
            return make_error_response('No audio file provided.', 'NO_AUDIO_FILE', 400)
        
        file = request.files['audio']
        language = request.form.get('language', 'en')
        print(f"Processing request for language: {language}")

        audio_bytes = file.read()

        # Convert audio from whatever format it is (e.g., webm) to WAV
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes))
        wav_bytes = io.BytesIO()
        audio_segment.export(wav_bytes, format="wav")
        wav_bytes.seek(0)
        y, sr = librosa.load(wav_bytes, sr=22050)

        # --- Quality Check before processing ---
        quality_report = analyze_audio_quality(y, sr)
        if quality_report['warnings']:
            return make_error_response('. '.join(quality_report['warnings']), 'POOR_AUDIO_QUALITY', 400)

        # --- Pre-processing Pipeline ---
        y_filtered = butter_bandpass_filter(y, 300, 1500, sr)
        y_denoised = reduce_noise_spectral_gating(y_filtered, sr)
        y_trimmed, _ = librosa.effects.trim(y_denoised, top_db=20)

        # --- Feature Extraction ---
        features = extract_features(y_trimmed, sr)
        features_array = np.array(features).reshape(1, -1)

        # --- Prediction ---
        features_scaled = scaler.transform(features_array)
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0]
        confidence = probability[int(prediction)] * 100

        return jsonify({
            'prediction': int(prediction),      # Cast to standard Python int
            'confidence': float(confidence),    # Cast to standard Python float
            'quality_report': {
                'warnings': quality_report['warnings'],
                'quality_score': float(quality_report['quality_score']),
                'snr': float(quality_report['snr']),
                'amplitude': float(quality_report['amplitude'])
            }
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return make_error_response('An unexpected error occurred during prediction.', 'PREDICTION_FAILED', 500)

@app.route('/export', methods=['POST'])
def export_report():
    try:
        data = request.get_json()
        export_format = data.get('format', 'pdf')
        history = data.get('history', [])

        if not history:
            return jsonify({'error': 'No data provided for export'}), 400

        if export_format == 'pdf':
            buffer = generate_pdf_report(history[0]) # PDF for the most recent result
            return send_file(buffer, mimetype='application/pdf', as_attachment=True, download_name='parkinsons_report.pdf')
        elif export_format == 'csv':
            buffer = generate_csv_report(history) # CSV for all history
            return send_file(buffer, mimetype='text/csv', as_attachment=True, download_name='parkinsons_history.csv')
        else:
            return jsonify({'error': 'Invalid export format specified'}), 400
    except Exception as e:
        print(f"Export error: {e}")
        return jsonify({'error': 'An error occurred during report generation.'}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)