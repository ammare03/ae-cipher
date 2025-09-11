#!/usr/bin/env python3
"""
Enhanced AVSCipher with PBR (Polyalphabetic Block-Reverse) Integration
- Combines multi-round encryption with polyalphabetic substitution and block transposition
- Multi-round (default 3) with evolving keys derived from passphrase
- Ciphertext is base64 so it's safe to copy/paste
- Integrates PBR cipher techniques for enhanced security
"""
import base64
import getpass
import math


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
    """Original AVS cipher encryption with key evolution"""
    out = bytearray(len(pt_bytes))
    for i, b in enumerate(pt_bytes):
        shift = key[i % len(key)]
        out[i] = (b + shift) % 256
    return bytes(out)


def decrypt_once_bytes(ct_bytes: bytes, key):
    """Original AVS cipher decryption with key evolution"""
    out = bytearray(len(ct_bytes))
    for i, b in enumerate(ct_bytes):
        shift = key[i % len(key)]
        out[i] = (b - shift) % 256
    return bytes(out)


def encrypt_text(plaintext: str, passphrase: str, rounds: int = 3, use_pbr: bool = True, block_size: int = 8) -> str:
    """Enhanced encryption combining AVS cipher with optional PBR techniques"""
    data = plaintext.encode('utf-8')
    key = generate_key(passphrase)

    # Apply PBR encryption first if enabled
    if use_pbr:
        data = pbr_encrypt_bytes(data, passphrase, block_size)

    # Apply multi-round AVS cipher encryption
    for _ in range(rounds):
        data = encrypt_once_bytes(data, key)
        key = evolve_key(key)

    return base64.b64encode(data).decode('ascii')


def decrypt_text(b64cipher: str, passphrase: str, rounds: int = 3, use_pbr: bool = True, block_size: int = 8):
    """Enhanced decryption combining AVS cipher with optional PBR techniques"""
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

    # Apply inverse AVS cipher in reverse order
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


def get_block_size_input(prompt="Enter block size for PBR (default=8): "):
    s = input(prompt).strip()
    if s == "":
        return 8
    try:
        r = int(s)
        return max(1, r)
    except ValueError:
        print("Invalid number — using default 8.")
        return 8


def get_pbr_choice(prompt="Use PBR enhancement? (y/n, default=y): "):
    s = input(prompt).strip().lower()
    return s != 'n' and s != 'no'


def main():
    print("=== Enhanced AVSCipher with PBR Integration ===")
    while True:
        print("\nMenu:")
        print("1) Encrypt a message")
        print("2) Decrypt a message (paste base64 token)")
        print("3) Test PBR cipher standalone")
        print("4) Exit")
        choice = input("Choice (1/2/3/4): ").strip()

        if choice == "1":
            msg = input("Enter message to encrypt: ")
            pwd = getpass.getpass("Enter password (hidden): ")
            rounds = get_rounds_input()
            use_pbr = get_pbr_choice()
            block_size = 8
            if use_pbr:
                block_size = get_block_size_input()

            token = encrypt_text(msg, pwd, rounds, use_pbr, block_size)
            print("\nEncrypted (base64 token) — copy/paste this safely:\n")
            print(token)
            print(
                f"\nEncryption settings: Rounds={rounds}, PBR={'Yes' if use_pbr else 'No'}, Block Size={block_size}")

        elif choice == "2":
            token = input("Enter base64 encrypted token: ").strip()
            pwd = getpass.getpass("Enter password (hidden): ")
            rounds = get_rounds_input(
                "Enter number of rounds used during encryption (default=3): ")
            use_pbr = get_pbr_choice(
                "Was PBR enhancement used during encryption? (y/n, default=y): ")
            block_size = 8
            if use_pbr:
                block_size = get_block_size_input(
                    "Enter block size used during encryption (default=8): ")

            plaintext, err = decrypt_text(
                token, pwd, rounds, use_pbr, block_size)
            if err:
                print("\nError:", err)
            else:
                print("\nDecrypted plaintext:\n")
                print(plaintext)

        elif choice == "3":
            # Standalone PBR cipher test
            print("\n=== PBR Cipher Standalone Test ===")
            message = input("Enter message to encrypt: ")
            keyword = input("Enter keyword: ")
            block_size = get_block_size_input()

            if not keyword.isalpha():
                print("\nError: Keyword should only contain letters.")
                continue

            # Convert to bytes and back for consistency with integrated version
            message_bytes = message.encode('utf-8')
            encrypted_bytes = pbr_encrypt_bytes(
                message_bytes, keyword, block_size)
            encrypted_b64 = base64.b64encode(encrypted_bytes).decode('ascii')

            print(f"\n--- PBR Encryption ---")
            print(f"Original Message:      {message}")
            print(f"Encrypted (base64):    {encrypted_b64}")

            # Decrypt
            decrypted_bytes = pbr_decrypt_bytes(
                encrypted_bytes, keyword, block_size)
            decrypted_message = decrypted_bytes.decode('utf-8')

            print(f"\n--- PBR Decryption ---")
            print(f"Decrypted Message:     {decrypted_message}")
            print(
                f"Match Original:        {'Yes' if message == decrypted_message else 'No'}")

        elif choice == "4":
            print("Goodbye!")
            break
        else:
            print("Invalid choice — choose 1, 2, 3, or 4.")


if __name__ == "__main__":
    main()
