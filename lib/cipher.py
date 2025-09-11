"""
AE Cipher encryption/decryption utilities
"""
import base64


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
