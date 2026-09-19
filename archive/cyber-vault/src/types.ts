export type ActiveTab = 
  | 'text-vault' 
  | 'file-vault' 
  | 'steganography' 
  | 'hash-studio' 
  | 'password-audit' 
  | 'payload-decoder'
  | 'cyber-defense';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'secure';
  message: string;
  module: string;
}

export interface EncryptedPayload {
  version: string;
  algorithm: 'AES-GCM-256';
  kdf: 'PBKDF2';
  iterations: number;
  salt: string; // Base64
  iv: string;   // Base64
  ciphertext: string; // Base64
  tagLength: number;
  timestamp: number;
  hint?: string;
}

export interface HashResult {
  sha256: string;
  sha512: string;
  sha384: string;
  sha1: string;
  md5: string;
}

export interface PasswordEntropy {
  score: number; // 0 to 100
  bits: number;
  crackTimeText: string;
  verdict: 'Kritisk svak' | 'Svak' | 'Moderat' | 'Sterk' | 'Militærgrad';
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  length: number;
  warnings: string[];
}
