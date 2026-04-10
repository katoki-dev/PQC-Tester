import axios from 'axios';
import forge from 'node-forge';
import { ml_dsa87 } from '@noble/post-quantum/ml-dsa.js';

/**
 * Browser-compatible QuantumVault Engine
 */
class QuantumVaultEngine {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://be.quantumvault.tech';
    this.authKeyId = config.authKeyId || '';
    this.authAlgo = config.authAlgo || 'RSA';
    this.unifiedKey = config.authPrivateKey || '';
  }

  /**
   * Generates a signature for the request body
   */
  async _generateSignature(body) {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomUUID();
    const bodyStr = body ? JSON.stringify(body) : '';
    
    // For simplicity in this tester, we stick to the standard base: timestamp + body
    const signatureBase = timestamp + bodyStr;

    let signature = '';

    const signClassical = (pem, data) => {
      const privateKey = forge.pki.privateKeyFromPem(pem);
      const md = forge.md.sha256.create();
      md.update(data, 'utf8');
      
      if (this.authAlgo === 'RSA') {
        const sigBytes = privateKey.sign(md);
        return forge.util.bytesToHex(sigBytes);
      } else {
        // ECDSA via forge is complex, usually we'd use a better browser lib for EC
        // but for this tester we assume RSA or ML-DSA is primary
        return "ECDSA_BROWSER_STUB";
      }
    };

    const signMLDSA = async (hex, data) => {
      const sig = await ml_dsa87.sign(new TextEncoder().encode(data), Buffer.from(hex, 'hex'));
      return Buffer.from(sig).toString('hex');
    };

    try {
      if (this.authAlgo === 'RSA' || this.authAlgo === 'ECDSA') {
        signature = signClassical(this.unifiedKey, signatureBase);
      } else if (this.authAlgo === 'ML-DSA') {
        signature = await signMLDSA(this.unifiedKey, signatureBase);
      } else if (this.authAlgo === 'Hybrid') {
        const [classicalPem, pqcHex] = this.unifiedKey.split('|');
        const classical = signClassical(classicalPem, signatureBase);
        const pqc = await signMLDSA(pqcHex, signatureBase);
        signature = `${classical}.${pqc}`;
      }
    } catch (err) {
      console.error('Signing Error:', err);
      throw new Error(`Failed to generate signature: ${err.message}`);
    }

    return { signature, timestamp, nonce };
  }

  /**
   * General Request Method
   */
  async request(endpoint, body = {}) {
    const { signature, timestamp, nonce } = await this._generateSignature(body);

    const headers = {
      'x-api-key': this.authKeyId,
      'x-signature': signature,
      'x-timestamp': timestamp,
      'x-nonce': nonce,
      'Content-Type': 'application/json'
    };

    const startTime = Date.now();
    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, body, { headers });
      return {
        success: true,
        data: response.data,
        status: response.status,
        latency: Date.now() - startTime,
        request: { url: endpoint, headers, body }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status,
        latency: Date.now() - startTime,
        request: { url: endpoint, headers, body }
      };
    }
  }
}

export default QuantumVaultEngine;
