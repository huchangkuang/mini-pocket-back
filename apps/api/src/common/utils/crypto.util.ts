import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest();
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns a string in the format "iv:ciphertext:authTag" (all base64-encoded).
 */
export function encrypt(plaintext: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${encrypted.toString('base64')}:${authTag.toString('base64')}`;
}

/**
 * Decrypt a ciphertext produced by encrypt().
 */
export function decrypt(encoded: string, secret: string): string {
  const key = deriveKey(secret);
  const [ivB64, cipherB64, authTagB64] = encoded.split(':');
  if (!ivB64 || !cipherB64 || !authTagB64) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(cipherB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
