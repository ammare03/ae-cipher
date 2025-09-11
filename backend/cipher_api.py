#!/usr/bin/env python3
"""
FastAPI server for Enhanced AE Cipher with PBR Integration
Exposes the encryption/decryption functionality via REST API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64

app = FastAPI(title="Enhanced AE Cipher API", version="2.0.0")

# Allow CORS for Next.js development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EncryptRequest(BaseModel):
    plaintext: str
    password: str
    rounds: int = 3
    use_pbr: bool = True
    block_size: int = 8


class DecryptRequest(BaseModel):
    ciphertext: str
    password: str
    rounds: int = 3
    use_pbr: bool = True
    block_size: int = 8


class EncryptResponse(BaseModel):
    success: bool
    ciphertext: str = ""
    error: str = ""


class DecryptResponse(BaseModel):
    success: bool
    plaintext: str = ""
    error: str = ""


def generate_key_stream(text, keyword):
    """Generate key stream by repeating keyword to match text length"""
    keyword = list(keyword)
    if len(text) == len(keyword):
        return keyword
    else:
        key_stream = []
        for i in range(len(text)):
            key_stream.append(keyword[i % len(keyword)])
        return "".join(key_stream)


def generate_key(passphrase: str):
    """Create numeric key bytes from passphrase (removed hardcoded 'Ammar')"""
    return [ord(ch) % 256 for ch in passphrase]


def evolve_key(old_key):
    """Evolve key deterministically for the next round"""
    return [(val * 7 + 3) % 256 for val in old_key]


def pbr_encrypt_bytes(data_bytes: bytes, keyword: str, block_size: int = 8):
    """Apply PBR encryption to bytes data"""
    # Convert bytes to string for PBR processing
    plaintext = ''.join(chr(b) for b in data_bytes)
    
    # 0. Padding
    padding_char = '~'
    if len(plaintext) % block_size != 0:
        padding_needed = block_size - (len(plaintext) % block_size)
        plaintext += padding_char * padding_needed
    
    # 1. Key Stream Generation
    key_stream = generate_key_stream(plaintext, keyword)
    
    # 2. Polyalphabetic Substitution
    shifted_text = ""
    for i in range(len(plaintext)):
        plain_char_code = ord(plaintext[i])
        key_char_code = ord(key_stream[i])
        
        # Shift based on the key character's ASCII value
        shifted_char_code = (plain_char_code + key_char_code) % 256
        shifted_text += chr(shifted_char_code)
    
    # 3. Block Transposition (Reversal)
    ciphertext = ""
    for i in range(0, len(shifted_text), block_size):
        block = shifted_text[i:i+block_size]
        ciphertext += block[::-1]  # Reverse the block
    
    # Convert back to bytes
    return bytes(ord(c) for c in ciphertext)


def pbr_decrypt_bytes(cipher_bytes: bytes, keyword: str, block_size: int = 8):
    """Apply PBR decryption to bytes data"""
    # Convert bytes to string for PBR processing
    ciphertext = ''.join(chr(b) for b in cipher_bytes)
    
    # 1. Reverse the Block Transposition
    reversed_blocks_text = ""
    for i in range(0, len(ciphertext), block_size):
        block = ciphertext[i:i+block_size]
        reversed_blocks_text += block[::-1]
    
    # 2. Key Stream Generation
    key_stream = generate_key_stream(reversed_blocks_text, keyword)
    
    # 3. Reverse Polyalphabetic Substitution
    plaintext = ""
    for i in range(len(reversed_blocks_text)):
        cipher_char_code = ord(reversed_blocks_text[i])
        key_char_code = ord(key_stream[i])
        
        # Shift back
        original_char_code = (cipher_char_code - key_char_code) % 256
        plaintext += chr(original_char_code)
    
    # 4. Remove Padding
    padding_char = '~'
    plaintext = plaintext.rstrip(padding_char)
    
    # Convert back to bytes
    return bytes(ord(c) for c in plaintext)


def encrypt_once_bytes(pt_bytes: bytes, key):
    """Original AE cipher encryption with key evolution"""
    out = bytearray(len(pt_bytes))
    for i, b in enumerate(pt_bytes):
        shift = key[i % len(key)]
        out[i] = (b + shift) % 256
    return bytes(out)


def decrypt_once_bytes(ct_bytes: bytes, key):
    """Original AE cipher decryption with key evolution"""
    out = bytearray(len(ct_bytes))
    for i, b in enumerate(ct_bytes):
        shift = key[i % len(key)]
        out[i] = (b - shift) % 256
    return bytes(out)


def encrypt_text(plaintext: str, passphrase: str, rounds: int = 3, use_pbr: bool = True, block_size: int = 8) -> str:
    """Enhanced encryption combining AE cipher with optional PBR techniques"""
    data = plaintext.encode('utf-8')
    key = generate_key(passphrase)
    
    # Apply PBR encryption first if enabled
    if use_pbr:
        data = pbr_encrypt_bytes(data, passphrase, block_size)
    
    # Apply multi-round AE cipher encryption
    for _ in range(rounds):
        data = encrypt_once_bytes(data, key)
        key = evolve_key(key)
    
    return base64.b64encode(data).decode('ascii')


def decrypt_text(b64cipher: str, passphrase: str, rounds: int = 3, use_pbr: bool = True, block_size: int = 8):
    """Enhanced decryption combining AE cipher with optional PBR techniques"""
    try:
        data = base64.b64decode(b64cipher)
    except Exception as e:
        return None, f"Base64 decode error: {e}"
    
    # Build keys forward
    key = generate_key(passphrase)
    keys = [key]
    for _ in range(rounds - 1):
        key = evolve_key(key)
        keys.append(key)
    
    # Apply inverse AE cipher in reverse order
    for k in reversed(keys):
        data = decrypt_once_bytes(data, k)
    
    # Apply PBR decryption if it was used during encryption
    if use_pbr:
        try:
            data = pbr_decrypt_bytes(data, passphrase, block_size)
        except Exception as e:
            return None, f"PBR decryption error: {e}"
    
    try:
        text = data.decode('utf-8')
    except Exception:
        text = data.decode('utf-8', errors='replace')
    return text, None


@app.post("/encrypt", response_model=EncryptResponse)
async def encrypt_endpoint(request: EncryptRequest):
    try:
        if not request.plaintext.strip():
            raise HTTPException(
                status_code=400, detail="Plaintext cannot be empty")

        if not request.password.strip():
            raise HTTPException(
                status_code=400, detail="Password cannot be empty")

        if request.rounds < 1:
            raise HTTPException(
                status_code=400, detail="Rounds must be at least 1")

        if request.block_size < 1:
            raise HTTPException(
                status_code=400, detail="Block size must be at least 1")

        ciphertext = encrypt_text(
            request.plaintext, request.password, request.rounds, 
            request.use_pbr, request.block_size)
        return EncryptResponse(success=True, ciphertext=ciphertext)

    except HTTPException:
        raise
    except Exception as e:
        return EncryptResponse(success=False, error=str(e))


@app.post("/decrypt", response_model=DecryptResponse)
async def decrypt_endpoint(request: DecryptRequest):
    try:
        if not request.ciphertext.strip():
            raise HTTPException(
                status_code=400, detail="Ciphertext cannot be empty")

        if not request.password.strip():
            raise HTTPException(
                status_code=400, detail="Password cannot be empty")

        if request.rounds < 1:
            raise HTTPException(
                status_code=400, detail="Rounds must be at least 1")

        if request.block_size < 1:
            raise HTTPException(
                status_code=400, detail="Block size must be at least 1")

        plaintext, error = decrypt_text(
            request.ciphertext, request.password, request.rounds,
            request.use_pbr, request.block_size)

        if error:
            return DecryptResponse(success=False, error=error)

        return DecryptResponse(success=True, plaintext=plaintext)

    except HTTPException:
        raise
    except Exception as e:
        return DecryptResponse(success=False, error=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Enhanced AE Cipher API is running"}


@app.get("/info")
async def get_cipher_info():
    return {
        "cipher_name": "Enhanced AE Cipher with PBR Integration",
        "version": "2.0.0",
        "features": [
            "Multi-round AE cipher encryption",
            "Polyalphabetic Block-Reverse (PBR) enhancement",
            "Configurable block sizes",
            "Base64 encoded output",
            "Key evolution between rounds"
        ],
        "removed_features": [
            "Hardcoded 'Ammar' inclusion in key generation"
        ]
    }


if __name__ == "__main__":
    try:
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except ImportError:
        print("uvicorn not installed. Install with: pip install uvicorn")
        print("You can also run the API with: uvicorn cipher_api:app --host 0.0.0.0 --port 8000")
