import { EncryptedPayload, HashResult, PasswordEntropy } from '../types';

// Convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Derive AES-256-GCM Key using PBKDF2 with 100,000 iterations
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plain text using AES-256-GCM
export async function encryptText(plainText: string, password: string, hint?: string): Promise<string> {
  if (!password) throw new Error('Passord er påkrevd for kryptering');
  
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for GCM
  const key = await deriveKey(password, salt);
  
  const enc = new TextEncoder();
  const encodedText = enc.encode(plainText);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    key,
    encodedText
  );

  const payload: EncryptedPayload = {
    version: '2.0',
    algorithm: 'AES-GCM-256',
    kdf: 'PBKDF2',
    iterations: 100000,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(encryptedBuffer),
    tagLength: 128,
    timestamp: Date.now(),
    hint: hint ? hint.trim() : undefined
  };

  return JSON.stringify(payload, null, 2);
}

// Decrypt ciphertext using AES-256-GCM
export async function decryptText(payloadString: string, password: string): Promise<string> {
  if (!password) throw new Error('Passord er påkrevd for dekryptering');
  
  let payload: EncryptedPayload;
  try {
    payload = JSON.parse(payloadString.trim());
  } catch {
    throw new Error('Ugyldig format. Forventet JSON-kryptert pakke.');
  }

  if (payload.algorithm !== 'AES-GCM-256' && payload.algorithm !== ('AES-GCM' as any)) {
    throw new Error(`Ustøttet krypteringsalgoritme: ${payload.algorithm}`);
  }

  const salt = new Uint8Array(base64ToBuffer(payload.salt));
  const iv = new Uint8Array(base64ToBuffer(payload.iv));
  const cipherBuffer = base64ToBuffer(payload.ciphertext);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: payload.tagLength || 128
      },
      key,
      cipherBuffer
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    throw new Error('Dekryptering feilet! Feil passord eller dataene er blitt manipulert.');
  }
}

// Binary File Header for Safe Packaging:
// 4 bytes: MAGIC 'CYBV'
// 2 bytes: metadata JSON length
// N bytes: metadata JSON { originalName, mimeType, size, saltB64, ivB64 }
// Rest: encrypted binary stream (AES-GCM)
const MAGIC_BYTES = new Uint8Array([0x43, 0x59, 0x42, 0x56]); // 'CYBV'

export async function encryptFile(
  file: File,
  password: string
): Promise<{ blob: Blob; fileName: string; size: number }> {
  const fileBuffer = await file.arrayBuffer();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128
    },
    key,
    fileBuffer
  );

  const meta = {
    originalName: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    salt: bufferToBase64(salt),
    iv: bufferToBase64(iv),
    timestamp: Date.now()
  };

  const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
  const metaLength = metaBytes.length;

  // Build binary container
  const header = new Uint8Array(4 + 2 + metaLength);
  header.set(MAGIC_BYTES, 0);
  header[4] = (metaLength >> 8) & 0xff;
  header[5] = metaLength & 0xff;
  header.set(metaBytes, 6);

  const finalBlob = new Blob([header, encryptedBuffer], {
    type: 'application/x-cybervault'
  });

  return {
    blob: finalBlob,
    fileName: `${file.name}.cybervault`,
    size: finalBlob.size
  };
}

