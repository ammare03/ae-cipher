/**
 * AE Cipher implementation in TypeScript
 * Port of the Python cipher algorithm
 */

export function generateKey(passphrase: string): number[] {
  // Create numeric key bytes from passphrase + 'Ammar'
  const combined = passphrase + "Ammar";
  return Array.from(combined).map(ch => ch.charCodeAt(0) % 256);
}

export function evolveKey(oldKey: number[]): number[] {
  // Evolve key deterministically for the next round
  return oldKey.map(val => (val * 7 + 3) % 256);
}

export function encryptOnceBytes(ptBytes: Uint8Array, key: number[]): Uint8Array {
  const out = new Uint8Array(ptBytes.length);
  for (let i = 0; i < ptBytes.length; i++) {
    const shift = key[i % key.length];
    out[i] = (ptBytes[i] + shift) % 256;
  }
  return out;
}

export function decryptOnceBytes(ctBytes: Uint8Array, key: number[]): Uint8Array {
  const out = new Uint8Array(ctBytes.length);
  for (let i = 0; i < ctBytes.length; i++) {
    const shift = key[i % key.length];
    out[i] = (ctBytes[i] - shift + 256) % 256;
  }
  return out;
}

export function encryptText(plaintext: string, passphrase: string, rounds: number = 3): string {
  let data = new TextEncoder().encode(plaintext);
  let key = generateKey(passphrase);
  
  for (let i = 0; i < rounds; i++) {
    data = new Uint8Array(encryptOnceBytes(data, key));
    key = evolveKey(key);
  }
  
  return btoa(String.fromCharCode(...data));
}

export function decryptText(b64cipher: string, passphrase: string, rounds: number = 3): { result: string | null, error: string | null } {
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
    
    // Apply inverse in reverse order
    for (let i = keys.length - 1; i >= 0; i--) {
      data = new Uint8Array(decryptOnceBytes(data, keys[i]));
    }
    
    // Decode to text
    const text = new TextDecoder().decode(data);
    return { result: text, error: null };
    
  } catch (e) {
    return { result: null, error: `Decryption error: ${e instanceof Error ? e.message : String(e)}` };
  }
}
