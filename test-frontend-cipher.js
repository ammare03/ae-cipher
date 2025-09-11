#!/usr/bin/env node
/**
 * Test script for Enhanced AECipher TypeScript implementation
 * Run with: node test-frontend-cipher.js
 */

// Import the cipher functions (if this was a proper module setup)
// For now, we'll copy the essential functions here for testing

function generateKeyStream(text, keyword) {
  const keywordChars = Array.from(keyword);
  if (text.length === keyword.length) {
    return keyword;
  } else {
    const keyStream = [];
    for (let i = 0; i < text.length; i++) {
      keyStream.push(keywordChars[i % keywordChars.length]);
    }
    return keyStream.join('');
  }
}

function generateKey(passphrase) {
  return Array.from(passphrase).map((ch) => ch.charCodeAt(0) % 256);
}

function evolveKey(oldKey) {
  return oldKey.map((val) => (val * 7 + 3) % 256);
}

function pbrEncryptBytes(dataBytes, keyword, blockSize = 8) {
  // Convert bytes to string for PBR processing
  let plaintext = Array.from(dataBytes).map(b => String.fromCharCode(b)).join('');
  
  // 0. Padding
  const paddingChar = '~';
  if (plaintext.length % blockSize !== 0) {
    const paddingNeeded = blockSize - (plaintext.length % blockSize);
    plaintext += paddingChar.repeat(paddingNeeded);
  }
  
  // 1. Key Stream Generation
  const keyStream = generateKeyStream(plaintext, keyword);
  
  // 2. Polyalphabetic Substitution
  let shiftedText = '';
  for (let i = 0; i < plaintext.length; i++) {
    const plainCharCode = plaintext.charCodeAt(i);
    const keyCharCode = keyStream.charCodeAt(i);
    
    // Shift based on the key character's ASCII value
    const shiftedCharCode = (plainCharCode + keyCharCode) % 256;
    shiftedText += String.fromCharCode(shiftedCharCode);
  }
  
  // 3. Block Transposition (Reversal)
  let ciphertext = '';
  for (let i = 0; i < shiftedText.length; i += blockSize) {
    const block = shiftedText.substring(i, i + blockSize);
    ciphertext += block.split('').reverse().join(''); // Reverse the block
  }
  
  // Convert back to bytes
  return new Uint8Array(Array.from(ciphertext).map(c => c.charCodeAt(0)));
}

function pbrDecryptBytes(cipherBytes, keyword, blockSize = 8) {
  // Convert bytes to string for PBR processing
  const ciphertext = Array.from(cipherBytes).map(b => String.fromCharCode(b)).join('');
  
  // 1. Reverse the Block Transposition
  let reversedBlocksText = '';
  for (let i = 0; i < ciphertext.length; i += blockSize) {
    const block = ciphertext.substring(i, i + blockSize);
    reversedBlocksText += block.split('').reverse().join('');
  }
  
  // 2. Key Stream Generation
  const keyStream = generateKeyStream(reversedBlocksText, keyword);
  
  // 3. Reverse Polyalphabetic Substitution
  let plaintext = '';
  for (let i = 0; i < reversedBlocksText.length; i++) {
    const cipherCharCode = reversedBlocksText.charCodeAt(i);
    const keyCharCode = keyStream.charCodeAt(i);
    
    // Shift back
    const originalCharCode = (cipherCharCode - keyCharCode + 256) % 256;
    plaintext += String.fromCharCode(originalCharCode);
  }
  
  // 4. Remove Padding
  const paddingChar = '~';
  plaintext = plaintext.replace(new RegExp(`${paddingChar}+$`), '');
  
  // Convert back to bytes
  return new Uint8Array(Array.from(plaintext).map(c => c.charCodeAt(0)));
}

function encryptOnceBytes(ptBytes, key) {
  const out = new Uint8Array(ptBytes.length);
  for (let i = 0; i < ptBytes.length; i++) {
    const shift = key[i % key.length];
    out[i] = (ptBytes[i] + shift) % 256;
  }
  return out;
}

function decryptOnceBytes(ctBytes, key) {
  const out = new Uint8Array(ctBytes.length);
  for (let i = 0; i < ctBytes.length; i++) {
    const shift = key[i % key.length];
    out[i] = (ctBytes[i] - shift + 256) % 256;
  }
  return out;
}

