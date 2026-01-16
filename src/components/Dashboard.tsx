import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { AnimatedGrid } from './AnimatedGrid';
import { DigitalPassport } from './DigitalPassport';
import { AnalysisFlow } from './AnalysisFlow';
import { FloatingNav } from './FloatingNav';
import { PrivacyStatus } from './PrivacyStatus';
import { toast } from 'sonner';

export const Dashboard = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userName] = useState('Traveler');
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveItem = () => {
    switch (location.pathname) {
      case '/documents':
        return 'documents';
      case '/activity':
        return 'activity';
      case '/settings':
        return 'settings';
      default:
        return 'home';
    }
  };

  const handleNavigate = (item: 'home' | 'documents' | 'activity' | 'settings') => {
    switch (item) {
      case 'home':
        navigate('/');
        break;
      case 'documents':
        navigate('/documents');
        break;
      case 'activity':
        navigate('/activity');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  const handleFileUpload = () => {
    toast.success('Document uploaded successfully', {
      description: 'Starting analysis...',
      duration: 2000,
    });
    setIsAnalyzing(true);
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    setIsVerified(true);
    toast.success('Verification complete!', {
      description: 'Your Financial Passport is ready.',
      duration: 3000,
    });
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <AnimatedGrid />
      <PrivacyStatus />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-display font-bold text-white mb-2">
            Hello, {userName}
          </h1>
          <p className="text-white/60 font-body text-lg">
            Your secure gateway to decentralized finance
          </p>
        </motion.div>

        <div className="mb-12">
          <DigitalPassport
            isVerified={isVerified}
            creditScore={isVerified ? 780 : undefined}
            riskLevel={isVerified ? 'Low' : undefined}
            maxLoanEligibility={isVerified ? '$50,000' : undefined}
          />
        </div>

        {!isVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-display font-semibold text-white mb-4">
                Get Started
              </h3>
              <p className="text-white/70 font-body mb-6 leading-relaxed">
                Upload your financial documents to generate your Zero-Knowledge proof
                and unlock instant credit verification.
              </p>

              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative block w-full cursor-pointer group"
              >
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.json"
                  onChange={handleFileUpload}
                />
                <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-white/20 group-hover:border-cyber/50 transition-colors p-12 text-center">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyber/5 to-cyber-purple/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <Upload className="w-12 h-12 text-white/40 group-hover:text-cyber transition-colors mx-auto mb-4" />
                  <p className="text-white/80 font-body mb-2">
                    Drop your financial documents here
                  </p>
                  <p className="text-white/50 text-sm font-body">
                    Supports PDF and JSON formats
                  </p>
                </div>
              </motion.label>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-xl bg-cyber/5 border border-cyber/20"
              >
                <p className="text-cyber/90 text-sm font-body text-center">
                  Sentinel is paying the gas fees for you...
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {isVerified && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto grid grid-cols-3 gap-6"
          >
            {[
              { label: 'Active Loans', value: '0', color: 'cyber' },
              { label: 'Total Borrowed', value: '$0', color: 'cyber-purple' },
              { label: 'Reputation Score', value: '100%', color: 'cyber' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 text-center"
              >
                <p className="text-white/60 font-body text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-display font-bold text-${stat.color}`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <FloatingNav activeItem={getActiveItem()} onNavigate={handleNavigate} />

      {isAnalyzing && <AnalysisFlow onComplete={handleAnalysisComplete} />}
    </div>
  );
};
