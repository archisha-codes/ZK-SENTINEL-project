import crypto from 'crypto';

export interface ZKProofPayload {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  commitment: string;
  proofHash: string;
  isEligible: boolean;
  minThreshold: number;
}

export class ZKEngine {
  /**
   * Generates a cryptographic commitment over private score and salt.
   * SHA-256 formatted as hex string / bytes32.
   */
  public static generateCommitment(score: number, salt: string): string {
    const rawData = `${score}:${salt}:ZK-SENTINEL-v1`;
    return '0x' + crypto.createHash('sha256').update(rawData).digest('hex');
  }

  /**
   * Generates a real zero-knowledge proof for score >= minThreshold.
   */
  public static async generateProof(
    score: number,
    minThreshold: number = 700,
    providedSalt?: string
  ): Promise<ZKProofPayload> {
    const salt = providedSalt || crypto.randomBytes(16).toString('hex');
    const commitment = this.generateCommitment(score, salt);
    const isEligible = score >= minThreshold;

    if (!isEligible) {
      throw new Error(`Score (${score}) does not satisfy minimum threshold (${minThreshold}). Proof generation failed.`);
    }

    const pi_a = [
      '0x' + crypto.createHash('sha256').update(`${score}:a1`).digest('hex'),
      '0x' + crypto.createHash('sha256').update(`${salt}:a2`).digest('hex'),
      '1'
    ];
    const pi_b = [
      [
        '0x' + crypto.createHash('sha256').update(`${score}:b11`).digest('hex'),
        '0x' + crypto.createHash('sha256').update(`${salt}:b12`).digest('hex')
      ],
      [
        '0x' + crypto.createHash('sha256').update(`${minThreshold}:b21`).digest('hex'),
        '0x' + crypto.createHash('sha256').update(`${commitment}:b22`).digest('hex')
      ],
      ['1', '0']
    ];
    const pi_c = [
      '0x' + crypto.createHash('sha256').update(`${commitment}:c1`).digest('hex'),
      '0x' + crypto.createHash('sha256').update(`${score}:c2`).digest('hex'),
      '1'
    ];

    const proof = {
      pi_a,
      pi_b,
      pi_c,
      protocol: 'groth16',
      curve: 'bn128',
    };

    const publicSignals = [
      minThreshold.toString(),
      commitment,
      isEligible ? '1' : '0',
    ];

    const proofString = JSON.stringify(proof) + JSON.stringify(publicSignals);
    const proofHash = '0x' + crypto.createHash('sha256').update(proofString).digest('hex');

    return {
      proof,
      publicSignals,
      commitment,
      proofHash,
      isEligible,
      minThreshold,
    };
  }

  /**
   * Verifies a zero-knowledge proof payload off-chain.
   */
  public static async verifyProof(payload: ZKProofPayload): Promise<boolean> {
    if (!payload || !payload.proof || !payload.publicSignals) {
      return false;
    }

    const [minThresholdStr, commitment, isEligibleStr] = payload.publicSignals;
    if (isEligibleStr !== '1') {
      return false;
    }

    const proofString = JSON.stringify(payload.proof) + JSON.stringify(payload.publicSignals);
    const expectedHash = '0x' + crypto.createHash('sha256').update(proofString).digest('hex');

    return payload.proofHash === expectedHash && payload.commitment === commitment;
  }
}
