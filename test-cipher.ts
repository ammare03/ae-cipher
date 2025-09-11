/**
 * Simple test to verify TypeScript cipher implementation
 * Run with: npx tsx test-cipher.ts
 */

import { encryptText, decryptText } from "./src/lib/cipher";

function testCipher() {
  console.log("Testing AVS Cipher TypeScript Implementation\n");

  const testCases = [
    {
      plaintext: "Hello, World!",
      password: "test123",
      rounds: 3,
    },
    {
      plaintext:
        "This is a longer test message with special characters: !@#$%^&*()",
      password: "mySecretPassword",
      rounds: 5,
    },
    {
      plaintext: "Unicode test: 🔐 🌟 ✨",
      password: "unicode",
      rounds: 2,
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const { plaintext, password, rounds } = testCases[i];

    console.log(`Test Case ${i + 1}:`);
    console.log(`Original: "${plaintext}"`);
    console.log(`Password: "${password}"`);
    console.log(`Rounds: ${rounds}`);

    // Encrypt
    const encrypted = encryptText(plaintext, password, rounds);
    console.log(`Encrypted: ${encrypted}`);

    // Decrypt
    const { result: decrypted, error } = decryptText(
      encrypted,
      password,
      rounds
    );

    if (error) {
      console.log(`❌ Error: ${error}`);
    } else if (decrypted === plaintext) {
      console.log(`✅ Success: Decryption matches original`);
    } else {
      console.log(`❌ Failure: Decrypted text doesn't match`);
      console.log(`Expected: "${plaintext}"`);
      console.log(`Got: "${decrypted}"`);
    }

    console.log("---\n");
  }
}

testCipher();
