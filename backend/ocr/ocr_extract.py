#!/usr/bin/env python3
"""
PaddleOCR extraction script for NutraLingo.
Reads a base64-encoded image from stdin, runs OCR, outputs JSON to stdout.

Usage (from Node.js child_process):
  echo "<base64_image_data>" | python ocr_extract.py

Output JSON:
  { "text": "extracted text...", "lines": [...], "confidence": 0.85 }
"""

import sys
import json
import base64
import tempfile
import os

# Skip slow model source connectivity check
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"

def run_ocr(image_data_b64):
    """Run PaddleOCR on a base64 image and return structured text."""
    try:
        from paddleocr import PaddleOCR
    except ImportError:
        return {
            "error": "PaddleOCR not installed. Run: pip install paddleocr paddlepaddle",
            "text": "",
            "lines": [],
            "confidence": 0
        }

    # Decode base64 to temp file
    # Strip data URI prefix if present
    if ',' in image_data_b64:
        image_data_b64 = image_data_b64.split(',', 1)[1]

    image_bytes = base64.b64decode(image_data_b64)

    # Write to temp file
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        tmp.write(image_bytes)
        tmp_path = tmp.name

    try:
        # Initialize PaddleOCR v3+ (minimal params)
        ocr = PaddleOCR(lang='en')

        result = ocr.ocr(tmp_path)

        if not result or not result[0]:
            return {
                "text": "",
                "lines": [],
                "confidence": 0,
                "error": "No text detected in image"
            }

        lines = []
        total_confidence = 0
        count = 0

        for line_result in result[0]:
            bbox, (text, confidence) = line_result
            lines.append({
                "text": text,
                "confidence": round(confidence, 4)
            })
            total_confidence += confidence
            count += 1

        full_text = '\n'.join([l["text"] for l in lines])
        avg_confidence = round(total_confidence / count, 4) if count > 0 else 0

        return {
            "text": full_text,
            "lines": lines,
            "confidence": avg_confidence
        }

    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == '__main__':
    # Read base64 image data from stdin
    image_b64 = sys.stdin.read().strip()

    if not image_b64:
        result = {"error": "No image data provided", "text": "", "lines": [], "confidence": 0}
    else:
        result = run_ocr(image_b64)

    # Output JSON to stdout
    print(json.dumps(result))
