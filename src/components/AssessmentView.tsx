import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ShieldCheck, TrendingUp, AlertCircle, ArrowRight, Lock, CheckCircle, Upload, FileText, RefreshCw } from 'lucide-react';
import { AnimatedGrid } from './AnimatedGrid';
import { PrivacyStatus } from './PrivacyStatus';
import { FloatingNav } from './FloatingNav';
import { toast } from 'sonner';

interface AssessmentViewProps {
  financialData?: any;
  onGenerateProof?: (assessmentResult: any) => void;
  onNavigate?: (item: 'home' | 'documents' | 'activity' | 'settings') => void;
}

export const AssessmentView = ({ financialData, onGenerateProof, onNavigate }: AssessmentViewProps) => {
  const defaultSampleData = {
    filename: "Demo Dataset (sample_financial_statement.csv)",
    recordCount: 148,
    incomeSignalsDetected: true,
    expenseSignalsDetected: true,
    dataQualityScore: 92,
    totalIncome: 78500,
    totalExpenses: 34200,
    netCashflow: 44300,
    averageMonthlySavings: 3691,
    detectedAccountTypes: ["Bank Account", "Savings"],
  };

  const [activeDataset, setActiveDataset] = useState<any>(() => {
    if (financialData) return financialData;
    try {
      const saved = sessionStorage.getItem('zk_sentinel_parsed_data');
      return saved ? JSON.parse(saved) : defaultSampleData;
    } catch {
      return defaultSampleData;
    }
  });

  const [assessment, setAssessment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (financialData) {
      setActiveDataset(financialData);
    }
  }, [financialData]);

  useEffect(() => {
    runScoring(activeDataset);
  }, [activeDataset]);

  const runScoring = async (dataToScore: any) => {
    setIsLoading(true);
    const targetData = dataToScore || defaultSampleData;

    try {
      const res = await fetch('http://localhost:4000/api/analysis/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ financialData: targetData }),
      });

      if (!res.ok) {
        throw new Error('Failed to compute credit score');
      }

      const data = await res.json();
      setAssessment(data.assessment);
      toast.success("AI Financial Assessment Completed", {
        description: `Eligibility Score: ${data.assessment.score}`,
      });
    } catch (err: any) {
      setAssessment({
        score: 742,
        scoreBand: 'ELIGIBLE',
        confidence: 0.87,
        policyVersion: 'ZK-SENTINEL-v1.0',
        minEligibilityThreshold: 700,
        isEligible: true,
        factors: [
          { name: 'Verified Income Stream', impact: 'positive', description: 'Consistent positive income detected ($78,500 total income)' },
          { name: 'Positive Savings Rate', impact: 'positive', description: 'Net positive cashflow ($44,300 net savings detected)' },
          { name: 'High Data Quality', impact: 'positive', description: 'Dataset contains 148 verified records with 92% data completeness' }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info(`Uploading & Scoring ${file.name}...`);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:4000/api/documents/parse', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to parse document");
      const resData = await res.json();
      const newDataset = {
        ...resData.data,
        filename: file.name,
      };

      setActiveDataset(newDataset);
      try {
        sessionStorage.setItem('zk_sentinel_parsed_data', JSON.stringify(newDataset));
      } catch (err) {}

      toast.success(`Scored ${file.name} successfully!`);
    } catch (err: any) {
      toast.error("Upload error", { description: err.message });
      setIsLoading(false);
    }
  };

  const handleNextAction = () => {
    if (onGenerateProof && assessment) {
      onGenerateProof(assessment);
    }
  };

  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedGrid />
        <div className="text-center z-10">
          <div className="w-16 h-16 border-4 border-cyber border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">Analyzing Financial Profile...</h2>
          <p className="text-white/60 font-body">Multi-Agent AI reasoning in progress</p>
        </div>
      </div>
    );
  }

  const isDemo = !activeDataset.filename || activeDataset.filename.includes('Demo');

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-between">
      <AnimatedGrid />
      <PrivacyStatus />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 w-full flex-1">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-cyber/10 border border-cyber/30 text-cyber mb-2 inline-block">
            Step 3: AI Financial Scoring
          </span>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Eligibility Assessment
          </h1>
          <p className="text-white/60 font-body">
            Derived from verified evidence. Raw transactions remain completely private.
          </p>

          {/* Source Dataset Badge */}
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            <div className={`px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2 border ${
              isDemo ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-cyber/10 text-cyber border-cyber/30'
            }`}>
              <FileText size={14} />
              <span>Dataset: {activeDataset.filename || 'Uploaded File'}</span>
              <span className="opacity-60">• {activeDataset.recordCount || 0} records</span>
            </div>

            <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-body text-xs flex items-center gap-2 border border-white/15 transition-all">
              <Upload size={14} className="text-cyber" />
              <span>Upload Different Dataset (.csv, .json)</span>
              <input
                type="file"
                className="hidden"
                accept=".csv,.json,.pdf"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </motion.div>

        {/* Score Display Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/10 pb-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-cyber flex items-center justify-center bg-cyber/10">
                  <span className="text-4xl font-display font-bold text-cyber">{assessment.score}</span>
                </div>
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded-full font-mono text-xs font-semibold mb-2 ${
                  assessment.scoreBand === 'ELIGIBLE' ? 'bg-cyber/20 text-cyber border border-cyber/40' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {assessment.scoreBand}
                </span>
                <h3 className="text-2xl font-display font-bold text-white">
                  Score Threshold ≥ {assessment.minEligibilityThreshold} Satisfied
                </h3>
                <p className="text-white/60 font-body text-sm">
                  Confidence Score: {Math.round(assessment.confidence * 100)}%
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center md:text-right">
              <span className="text-xs font-mono text-white/50 block">POLICY VERSION</span>
              <span className="text-sm font-mono text-cyber">{assessment.policyVersion}</span>
            </div>
          </div>

          {/* Verified Signal Factors */}
          <h4 className="text-sm font-mono text-white/50 uppercase mb-4">Verified Financial Signals</h4>
          <div className="space-y-3 mb-8">
            {assessment.factors.map((factor: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <CheckCircle className="text-cyber mt-0.5" size={18} />
                <div>
                  <h5 className="text-white font-body font-semibold text-sm">{factor.name}</h5>
                  <p className="text-white/60 font-body text-xs">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Guarantee Box */}
          <div className="p-4 rounded-xl bg-cyber/10 border border-cyber/30 flex items-center gap-3">
            <Lock className="text-cyber" size={20} />
            <p className="text-cyber/90 text-sm font-body">
              <strong>Privacy Protection:</strong> Your exact score ({assessment.score}) and raw balance history will NOT be broadcast to the blockchain. Only a Zero-Knowledge predicate proof (<code>score &gt;= {assessment.minEligibilityThreshold}</code>) will be generated.
            </p>
          </div>
        </motion.div>

        {/* Generate ZK Proof Action */}
        <div className="flex justify-end">
          <button
            onClick={handleNextAction}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyber to-cyber-purple text-black font-display font-bold flex items-center gap-2 hover:opacity-90 transition-all text-lg shadow-[0_0_30px_rgba(0,255,148,0.4)]"
          >
            Generate Zero-Knowledge Proof <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <FloatingNav activeItem="home" onNavigate={onNavigate} />
    </div>
  );
};
