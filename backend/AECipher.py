#!/usr/bin/env python3
"""
AmmarCipher (menu-driven, safer copy/paste via Base64)
- Simple student-friendly cipher
- Multi-round (default 3) with evolving keys derived from (passphrase + "Ammar")
- Ciphertext is base64 so it's safe to copy/paste
"""
import base64
import getpass

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

def get_rounds_input(prompt="Enter number of rounds (default=3): "):
    s = input(prompt).strip()
    if s == "":
        return 3
    try:
        r = int(s)
        return max(1, r)
    except ValueError:
        print("Invalid number — using default 3.")
        return 3

def main():
    print("=== AmmarCipher (base64-safe) ===")
    while True:
        print("\nMenu:")
        print("1) Encrypt a message")
        print("2) Decrypt a message (paste base64 token)")
        print("3) Exit")
        choice = input("Choice (1/2/3): ").strip()
        if choice == "1":
            msg = input("Enter message to encrypt: ")
            pwd = getpass.getpass("Enter password (hidden): ")
            rounds = get_rounds_input()
            token = encrypt_text(msg, pwd, rounds)
            print("\nEncrypted (base64 token) — copy/paste this safely:\n")
            print(token)
        elif choice == "2":
            token = input("Enter base64 encrypted token: ").strip()
            pwd = getpass.getpass("Enter password (hidden): ")
            rounds = get_rounds_input("Enter number of rounds used during encryption (default=3): ")
            plaintext, err = decrypt_text(token, pwd, rounds)
            if err:
                print("\nError:", err)
            else:
                print("\nDecrypted plaintext:\n")
                print(plaintext)
        elif choice == "3":
            print("Goodbye!")
            break
        else:
            print("Invalid choice — choose 1, 2 or 3.")

if __name__ == "__main__":
    main()
