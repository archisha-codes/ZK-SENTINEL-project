import { motion } from 'framer-motion';
import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Database, Download } from 'lucide-react';
import { AnimatedGrid } from './AnimatedGrid';
import { PrivacyStatus } from './PrivacyStatus';
import { FloatingNav } from './FloatingNav';
import { toast } from 'sonner';

interface DataUploadPreviewProps {
  onParsed: (parsedResult: any) => void;
  onNavigate: (item: 'home' | 'documents' | 'activity' | 'settings') => void;
}

export const DataUploadPreview = ({ onParsed, onNavigate }: DataUploadPreviewProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:4000/api/documents/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'File parsing failed');
      }

      const resData = await response.json();
      setParsedData(resData.data);
      toast.success("Dataset Parsed Successfully", {
        description: `${resData.data.recordCount} records processed safely.`,
      });
    } catch (err: any) {
      toast.error("Upload / Parsing Error", {
        description: err.message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUseDemoDataset = () => {
    setFileName("demo_financial_history.csv");
    const mockParsed = {
      recordCount: 148,
      incomeSignalsDetected: true,
      expenseSignalsDetected: true,
      dataQualityScore: 92,
      totalIncome: 78500,
      totalExpenses: 34200,
      netCashflow: 44300,
      averageMonthlySavings: 3691,
      detectedAccountTypes: ["Bank Account", "Savings"],
      recordsSummary: [
        { date: "2024-01-05", description: "Direct Deposit Salary", amount: 6500, type: "income" },
        { date: "2024-01-12", description: "Grocery Store", amount: 240, type: "expense" },
        { date: "2024-01-20", description: "Utility Payment", amount: 180, type: "expense" },
      ],
      warnings: [],
    };
    setParsedData(mockParsed);
    toast.info("Demo Dataset Loaded", {
      description: "148 records loaded for instant verification preview.",
    });
  };

  const downloadSampleCSV = () => {
    const csvContent = `date,description,amount,type,category
2024-01-02,"Monthly Salary Deposit",6500.00,income,"Payroll"
2024-01-03,"Metro Supermarket Grocery",-184.50,expense,"Groceries"
2024-01-05,"Electric Utility Bill",-125.00,expense,"Utilities"
2024-01-08,"Freelance Design Payment",1200.00,income,"Freelance"
2024-01-15,"Apartment Rent Payment",-1800.00,expense,"Housing"
2024-01-25,"Consulting Milestone Fee",2400.00,income,"Consulting"
2024-02-01,"Monthly Salary Deposit",6500.00,income,"Payroll"
2024-02-15,"Apartment Rent Payment",-1800.00,expense,"Housing"
2024-03-01,"Monthly Salary Deposit",6500.00,income,"Payroll"
2024-03-25,"Quarterly Bonus Payout",3200.00,income,"Bonus"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_financial_statement.csv';
    a.click();
    toast.success("Downloaded sample_financial_statement.csv");
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-between">
      <AnimatedGrid />
      <PrivacyStatus />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 w-full flex-1">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-cyber/10 border border-cyber/30 text-cyber mb-2 inline-block">
            Step 2: Financial Dataset Intelligence
          </span>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Upload Financial Documents
          </h1>
          <p className="text-white/60 font-body max-w-xl mx-auto">
            Upload your CSV or JSON transaction records. Privacy guaranteed: raw data is processed ephemerally and never written to the blockchain.
          </p>
        </motion.div>

        {/* Upload Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl mb-8"
        >
          <motion.label
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative block w-full cursor-pointer group"
          >
            <input
              type="file"
              className="hidden"
              accept=".csv,.json"
              onChange={handleFileUpload}
            />
            <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-white/20 group-hover:border-cyber/50 transition-colors p-10 text-center bg-black/30">
              <Upload className="w-14 h-14 text-white/40 group-hover:text-cyber transition-colors mx-auto mb-4" />
              <p className="text-white font-display text-lg mb-1">
                Drop your CSV or JSON dataset here
              </p>
              <p className="text-white/50 text-sm font-body mb-4">
                Supports standard financial transactions & credit statements (.csv, .json)
              </p>
              <span className="inline-block px-4 py-2 rounded-xl bg-white/10 text-white font-body text-xs group-hover:bg-cyber group-hover:text-black transition-all">
                Select File
              </span>
            </div>
          </motion.label>

          {/* Demo Data Quick Actions */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10 flex-wrap gap-4">
            <button
              onClick={downloadSampleCSV}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-body text-xs flex items-center gap-2 border border-white/15 transition-all"
            >
              <Download size={14} className="text-cyber" /> Download Sample CSV Dataset
            </button>
            <button
              onClick={handleUseDemoDataset}
              className="text-cyber text-sm font-body hover:underline flex items-center gap-1 font-semibold"
            >
              <Database size={14} /> Instant Load 148-Record Demo Dataset
            </button>
          </div>
        </motion.div>

        {/* Parsed Data Privacy-Safe Preview */}
        {parsedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-2xl bg-cyber/5 border border-cyber/30 rounded-3xl p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6 border-b border-cyber/20 pb-4">
              <div>
                <h3 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-cyber" size={24} /> Financial Data Signals Detected
                </h3>
                <p className="text-white/60 font-body text-sm">Source: {fileName || 'Uploaded Dataset'}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-display font-bold text-cyber">{parsedData.dataQualityScore}%</span>
                <p className="text-white/50 text-xs font-body">Data Quality Rating</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/50 text-xs font-body block mb-1">Total Records</span>
                <span className="text-2xl font-display font-bold text-white">{parsedData.recordCount}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/50 text-xs font-body block mb-1">Income Signal</span>
                <span className="text-sm font-body text-cyber flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={16} /> Verified
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/50 text-xs font-body block mb-1">Expense Signal</span>
                <span className="text-sm font-body text-cyber flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={16} /> Verified
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-white/50 text-xs font-body block mb-1">Privacy Protection</span>
                <span className="text-sm font-body text-white/80 font-semibold">🔒 Ephemeral</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => onParsed(parsedData)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyber to-cyber-purple text-black font-display font-bold flex items-center gap-2 hover:opacity-90 transition-all text-base"
              >
                Proceed to AI Financial Scoring <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <FloatingNav activeItem="documents" onNavigate={onNavigate} />
    </div>
  );
};
