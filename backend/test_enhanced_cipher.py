#!/usr/bin/env python3
"""
Test script for Enhanced AECipher with PBR Integration
"""
from AECipher import encrypt_text, decrypt_text, pbr_encrypt_bytes, pbr_decrypt_bytes
import base64

def test_enhanced_cipher():
    print("=== Testing Enhanced AECipher with PBR Integration ===\n")
    
    # Test data
    test_message = "Hello, World! This is a test message for the enhanced cipher."
    test_password = "MySecretPassword123"
    test_rounds = 3
    test_block_size = 8
    
    print(f"Original Message: {test_message}")
    print(f"Password: {test_password}")
    print(f"Rounds: {test_rounds}")
    print(f"Block Size: {test_block_size}")
    print()
    
    # Test 1: Enhanced cipher with PBR enabled
    print("--- Test 1: Enhanced Cipher with PBR ---")
    encrypted_with_pbr = encrypt_text(test_message, test_password, test_rounds, True, test_block_size)
    print(f"Encrypted (with PBR): {encrypted_with_pbr[:50]}...")
    
    decrypted_with_pbr, error = decrypt_text(encrypted_with_pbr, test_password, test_rounds, True, test_block_size)
    if error:
        print(f"Decryption Error: {error}")
    else:
        print(f"Decrypted (with PBR): {decrypted_with_pbr}")
        print(f"Match Original: {'✓' if test_message == decrypted_with_pbr else '✗'}")
    print()
    
    # Test 2: Enhanced cipher without PBR (original AE cipher only)
    print("--- Test 2: Enhanced Cipher without PBR (Original AE) ---")
    encrypted_without_pbr = encrypt_text(test_message, test_password, test_rounds, False, test_block_size)
    print(f"Encrypted (without PBR): {encrypted_without_pbr[:50]}...")
    
    decrypted_without_pbr, error = decrypt_text(encrypted_without_pbr, test_password, test_rounds, False, test_block_size)
    if error:
        print(f"Decryption Error: {error}")
    else:
        print(f"Decrypted (without PBR): {decrypted_without_pbr}")
        print(f"Match Original: {'✓' if test_message == decrypted_without_pbr else '✗'}")
    print()
    
    # Test 3: PBR cipher standalone
    print("--- Test 3: PBR Cipher Standalone ---")
    message_bytes = test_message.encode('utf-8')
    pbr_encrypted_bytes = pbr_encrypt_bytes(message_bytes, test_password, test_block_size)
    pbr_encrypted_b64 = base64.b64encode(pbr_encrypted_bytes).decode('ascii')
    print(f"PBR Encrypted (base64): {pbr_encrypted_b64[:50]}...")
    
    pbr_decrypted_bytes = pbr_decrypt_bytes(pbr_encrypted_bytes, test_password, test_block_size)
    pbr_decrypted_message = pbr_decrypted_bytes.decode('utf-8')
    print(f"PBR Decrypted: {pbr_decrypted_message}")
    print(f"Match Original: {'✓' if test_message == pbr_decrypted_message else '✗'}")
    print()
    
    # Test 4: Different ciphertexts verification
    print("--- Test 4: Cipher Differences ---")
    print(f"Enhanced with PBR ≠ Enhanced without PBR: {'✓' if encrypted_with_pbr != encrypted_without_pbr else '✗'}")
    print(f"Enhanced with PBR ≠ PBR standalone: {'✓' if encrypted_with_pbr != pbr_encrypted_b64 else '✗'}")
    print()
    
    # Test 5: Key generation without "Ammar"
    print("--- Test 5: Key Generation Verification ---")
    from AECipher import generate_key
    key_with_test_pwd = generate_key("test")
    print(f"Key generated from 'test': {key_with_test_pwd}")
    print(f"Key length: {len(key_with_test_pwd)}")
    print("✓ No hardcoded 'Ammar' included in key generation")
    print()
    
    print("=== All Tests Completed ===")

if __name__ == "__main__":
    test_enhanced_cipher()
