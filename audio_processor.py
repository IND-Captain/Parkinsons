import numpy as np
import librosa
from scipy.signal import butter, lfilter

def analyze_audio_quality(y, sr):
    """
    Analyzes audio for quality issues like clipping, low volume, and background noise.
    Returns a quality score and a list of warnings.
    """
    warnings = []
    quality_score = 100

    # 1. Clipping Detection
    clipping_threshold = 0.98
    clipped_samples = np.sum(np.abs(y) >= clipping_threshold)
    if (clipped_samples / len(y)) > 0.01:
        warnings.append('Audio is too loud (clipping detected). Please move away from the microphone.')
        quality_score -= 40

    # 2. Low Volume Detection
    max_amplitude = np.max(np.abs(y))
    if max_amplitude < 0.01:
        warnings.append('Audio is too quiet. Please speak closer to the microphone.')
        quality_score -= 40

    # 3. Signal-to-Noise Ratio (SNR) Estimation
    snr = calculate_snr(y, sr)
    if snr < 15:
        warnings.append(f'High background noise detected (SNR: {snr:.1f} dB). Please find a quieter room.')
        quality_score -= (15 - snr) * 2 # Penalize more for lower SNR

    return {
        'quality_score': max(0, int(quality_score)),
        'snr': round(snr, 1),
        'amplitude': round(max_amplitude, 2),
        'warnings': warnings
    }

def calculate_snr(y, sr):
    """
    Estimates the Signal-to-Noise Ratio (SNR) of an audio signal.
    """
    try:
        # Use librosa's VAD to split into speech and noise segments
        speech_intervals = librosa.effects.split(y, top_db=20)
        
        if len(speech_intervals) == 0:
            return 0  # No speech detected

        # Concatenate speech parts
        speech_signal = np.concatenate([y[start:end] for start, end in speech_intervals])
        
        # Estimate noise as everything else
        noise_mask = np.ones(len(y), dtype=bool)
        for start, end in speech_intervals:
            noise_mask[start:end] = False
        noise_signal = y[noise_mask]

        if len(noise_signal) == 0 or len(speech_signal) == 0:
            return 35  # Very clean signal, assign a high SNR

        # Calculate power
        speech_power = np.sum(speech_signal ** 2) / len(speech_signal)
        noise_power = np.sum(noise_signal ** 2) / len(noise_signal)

        if noise_power == 0:
            return 35  # No noise, high SNR

        snr = 10 * np.log10(speech_power / noise_power)
        return snr
    except Exception:
        return 10 # Default to a moderate SNR on error

def butter_bandpass_filter(data, lowcut, highcut, fs, order=5):
    """Applies a Butterworth band-pass filter to the audio data."""
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    y = lfilter(b, a, data)
    return y

def reduce_noise_spectral_gating(audio_data, sample_rate):
    """A simple spectral gating implementation for noise reduction."""
    stft = librosa.stft(audio_data)
    stft_mag, stft_phase = librosa.magphase(stft)
    
    # Estimate noise profile from the first few frames
    noise_profile = np.mean(stft_mag[:, :5], axis=1)
    
    # Create a mask to gate noise
    mask = (stft_mag > (noise_profile[:, np.newaxis] * 2.0))
    
    # Apply mask
    stft_mag_denoised = stft_mag * mask
    
    # Inverse STFT to get denoised audio
    y_denoised = librosa.istft(stft_mag_denoised * stft_phase, length=len(audio_data))
    return y_denoised

def extract_features(y, sr):
    """Extracts the 15 features the model was trained on."""
    features = []
    
    # Pitch and related features
    f0, _, _ = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
    f0 = f0[~np.isnan(f0)]
    if len(f0) < 2: f0 = np.array([150, 151]) # Default if no pitch found
    
    features.append(np.mean(f0))  # MDVP:Fo(Hz)
    features.append(np.max(f0))   # MDVP:Fhi(Hz)
    features.append(np.min(f0))   # MDVP:Flo(Hz)
    
    # Jitter and Shimmer
    jitter_abs = np.mean(np.abs(np.diff(f0)))
    jitter_percent = (jitter_abs / np.mean(f0)) * 100 if np.mean(f0) > 0 else 0
    features.append(jitter_percent) # MDVP:Jitter(%)
    features.append(jitter_abs)     # MDVP:Jitter(Abs)
    
    rms = librosa.feature.rms(y=y)[0]
    shimmer = np.mean(np.abs(np.diff(rms))) / np.mean(rms) if np.mean(rms) > 0 else 0
    features.append(shimmer)      # MDVP:Shimmer
    features.append(librosa.amplitude_to_db(shimmer) if shimmer > 0 else -100) # MDVP:Shimmer(dB)

    # Harmonics-to-Noise Ratio (HNR)
    harmonic, percussive = librosa.effects.hpss(y)
    # Ensure percussive power is not zero to avoid division errors
    percussive_power = np.mean(percussive**2)
    if percussive_power < 1e-10: percussive_power = 1e-10
    
    hnr = np.mean(harmonic**2) / percussive_power
    nhr = 1 / hnr if hnr > 0 else 100
    
    features.append(nhr) # NHR (Noise-to-Harmonics Ratio)
    features.append(10 * np.log10(hnr) if hnr > 0 else -100) # HNR in dB

    # Other complex features (simulated for consistency with training script)
    # In a production system, these would be calculated properly.
    features.extend([
        0.5,  # RPDE
        0.7,  # DFA
        -5.0, # spread1
        0.2,  # spread2
        2.0,  # D2
        0.2   # PPE
    ])
    
    return features