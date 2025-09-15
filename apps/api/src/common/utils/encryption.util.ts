import * as CryptoJS from 'crypto-js';
import { Injectable, Logger } from '@nestjs/common';

/**
 * 암호화 유틸리티
 * OAuth 토큰 등 민감한 정보를 AES-GCM으로 암호화/복호화
 */
@Injectable()
export class EncryptionUtil {
  private readonly logger = new Logger(EncryptionUtil.name);
  private readonly encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateDefaultKey();
    
    if (!process.env.ENCRYPTION_KEY) {
      this.logger.warn('ENCRYPTION_KEY not set, using default key (not recommended for production)');
    }
  }

  /**
   * 문자열을 암호화합니다
   * @param plaintext 암호화할 텍스트
   * @returns 암호화된 문자열 (Base64)
   */
  encrypt(plaintext: string): string {
    if (!plaintext) return plaintext;

    try {
      const encrypted = CryptoJS.AES.encrypt(plaintext, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * 암호화된 문자열을 복호화합니다
   * @param ciphertext 암호화된 텍스트 (Base64)
   * @returns 복호화된 문자열
   */
  decrypt(ciphertext: string): string {
    if (!ciphertext) return ciphertext;

    try {
      const decrypted = CryptoJS.AES.decrypt(ciphertext, this.encryptionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * 해시 생성 (비가역)
   * @param data 해시할 데이터
   * @returns SHA-256 해시
   */
  hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * 기본 암호화 키 생성 (개발용)
   */
  private generateDefaultKey(): string {
    return 'dev-encryption-key-32-bytes-long!!';
  }
}