export async function decryptFile(
  file: File,
  password: string
): Promise<{ blob: Blob; originalFileName: string; mimeType: string }> {
  const arrayBuf = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuf);

  if (uint8.length < 6) {
    throw new Error('Filen er for liten til å være en gyldig CyberVault-fil.');
  }

  // Check magic bytes
  for (let i = 0; i < 4; i++) {
    if (uint8[i] !== MAGIC_BYTES[i]) {
      throw new Error('Ugyldig filhode. Filen er ikke en kryptert CyberVault-pakke.');
    }
  }

  const metaLen = (uint8[4] << 8) | uint8[5];
  if (uint8.length < 6 + metaLen) {
    throw new Error('Korrupt filformat: Metadata mangler.');
  }

  const metaBytes = uint8.slice(6, 6 + metaLen);
  const metaStr = new TextDecoder().decode(metaBytes);
  const meta = JSON.parse(metaStr);

  const cipherBytes = uint8.slice(6 + metaLen);
  const salt = new Uint8Array(base64ToBuffer(meta.salt));
  const iv = new Uint8Array(base64ToBuffer(meta.iv));

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      key,
      cipherBytes
    );

    const decryptedBlob = new Blob([decryptedBuffer], {
      type: meta.mimeType || 'application/octet-stream'
    });

    return {
      blob: decryptedBlob,
      originalFileName: meta.originalName || 'dekryptert_fil.bin',
      mimeType: meta.mimeType || 'application/octet-stream'
    };
  } catch {
    throw new Error('Dekryptering feilet. Feil passord eller filen er korrupt.');
  }
}

// Compute Hashes (SHA-256, SHA-512, SHA-384, SHA-1, MD5)
export async function computeHashes(data: ArrayBuffer | string): Promise<HashResult> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data).buffer : data;

  const [sha256Buf, sha512Buf, sha384Buf, sha1Buf] = await Promise.all([
    window.crypto.subtle.digest('SHA-256', buffer),
    window.crypto.subtle.digest('SHA-512', buffer),
    window.crypto.subtle.digest('SHA-384', buffer),
    window.crypto.subtle.digest('SHA-1', buffer)
  ]);

  const toHex = (buf: ArrayBuffer) =>
    Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

  const md5Hex = computeMD5(new Uint8Array(buffer));

  return {
    sha256: toHex(sha256Buf),
    sha512: toHex(sha512Buf),
    sha384: toHex(sha384Buf),
    sha1: toHex(sha1Buf),
    md5: md5Hex
  };
}