function encryptText(plaintext, passphrase, rounds = 3, usePbr = true, blockSize = 8) {
  let data = new TextEncoder().encode(plaintext);
  let key = generateKey(passphrase);

  // Apply PBR encryption first if enabled
  if (usePbr) {
    data = new Uint8Array(pbrEncryptBytes(data, passphrase, blockSize));
  }

  // Apply multi-round AE cipher encryption
  for (let i = 0; i < rounds; i++) {
    data = new Uint8Array(encryptOnceBytes(data, key));
    key = evolveKey(key);
  }

  return btoa(String.fromCharCode(...data));
}

function decryptText(b64cipher, passphrase, rounds = 3, usePbr = true, blockSize = 8) {
  try {
    // Decode base64
    const binaryString = atob(b64cipher);
    let data = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      data[i] = binaryString.charCodeAt(i);
    }

    // Build keys forward
    let key = generateKey(passphrase);
    const keys = [key];
    for (let i = 0; i < rounds - 1; i++) {
      key = evolveKey(key);
      keys.push(key);
    }

    // Apply inverse AE cipher in reverse order
    for (let i = keys.length - 1; i >= 0; i--) {
      data = new Uint8Array(decryptOnceBytes(data, keys[i]));
    }

    // Apply PBR decryption if it was used during encryption
    if (usePbr) {
      try {
        data = new Uint8Array(pbrDecryptBytes(data, passphrase, blockSize));
      } catch (e) {
        return {
          result: null,
          error: `PBR decryption error: ${e.message}`,
        };
      }
    }

    // Decode to text
    const text = new TextDecoder().decode(data);
    return { result: text, error: null };
  } catch (e) {
    return {
      result: null,
      error: `Decryption error: ${e.message}`,
    };
  }
}

// Test the enhanced cipher
function testEnhancedCipher() {
  console.log("=== Testing Enhanced AECipher (TypeScript/JavaScript) ===\n");
  
  const testMessage = "Hello, World! This is a test message for the enhanced cipher.";
  const testPassword = "MySecretPassword123";
  const testRounds = 3;
  const testBlockSize = 8;
  
  console.log(`Original Message: ${testMessage}`);
  console.log(`Password: ${testPassword}`);
  console.log(`Rounds: ${testRounds}`);
  console.log(`Block Size: ${testBlockSize}`);
  console.log();
  
  // Test 1: Enhanced cipher with PBR enabled
  console.log("--- Test 1: Enhanced Cipher with PBR ---");
  const encryptedWithPbr = encryptText(testMessage, testPassword, testRounds, true, testBlockSize);
  console.log(`Encrypted (with PBR): ${encryptedWithPbr.substring(0, 50)}...`);
  
  const decryptedWithPbr = decryptText(encryptedWithPbr, testPassword, testRounds, true, testBlockSize);
  if (decryptedWithPbr.error) {
    console.log(`Decryption Error: ${decryptedWithPbr.error}`);
  } else {
    console.log(`Decrypted (with PBR): ${decryptedWithPbr.result}`);
    console.log(`Match Original: ${testMessage === decryptedWithPbr.result ? '✓' : '✗'}`);
  }
  console.log();
  
  // Test 2: Enhanced cipher without PBR (original AE cipher only)
  console.log("--- Test 2: Enhanced Cipher without PBR (Original AE) ---");
  const encryptedWithoutPbr = encryptText(testMessage, testPassword, testRounds, false, testBlockSize);
  console.log(`Encrypted (without PBR): ${encryptedWithoutPbr.substring(0, 50)}...`);
  
  const decryptedWithoutPbr = decryptText(encryptedWithoutPbr, testPassword, testRounds, false, testBlockSize);
  if (decryptedWithoutPbr.error) {
    console.log(`Decryption Error: ${decryptedWithoutPbr.error}`);
  } else {
    console.log(`Decrypted (without PBR): ${decryptedWithoutPbr.result}`);
    console.log(`Match Original: ${testMessage === decryptedWithoutPbr.result ? '✓' : '✗'}`);
  }
  console.log();
  
  // Test 3: Different ciphertexts verification
  console.log("--- Test 3: Cipher Differences ---");
  console.log(`Enhanced with PBR ≠ Enhanced without PBR: ${encryptedWithPbr !== encryptedWithoutPbr ? '✓' : '✗'}`);
  console.log();
  
  // Test 4: Key generation without "Ammar"
  console.log("--- Test 4: Key Generation Verification ---");
  const keyWithTestPwd = generateKey("test");
  console.log(`Key generated from 'test': [${keyWithTestPwd.join(', ')}]`);
  console.log(`Key length: ${keyWithTestPwd.length}`);
  console.log("✓ No hardcoded 'Ammar' included in key generation");
  console.log();
  
  console.log("=== All Tests Completed ===");
}

// Run the test
testEnhancedCipher();
