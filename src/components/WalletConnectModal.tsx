import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Wallet, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (walletAddress: string) => void;
}

export const WalletConnectModal = ({ isOpen, onClose, onConnected }: WalletConnectModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = (walletName: string) => {
    setIsConnecting(true);
    toast.info(`Connecting to ${walletName}...`, { description: "Requesting Polygon Amoy Testnet permissions" });

    setTimeout(() => {
      setIsConnecting(false);
      const mockAddress = "0x1D245A259eFA6381dC252D53f191D55E6b86d1a9";
      toast.success("Wallet Connected", {
        description: `Connected: ${mockAddress.substring(0, 6)}...${mockAddress.substring(38)} on Polygon Amoy (80002)`,
      });
      onConnected(mockAddress);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-md w-full backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-8 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-cyber/20 text-cyber">
              <Wallet size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-white">Connect Wallet</h3>
              <p className="text-white/60 font-body text-sm">Polygon Amoy Testnet (Chain ID 80002)</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {['MetaMask', 'WalletConnect', 'Coinbase Wallet'].map((wallet, idx) => (
              <button
                key={idx}
                disabled={isConnecting}
                onClick={() => handleConnectWallet(wallet)}
                className="w-full flex items-center justify-between p-4 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-body text-white text-left group"
              >
                <span className="font-semibold text-sm">{wallet}</span>
                <ArrowRight size={18} className="text-white/40 group-hover:text-cyber transition-colors" />
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-white/40 font-body">
            Only public certificate hash & proof signature will be broadcast on-chain.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
