#!/usr/bin/env python3
"""
FastAPI server for AE Cipher
Exposes the encryption/decryption functionality via REST API
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64

app = FastAPI(title="AE Cipher API", version="1.0.0")

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


class DecryptRequest(BaseModel):
    ciphertext: str
    password: str
    rounds: int = 3


class EncryptResponse(BaseModel):
    success: bool
    ciphertext: str = ""
    error: str = ""


class DecryptResponse(BaseModel):
    success: bool
    plaintext: str = ""
    error: str = ""


def generate_key(passphrase: str):
    """Create numeric key bytes from passphrase + 'Ammar'"""
    combined = passphrase + "Ammar"
    return [ord(ch) % 256 for ch in combined]


def evolve_key(old_key):
    """Evolve key deterministically for the next round"""
    return [(val * 7 + 3) % 256 for val in old_key]


def encrypt_once_bytes(pt_bytes: bytes, key):
    out = bytearray(len(pt_bytes))
    for i, b in enumerate(pt_bytes):
        shift = key[i % len(key)]
        out[i] = (b + shift) % 256
    return bytes(out)


def decrypt_once_bytes(ct_bytes: bytes, key):
    out = bytearray(len(ct_bytes))
    for i, b in enumerate(ct_bytes):
        shift = key[i % len(key)]
        out[i] = (b - shift) % 256
    return bytes(out)


def encrypt_text(plaintext: str, passphrase: str, rounds: int = 3) -> str:
    data = plaintext.encode('utf-8')
    key = generate_key(passphrase)
    for _ in range(rounds):
        data = encrypt_once_bytes(data, key)
        key = evolve_key(key)
    return base64.b64encode(data).decode('ascii')


def decrypt_text(b64cipher: str, passphrase: str, rounds: int = 3):
    try:
        data = base64.b64decode(b64cipher)
    except Exception as e:
        return None, f"Base64 decode error: {e}"

    # build keys forward
    key = generate_key(passphrase)
    keys = [key]
    for _ in range(rounds - 1):
        key = evolve_key(key)
        keys.append(key)

    # apply inverse in reverse order
    for k in reversed(keys):
        data = decrypt_once_bytes(data, k)

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

        ciphertext = encrypt_text(
            request.plaintext, request.password, request.rounds)
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

        plaintext, error = decrypt_text(
            request.ciphertext, request.password, request.rounds)

        if error:
            return DecryptResponse(success=False, error=error)

        return DecryptResponse(success=True, plaintext=plaintext)

    except HTTPException:
        raise
    except Exception as e:
        return DecryptResponse(success=False, error=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "AE Cipher API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