// Simple fast MD5 implementation for client-side checksum comparison
function computeMD5(data: Uint8Array): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  const n = data.length;
  const words: number[] = [];
  for (let i = 0; i < n; i++) {
    words[i >> 2] |= data[i] << ((i % 4) * 8);
  }
  words[n >> 2] |= 0x80 << ((n % 4) * 8);
  const wordCount = (((n + 8) >> 6) + 1) * 16;
  for (let i = (n >> 2) + 1; i < wordCount; i++) words[i] = 0;
  words[wordCount - 2] = (n * 8) & 0xffffffff;
  words[wordCount - 1] = Math.floor((n * 8) / 0x100000000);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < words.length; i += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, words[i + 0], 7, 0xd76aa478);
    d = FF(d, a, b, c, words[i + 1], 12, 0xe8c7b756);
    c = FF(c, d, a, b, words[i + 2], 17, 0x242070db);
    b = FF(b, c, d, a, words[i + 3], 22, 0xc1bdceee);
    a = FF(a, b, c, d, words[i + 4], 7, 0xf57c0faf);
    d = FF(d, a, b, c, words[i + 5], 12, 0x4787c62a);
    c = FF(c, d, a, b, words[i + 6], 17, 0xa8304613);
    b = FF(b, c, d, a, words[i + 7], 22, 0xfd469501);
    a = FF(a, b, c, d, words[i + 8], 7, 0x698098d8);
    d = FF(d, a, b, c, words[i + 9], 12, 0x8b44f7af);
    c = FF(c, d, a, b, words[i + 10], 17, 0xffff5bb1);
    b = FF(b, c, d, a, words[i + 11], 22, 0x895cd7be);
    a = FF(a, b, c, d, words[i + 12], 7, 0x6b901122);
    d = FF(d, a, b, c, words[i + 13], 12, 0xfd987193);
    c = FF(c, d, a, b, words[i + 14], 17, 0xa679438e);
    b = FF(b, c, d, a, words[i + 15], 22, 0x49b40821);

    a = GG(a, b, c, d, words[i + 1], 5, 0xf61e2562);
    d = GG(d, a, b, c, words[i + 6], 9, 0xc040b340);
    c = GG(c, d, a, b, words[i + 11], 14, 0x265e5a51);
    b = GG(b, c, d, a, words[i + 0], 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, words[i + 5], 5, 0xd62f105d);
    d = GG(d, a, b, c, words[i + 10], 9, 0x02441453);
    c = GG(c, d, a, b, words[i + 15], 14, 0xd8a1e681);
    b = GG(b, c, d, a, words[i + 4], 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, words[i + 9], 5, 0x21e1cde6);
    d = GG(d, a, b, c, words[i + 14], 9, 0xc33707d6);
    c = GG(c, d, a, b, words[i + 3], 14, 0xf4d50d87);
    b = GG(b, c, d, a, words[i + 8], 20, 0x455a14ed);
    a = GG(a, b, c, d, words[i + 13], 5, 0xa9e3e905);
    d = GG(d, a, b, c, words[i + 2], 9, 0xfcefa3f8);
    c = GG(c, d, a, b, words[i + 7], 14, 0x676f02d9);
    b = GG(b, c, d, a, words[i + 12], 20, 0x8d2a4c8a);

    a = HH(a, b, c, d, words[i + 5], 4, 0xfffa3942);
    d = HH(d, a, b, c, words[i + 8], 11, 0x8771f681);
    c = HH(c, d, a, b, words[i + 11], 16, 0x6d9d6122);
    b = HH(b, c, d, a, words[i + 14], 23, 0xfde5380c);
    a = HH(a, b, c, d, words[i + 1], 4, 0xa4beea44);
    d = HH(d, a, b, c, words[i + 4], 11, 0x4bdecfa9);
    c = HH(c, d, a, b, words[i + 7], 16, 0xf6bb4b60);
    b = HH(b, c, d, a, words[i + 10], 23, 0xbebfbc70);
    a = HH(a, b, c, d, words[i + 13], 4, 0x289b7ec6);
    d = HH(d, a, b, c, words[i + 0], 11, 0xeaa127fa);
    c = HH(c, d, a, b, words[i + 3], 16, 0xd4ef3085);
    b = HH(b, c, d, a, words[i + 6], 23, 0x04881d05);
    a = HH(a, b, c, d, words[i + 9], 4, 0xd9d4d039);
    d = HH(d, a, b, c, words[i + 12], 11, 0xe6db99e5);
    c = HH(c, d, a, b, words[i + 15], 16, 0x1fa27cf8);
    b = HH(b, c, d, a, words[i + 2], 23, 0xc4ac5665);

    a = II(a, b, c, d, words[i + 0], 6, 0xf4292244);
    d = II(d, a, b, c, words[i + 7], 10, 0x432aff97);
    c = II(c, d, a, b, words[i + 14], 15, 0xab9423a7);
    b = II(b, c, d, a, words[i + 5], 21, 0xfc93a039);
    a = II(a, b, c, d, words[i + 12], 6, 0x655b59c3);
    d = II(d, a, b, c, words[i + 3], 10, 0x8f0ccc92);
    c = II(c, d, a, b, words[i + 10], 15, 0xffeff47d);
    b = II(b, c, d, a, words[i + 1], 21, 0x85845dd1);
    a = II(a, b, c, d, words[i + 8], 6, 0x6fa87e4f);
    d = II(d, a, b, c, words[i + 15], 10, 0xfe2ce6e0);
    c = II(c, d, a, b, words[i + 6], 15, 0xa3014314);
    b = II(b, c, d, a, words[i + 13], 21, 0x4e0811a1);
    a = II(a, b, c, d, words[i + 4], 6, 0xf7537e82);
    d = II(d, a, b, c, words[i + 11], 10, 0xbd3af235);
    c = II(c, d, a, b, words[i + 2], 15, 0x2ad7d2bb);
    b = II(b, c, d, a, words[i + 9], 21, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  const wordToHex = (val: number) => {
    let str = '';
    for (let i = 0; i < 4; i++) {
      const byte = (val >>> (i * 8)) & 0xff;
      str += byte.toString(16).padStart(2, '0');
    }
    return str;
  };

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

// Calculate Password Entropy and brute-force resistance
export function calculatePasswordEntropy(pwd: string): PasswordEntropy {
  if (!pwd) {
    return {
      score: 0,
      bits: 0,
      crackTimeText: '0 sekunder',
      verdict: 'Kritisk svak',
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSpecial: false,
      length: 0,
      warnings: ['Ingen passord angitt']
    };
  }

  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSpecial) poolSize += 33;

  const bits = Math.round(pwd.length * Math.log2(Math.max(poolSize, 2)));

  // Crack time estimation based on 100 billion guesses/second (modern GPU cluster)
  const guessesPerSec = 1e11;
  const combinations = Math.pow(poolSize, pwd.length);
  const secondsToCrack = combinations / guessesPerSec;

  let crackTimeText = '';
  if (secondsToCrack < 1) crackTimeText = 'Umiddelbart (< 1 sekund)';
  else if (secondsToCrack < 60) crackTimeText = `${Math.round(secondsToCrack)} sekunder`;
  else if (secondsToCrack < 3600) crackTimeText = `${Math.round(secondsToCrack / 60)} minutter`;
  else if (secondsToCrack < 86400) crackTimeText = `${Math.round(secondsToCrack / 3600)} timer`;
  else if (secondsToCrack < 31536000) crackTimeText = `${Math.round(secondsToCrack / 86400)} dager`;
  else if (secondsToCrack < 31536000 * 1000) crackTimeText = `${Math.round(secondsToCrack / 31536000)} år`;
  else if (secondsToCrack < 31536000 * 1e9) crackTimeText = `${(secondsToCrack / (31536000 * 1e6)).toFixed(1)} millioner år`;
  else crackTimeText = 'Flere milliarder år (Uneknekkelig med dagens fysikk)';

  const warnings: string[] = [];
  if (pwd.length < 12) warnings.push('Lengde under 12 tegn er sårbar for moderne brute-force');
  if (!hasSpecial) warnings.push('Mangler spesialtegn (!@#$%^&*)');
  if (!hasNumber) warnings.push('Mangler tall');
  if (!hasUpper) warnings.push('Mangler store bokstaver');
  if (/(.)\1{2,}/.test(pwd)) warnings.push('Inneholder repeterende tegn');
  if (/1234|abcd|password|qwerty|admin/i.test(pwd)) warnings.push('Inneholder kjente ordbok-sekvenser');

  let verdict: PasswordEntropy['verdict'] = 'Kritisk svak';
  let score = Math.min(100, Math.round((bits / 128) * 100));

  if (bits < 40) {
    verdict = 'Kritisk svak';
    score = Math.min(25, score);
  } else if (bits < 60) {
    verdict = 'Svak';
    score = Math.min(50, score);
  } else if (bits < 80) {
    verdict = 'Moderat';
    score = Math.min(75, score);
  } else if (bits < 100) {
    verdict = 'Sterk';
    score = Math.min(90, score);
  } else {
    verdict = 'Militærgrad';
    score = 100;
  }

  return {
    score,
    bits,
    crackTimeText,
    verdict,
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial,
    length: pwd.length,
    warnings
  };
}

// Cryptographically secure password generator
export function generateSecurePassword(
  length = 24,
  includeUpper = true,
  includeLower = true,
  includeNumbers = true,
  includeSymbols = true
): string {
  let chars = '';
  if (includeLower) chars += 'abcdefghijkmnopqrstuvwxyz'; // excluding ambiguous 'l'
  if (includeUpper) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // excluding ambiguous 'I', 'O'
  if (includeNumbers) chars += '23456789'; // excluding 0, 1
  if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!chars) chars = 'abcdefghijkmnopqrstuvwxyz23456789';

  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}
