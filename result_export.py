from fpdf import FPDF
import io
import csv
from datetime import datetime

def generate_pdf_report(data):
    """Generates a PDF report from analysis data."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)

    # Header
    pdf.cell(0, 10, "Parkinson's Voice Analysis Report", 0, 1, 'C')
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 10, f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, 'C')
    pdf.ln(10)

    # Summary
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "Analysis Summary", 0, 1)
    pdf.set_font("Helvetica", "", 11)
    prediction_text = "At Risk" if data.get('prediction') == 1 else "Likely Healthy"
    pdf.cell(0, 8, f"Prediction: {prediction_text}", 0, 1)
    pdf.cell(0, 8, f"Confidence: {data.get('confidence', 0):.1f}%", 0, 1)
    pdf.ln(5)

    # Quality Report
    if 'quality_report' in data:
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 10, "Audio Quality", 0, 1)
        pdf.set_font("Helvetica", "", 11)
        qr = data['quality_report']
        pdf.cell(0, 8, f"Overall Quality Score: {qr.get('quality_score', 'N/A')}/100", 0, 1)
        pdf.cell(0, 8, f"Signal-to-Noise Ratio (SNR): {qr.get('snr', 'N/A')} dB", 0, 1)
        pdf.ln(5)

    # Disclaimer
    pdf.set_font("Helvetica", "I", 9)
    pdf.multi_cell(0, 5, "Disclaimer: This tool is for educational and informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.")

    # Create an in-memory bytes buffer
    pdf_buffer = io.BytesIO()
    pdf.output(pdf_buffer)
    pdf_buffer.seek(0)
    return pdf_buffer

def generate_csv_report(data_list):
    """Generates a CSV report from a list of analysis data."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    header = [
        'timestamp', 'prediction', 'confidence', 
        'quality_score', 'snr', 'amplitude'
    ]
    writer.writerow(header)

    # Rows
    for data in data_list:
        prediction_text = "At Risk" if data.get('prediction') == 1 else "Likely Healthy"
        qr = data.get('quality_report', {})
        row = [
            data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            prediction_text,
            f"{data.get('confidence', 0):.1f}",
            qr.get('quality_score', 'N/A'),
            qr.get('snr', 'N/A'),
            qr.get('amplitude', 'N/A')
        ]
        writer.writerow(row)

    # Create an in-memory bytes buffer
    csv_buffer = io.BytesIO()
    csv_buffer.write(output.getvalue().encode('utf-8'))
    csv_buffer.seek(0)
    return csv_buffer