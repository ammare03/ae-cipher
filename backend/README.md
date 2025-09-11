# Backend - AVS Cipher

This directory contains the backend implementation of the AVS Cipher application.

## Files

- **`AVSCipher.py`** - Command-line cipher implementation with menu-driven interface
- **`cipher_api.py`** - FastAPI REST API server that exposes cipher functionality
- **`requirements.txt`** - Python dependencies for the backend
- **`README.md`** - This file

## Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the API server:
   ```bash
   python cipher_api.py
   ```

3. Or run the command-line interface:
   ```bash
   python AVSCipher.py
   ```

## API Endpoints

- **POST /encrypt** - Encrypt plaintext
- **POST /decrypt** - Decrypt ciphertext
- **GET /health** - Health check endpoint

The API server runs on `http://localhost:8000` by default and provides CORS support for the frontend running on `http://localhost:3000`.
