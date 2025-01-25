from flask import Flask, request, send_file
import fitz  # PyMuPDF
from docx import Document
import os
from io import BytesIO  # Add this import
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/convert": {"origins": "*"}})  # Allow all origins for /convert


@app.route('/convert', methods=['POST'])
def convert():
    if 'pdf' not in request.files:
        return 'No file uploaded', 400

    pdf_file = request.files['pdf']
    if pdf_file.filename == '':
        return 'No file selected', 400

    # Create temp folder
    if not os.path.exists('temp'):
        os.makedirs('temp')

    pdf_path = os.path.join('temp', pdf_file.filename)
    pdf_file.save(pdf_path)

    try:
        # Open PDF and extract text
        pdf = fitz.open(pdf_path)
        doc = Document()

        for page in pdf:
            text = page.get_text()
            doc.add_paragraph(text)

        # Save DOCX to a BytesIO buffer (in-memory)
        docx_buffer = BytesIO()
        doc.save(docx_buffer)
        docx_buffer.seek(0)  # Reset buffer position

        # Cleanup PDF file immediately
        pdf.close()
        os.remove(pdf_path)

        # Send the DOCX from memory (no temporary file)
        return send_file(
            docx_buffer,
            as_attachment=True,
            download_name="converted.docx",
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )

    except Exception as e:
        return str(e), 500