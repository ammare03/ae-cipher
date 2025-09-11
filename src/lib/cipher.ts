/**
 * Enhanced AE Cipher with PBR Integration - TypeScript Implementation
 * Port of the enhanced Python cipher algorithm
 */

export function generateKeyStream(text: string, keyword: string): string {
  const keywordChars = Array.from(keyword);
  if (text.length === keyword.length) {
    return keyword;
  } else {
    const keyStream: string[] = [];
    for (let i = 0; i < text.length; i++) {
      keyStream.push(keywordChars[i % keywordChars.length]);
    }
    return keyStream.join("");
  }
}

export function generateKey(passphrase: string): number[] {
  // Create numeric key bytes from passphrase (removed hardcoded 'Ammar')
  return Array.from(passphrase).map((ch) => ch.charCodeAt(0) % 256);
}

export function evolveKey(oldKey: number[]): number[] {
  // Evolve key deterministically for the next round
  return oldKey.map((val) => (val * 7 + 3) % 256);
}

export function pbrEncryptBytes(
  dataBytes: Uint8Array,
  keyword: string,
  blockSize: number = 8
): Uint8Array {
  // Convert bytes to string for PBR processing
  let plaintext = Array.from(dataBytes)
    .map((b) => String.fromCharCode(b))
    .join("");

  // 0. Padding
  const paddingChar = "~";
  if (plaintext.length % blockSize !== 0) {
    const paddingNeeded = blockSize - (plaintext.length % blockSize);
    plaintext += paddingChar.repeat(paddingNeeded);
  }

  // 1. Key Stream Generation
  const keyStream = generateKeyStream(plaintext, keyword);

  // 2. Polyalphabetic Substitution
  let shiftedText = "";
  for (let i = 0; i < plaintext.length; i++) {
    const plainCharCode = plaintext.charCodeAt(i);
    const keyCharCode = keyStream.charCodeAt(i);

    // Shift based on the key character's ASCII value
    const shiftedCharCode = (plainCharCode + keyCharCode) % 256;
    shiftedText += String.fromCharCode(shiftedCharCode);
  }

  // 3. Block Transposition (Reversal)
  let ciphertext = "";
  for (let i = 0; i < shiftedText.length; i += blockSize) {
    const block = shiftedText.substring(i, i + blockSize);
    ciphertext += block.split("").reverse().join(""); // Reverse the block
  }

  // Convert back to bytes
  return new Uint8Array(Array.from(ciphertext).map((c) => c.charCodeAt(0)));
}

export function pbrDecryptBytes(
  cipherBytes: Uint8Array,
  keyword: string,
  blockSize: number = 8
): Uint8Array {
  // Convert bytes to string for PBR processing
  const ciphertext = Array.from(cipherBytes)
    .map((b) => String.fromCharCode(b))
    .join("");

  // 1. Reverse the Block Transposition
  let reversedBlocksText = "";
  for (let i = 0; i < ciphertext.length; i += blockSize) {
    const block = ciphertext.substring(i, i + blockSize);
    reversedBlocksText += block.split("").reverse().join("");
  }

  // 2. Key Stream Generation
  const keyStream = generateKeyStream(reversedBlocksText, keyword);

  // 3. Reverse Polyalphabetic Substitution
  let plaintext = "";
  for (let i = 0; i < reversedBlocksText.length; i++) {
    const cipherCharCode = reversedBlocksText.charCodeAt(i);
    const keyCharCode = keyStream.charCodeAt(i);

    // Shift back
    const originalCharCode = (cipherCharCode - keyCharCode + 256) % 256;
    plaintext += String.fromCharCode(originalCharCode);
  }

  // 4. Remove Padding
  const paddingChar = "~";
  plaintext = plaintext.replace(new RegExp(`${paddingChar}+$`), "");

  // Convert back to bytes
  return new Uint8Array(Array.from(plaintext).map((c) => c.charCodeAt(0)));
}

export function encryptOnceBytes(
  ptBytes: Uint8Array,
  key: number[]
): Uint8Array {
  const out = new Uint8Array(ptBytes.length);
  for (let i = 0; i < ptBytes.length; i++) {
    const shift = key[i % key.length];
    out[i] = (ptBytes[i] + shift) % 256;
  }
  return out;
}

export function decryptOnceBytes(
  ctBytes: Uint8Array,
  key: number[]
): Uint8Array {
  const out = new Uint8Array(ctBytes.length);
  for (let i = 0; i < ctBytes.length; i++) {
    const shift = key[i % key.length];
    out[i] = (ctBytes[i] - shift + 256) % 256;
  }
  return out;
}

export function encryptText(
  plaintext: string,
  passphrase: string,
  rounds: number = 3,
  usePbr: boolean = true,
  blockSize: number = 8
): string {
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

export function decryptText(
  b64cipher: string,
  passphrase: string,
  rounds: number = 3,
  usePbr: boolean = true,
  blockSize: number = 8
): { result: string | null; error: string | null } {
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
          error: `PBR decryption error: ${
            e instanceof Error ? e.message : String(e)
          }`,
        };
      }
    }

    // Decode to text
    const text = new TextDecoder().decode(data);
    return { result: text, error: null };
  } catch (e) {
    return {
      result: null,
      error: `Decryption error: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
