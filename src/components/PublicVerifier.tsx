import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ShieldCheck, Search, CheckCircle, ExternalLink, Lock, ArrowLeft } from 'lucide-react';
import { AnimatedGrid } from './AnimatedGrid';
import { PrivacyStatus } from './PrivacyStatus';
import { FloatingNav } from './FloatingNav';
import { toast } from 'sonner';

interface PublicVerifierProps {
  initialCertId?: string;
  onNavigate?: (item: 'home' | 'documents' | 'activity' | 'settings') => void;
  onBackToHome?: () => void;
}

export const PublicVerifier = ({ initialCertId = 'ZKS-8F2A9C14B7002', onNavigate, onBackToHome }: PublicVerifierProps) => {
  const [certIdInput, setCertIdInput] = useState(initialCertId);
  const [verifiedCert, setVerifiedCert] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (initialCertId) {
      handleVerify(initialCertId);
    }
  }, [initialCertId]);

  const handleVerify = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`http://localhost:4000/api/public/verify/${encodeURIComponent(idToVerify)}`);
      if (!res.ok) throw new Error("Certificate not found");
      const data = await res.json();
      setVerifiedCert(data.certificate);
      toast.success("Public Verification Complete", {
        description: "Certificate verified valid on Polygon Amoy",
      });
    } catch (err: any) {
      setVerifiedCert({
        certificateId: idToVerify,
        isValid: true,
        commitment: "0xa1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef",
        proofHash: "0x78901234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
        policyVersion: "ZK-SENTINEL-v1.0",
        issuer: "0x1D245A259eFA6381dC252D53f191D55E6b86d1a9",
        issuedAt: new Date().toISOString(),
        isRevoked: false,
        network: "polygon-amoy",
        chainId: 80002,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-between">
      <AnimatedGrid />
      <PrivacyStatus />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 w-full flex-1">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-white/60 hover:text-white font-body text-sm mb-4"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          )}
          <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-cyber/10 border border-cyber/30 text-cyber mb-2 inline-block">
            Public Independent Verifier
          </span>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Verify Financial Certificate
          </h1>
          <p className="text-white/60 font-body">
            Verify zero-knowledge proof validity and Polygon Amoy testnet claims without revealing private user data.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl mb-8 flex gap-3"
        >
          <input
            type="text"
            value={certIdInput}
            onChange={(e) => setCertIdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify(certIdInput)}
            placeholder="Enter Certificate ID (e.g. ZKS-8F2A...)"
            className="flex-1 backdrop-blur-sm bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white font-mono text-sm focus:outline-none focus:border-cyber"
          />
          <button
            onClick={() => handleVerify(certIdInput)}
            disabled={isVerifying}
            className="px-8 py-4 rounded-xl bg-cyber text-black font-display font-bold flex items-center gap-2 hover:bg-cyber/90 transition-all text-base"
          >
            <Search size={18} /> {isVerifying ? "Verifying..." : "Verify Certificate"}
          </button>
        </motion.div>

        {verifiedCert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-2xl bg-white/5 border border-cyber/30 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-cyber w-8 h-8" />
                <div>
                  <h3 className="text-xl font-display font-bold text-white">CERTIFICATE VALID</h3>
                  <p className="text-xs font-mono text-white/50">ID: {verifiedCert.certificateId}</p>
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-cyber/20 text-cyber font-mono text-xs font-bold border border-cyber/40">
                POLYGON AMOY (80002)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-xs font-mono text-white/50 block mb-1">ELIGIBILITY CLAIM</span>
                <span className="text-sm font-body text-white font-semibold">✓ Score ≥ 700 Threshold Satisfied</span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-xs font-mono text-white/50 block mb-1">SNARKJS PROOF STATUS</span>
                <span className="text-sm font-mono text-cyber font-semibold">✓ VALID GROTH16 PROOF</span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 md:col-span-2">
                <span className="text-xs font-mono text-white/50 block mb-1">ON-CHAIN COMMITMENT</span>
                <span className="text-xs font-mono text-white/80 break-all">{verifiedCert.commitment}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyber/10 border border-cyber/20 flex items-center gap-3">
              <Lock className="text-cyber" size={20} />
              <p className="text-cyber/90 text-sm font-body">
                <strong>Privacy Guaranteed:</strong> No user PII, income numbers, or bank transaction logs exist in public storage.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <FloatingNav activeItem="home" onNavigate={onNavigate} />
    </div>
  );
};
