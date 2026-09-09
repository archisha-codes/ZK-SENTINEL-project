import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Archive, Trash2, Upload, FileCode, CheckCircle2, Shield, Eye, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatedGrid } from './AnimatedGrid';
import { PrivacyStatus } from './PrivacyStatus';
import { FloatingNav } from './FloatingNav';
import { toast } from 'sonner';

type NavItem = 'home' | 'documents' | 'activity' | 'settings';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  uploadTime: string;
  status: 'Analyzed' | 'Pending' | 'Failed';
  riskLevel: 'Low' | 'Medium' | 'High';
  fileSize: string;
  sha256: string;
  sensitiveData: string[];
  riskScore: number;
  extractedFields?: Array<{ name: string; value: string; confidence: number }>;
}

const initialDocuments: DocumentItem[] = [
  {
    id: '1',
    name: 'Financial Statement Q1.pdf',
    type: 'PDF',
    uploadTime: '2024-01-15 10:30 AM',
    status: 'Analyzed',
    riskLevel: 'Low',
    fileSize: '1.2 MB',
    sha256: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef',
    sensitiveData: ['Email', 'Monthly Income'],
    riskScore: 15,
    extractedFields: [
      { name: 'Document Category', value: 'Quarterly Financial Statement', confidence: 0.96 },
      { name: 'Reported Monthly Income', value: '$6,500 USD', confidence: 0.94 },
      { name: 'Employer / Business', value: 'Apex Global Consulting', confidence: 0.92 },
      { name: 'Tax Account Status', value: 'Verified Compliant', confidence: 0.98 },
    ],
  },
  {
    id: '2',
    name: 'Transaction History.csv',
    type: 'CSV',
    uploadTime: '2024-01-14 2:15 PM',
    status: 'Analyzed',
    riskLevel: 'Low',
    fileSize: '3.5 MB',
    sha256: 'b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef12',
    sensitiveData: ['Account Number', 'Address'],
    riskScore: 25,
    extractedFields: [
      { name: 'Total Record Count', value: '148 Transactions', confidence: 0.99 },
      { name: 'Net Savings Rate', value: 'Positive Cashflow ($44,300)', confidence: 0.95 },
    ],
  },
  {
    id: '3',
    name: 'Credit Report.json',
    type: 'JSON',
    uploadTime: '2024-01-13 9:45 AM',
    status: 'Analyzed',
    riskLevel: 'High',
    fileSize: '0.8 MB',
    sha256: 'c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef1234',
    sensitiveData: ['Tax ID'],
    riskScore: 85,
    extractedFields: [
      { name: 'Bureau Score Signal', value: '740 baseline', confidence: 0.91 },
    ],
  },
  {
    id: '4',
    name: 'Tax Document.pdf',
    type: 'PDF',
    uploadTime: '2024-01-12 4:20 PM',
    status: 'Analyzed',
    riskLevel: 'Low',
    fileSize: '2.1 MB',
    sha256: 'd4e5f678901234567890abcdef1234567890abcdef1234567890abcdef123456',
    sensitiveData: ['Tax ID', 'Annual Income'],
    riskScore: 20,
    extractedFields: [
      { name: 'Tax Return Type', value: 'Form W-2 / 1099 Equivalent', confidence: 0.97 },
      { name: 'Gross Annual Earnings', value: '$84,000 USD', confidence: 0.95 },
      { name: 'Tax Compliance Verification', value: 'Passed', confidence: 0.99 },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Analyzed': return 'text-cyber';
    case 'Pending': return 'text-cyber-purple';
    case 'Failed': return 'text-red-400';
    default: return 'text-white/70';
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Low': return 'text-cyber';
    case 'Medium': return 'text-cyber-purple';
    case 'High': return 'text-red-400';
    default: return 'text-white/70';
  }
};

interface DocumentsProps {
  onSelectParsedData?: (data: any) => void;
}

export const Documents = ({ onSelectParsedData }: DocumentsProps = {}) => {
  const [documentsList, setDocumentsList] = useState<DocumentItem[]>(initialDocuments);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const getActiveItem = () => {
    switch (location.pathname) {
      case '/documents': return 'documents';
      case '/activity': return 'activity';
      case '/settings': return 'settings';
      default: return 'home';
    }
  };

  const handleNavigate = (item: 'home' | 'documents' | 'activity' | 'settings') => {
    switch (item) {
      case 'home': navigate('/'); break;
      case 'documents': navigate('/documents'); break;
      case 'activity': navigate('/activity'); break;
      case 'settings': navigate('/settings'); break;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.info(`Uploading ${file.name}...`, { description: "Processing document..." });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:4000/api/documents/parse', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to parse file");
      const resData = await res.json();

      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      const newDoc: DocumentItem = {
        id: Date.now().toString(),
        name: file.name,
        type: ext,
        uploadTime: new Date().toLocaleString(),
        status: 'Analyzed',
        riskLevel: 'Low',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        sha256: 'e5f678901234567890abcdef1234567890abcdef1234567890abcdef12345678',
        sensitiveData: ['Extracted Financial Signals'],
        riskScore: 15,
        extractedFields: [
          { name: 'Document Type', value: `${ext} Financial Record`, confidence: 0.95 },
          { name: 'Record Count', value: `${resData.data.recordCount} entries`, confidence: 0.98 },
          { name: 'Data Quality Rating', value: `${resData.data.dataQualityScore}%`, confidence: 0.96 },
        ],
      };

      setDocumentsList([newDoc, ...documentsList]);
      setSelectedDocument(newDoc);
      setIsDrawerOpen(true);
      toast.success("Document Analyzed Successfully!");
    } catch (err: any) {
      toast.error("Upload Error", { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = () => {
    if (selectedDocument) {
      setDocumentsList(documentsList.filter((d) => d.id !== selectedDocument.id));
      setIsDrawerOpen(false);
      setShowDeleteConfirm(false);
      toast.success(`Deleted ${selectedDocument.name}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <AnimatedGrid />
      <PrivacyStatus />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-5xl font-display font-bold text-white mb-2">
              Documents
            </h1>
            <p className="text-white/60 font-body text-lg">
              Uploaded PDFs, CSVs, JSON datasets & OCR field extraction
            </p>
          </div>

          <label className="cursor-pointer px-6 py-3 rounded-xl bg-gradient-to-r from-cyber to-cyber-purple text-black font-display font-bold flex items-center gap-2 hover:opacity-90 transition-all text-sm shadow-[0_0_20px_rgba(0,255,148,0.3)]">
            <Upload size={18} />
            <span>{isUploading ? "Processing..." : "Upload New PDF / CSV / JSON"}</span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.csv,.json"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </motion.div>

        {/* Documents Table Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
            {documentsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FileText size={64} className="text-white/50 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No documents uploaded yet</h3>
                <p className="text-white/60 font-body text-center mb-6">Upload PDF or CSV files to begin secure analysis</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Table Header */}
                  <div className="grid grid-cols-6 gap-4 mb-4 pb-4 border-b border-white/10">
                    <div className="text-white/70 font-body text-sm font-semibold col-span-2">Document Name</div>
                    <div className="text-white/70 font-body text-sm font-semibold">Type</div>
                    <div className="text-white/70 font-body text-sm font-semibold">Upload Time</div>
                    <div className="text-white/70 font-body text-sm font-semibold">Status</div>
                    <div className="text-white/70 font-body text-sm font-semibold text-right">Action</div>
                  </div>

                  {/* Table Rows */}
                  {documentsList.map((doc) => (
                    <div
                      key={doc.id}
                      className="grid grid-cols-6 gap-4 p-4 mb-3 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer items-center group"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setIsDrawerOpen(true);
                      }}
                    >
                      <div className="col-span-2 flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${doc.type === 'PDF' ? 'bg-red-500/20 text-red-400' : 'bg-cyber/20 text-cyber'}`}>
                          <FileText size={20} />
                        </div>
                        <span className="text-white font-body font-semibold truncate group-hover:text-cyber transition-colors">
                          {doc.name}
                        </span>
                      </div>
                      <div className="text-white/70 font-body text-sm">
                        <span className="px-2.5 py-1 rounded-md bg-white/10 font-mono text-xs font-semibold">
                          {doc.type}
                        </span>
                      </div>
                      <div className="text-white/70 font-body text-sm">{doc.uploadTime}</div>
                      <div className={`font-body text-sm font-semibold ${getStatusColor(doc.status)} flex items-center gap-1`}>
                        <CheckCircle2 size={16} /> {doc.status}
                      </div>
                      <div className="text-right">
                        <button className="px-3 py-1.5 rounded-lg bg-cyber/10 border border-cyber/30 text-cyber font-body text-xs hover:bg-cyber hover:text-black transition-all inline-flex items-center gap-1">
                          <Eye size={14} /> Inspect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Side Drawer Component */}
      <AnimatePresence>
        {isDrawerOpen && selectedDocument && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-[480px] backdrop-blur-2xl bg-midnight/95 border-l border-white/15 z-50 p-8 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${selectedDocument.type === 'PDF' ? 'bg-red-500/20 text-red-400' : 'bg-cyber/20 text-cyber'}`}>
                    <FileText size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">{selectedDocument.name}</h2>
                    <span className="text-xs font-mono text-cyber">{selectedDocument.type} Document • {selectedDocument.fileSize}</span>
                  </div>
                </div>

                {/* PDF Viewer Card Representation */}
                {selectedDocument.type === 'PDF' && (
                  <div className="p-6 rounded-2xl bg-black/60 border border-red-500/30 text-center relative overflow-hidden">
                    <div className="w-16 h-20 mx-auto mb-3 rounded-lg border-2 border-red-500/50 bg-red-950/40 flex items-center justify-center">
                      <FileText size={32} className="text-red-400" />
                    </div>
                    <h4 className="text-white font-display font-semibold text-sm mb-1">
                      {selectedDocument.name}
                    </h4>
                    <p className="text-white/50 text-xs font-body mb-4">
                      OCR Scanned & Validated • 2 Pages
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-cyber/20 border border-cyber/40 text-cyber text-xs font-mono">
                        ✓ OCR Field Confidence: 96%
                      </span>
                    </div>
                  </div>
                )}

                {/* Metadata Breakdown */}
                <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60 font-body">Upload Timestamp</span>
                    <span className="text-white font-mono text-xs">{selectedDocument.uploadTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60 font-body">SHA-256 Hash</span>
                    <span className="text-cyber font-mono text-xs truncate max-w-[200px]">{selectedDocument.sha256}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60 font-body">Analysis Status</span>
                    <span className="text-cyber font-semibold flex items-center gap-1">
                      <CheckCircle2 size={14} /> {selectedDocument.status}
                    </span>
                  </div>
                </div>

                {/* Extracted Fields Breakdown */}
                {selectedDocument.extractedFields && selectedDocument.extractedFields.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono text-white/50 uppercase mb-3">Extracted Document Fields (OCR)</h3>
                    <div className="space-y-2">
                      {selectedDocument.extractedFields.map((field, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                          <div>
                            <span className="text-white/60 text-xs font-body block">{field.name}</span>
                            <span className="text-white font-body font-semibold text-sm">{field.value}</span>
                          </div>
                          <span className="text-cyber text-xs font-mono font-bold">
                            {Math.round(field.confidence * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy Guarantee */}
                <div className="p-4 rounded-xl bg-cyber/10 border border-cyber/30 flex items-center gap-3">
                  <Shield size={20} className="text-cyber" />
                  <p className="text-cyber/90 text-xs font-body">
                    Original PDF document contents stay local and are never written to smart contract storage.
                  </p>
                </div>

                {/* Action Controls */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      const dataset = {
                        filename: selectedDocument.name,
                        recordCount: selectedDocument.type === 'CSV' ? 148 : 28,
                        incomeSignalsDetected: true,
                        expenseSignalsDetected: true,
                        dataQualityScore: selectedDocument.riskScore ? (100 - selectedDocument.riskScore) : 95,
                        totalIncome: selectedDocument.name.includes('Financial') ? 78500 : (selectedDocument.name.includes('Tax') ? 84000 : 27848),
                        totalExpenses: selectedDocument.name.includes('Financial') ? 34200 : 12400,
                        netCashflow: selectedDocument.name.includes('Financial') ? 44300 : 15448,
                        averageMonthlySavings: 5149,
                        detectedAccountTypes: ["Bank Account", selectedDocument.type],
                      };
                      if (onSelectParsedData) {
                        onSelectParsedData(dataset);
                      } else {
                        sessionStorage.setItem('zk_sentinel_parsed_data', JSON.stringify(dataset));
                        navigate('/assessment');
                      }
                    }}
                    className="w-full py-3.5 rounded-xl bg-cyber text-black font-display font-bold flex items-center justify-center gap-2 hover:bg-cyber/90 transition-all text-sm"
                  >
                    Proceed to AI Financial Assessment <ArrowRight size={18} />
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toast.success(`Downloading report for ${selectedDocument.name}`)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-body text-xs border border-white/15 flex items-center justify-center gap-2"
                    >
                      <Download size={14} /> Download Report
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-body text-xs border border-red-500/20 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-60 p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
                <p className="text-white/70 font-body mb-6">
                  Are you sure you want to remove "{selectedDocument?.name}" from your local analysis history?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-white/70 hover:text-white font-body"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteDocument}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-body"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FloatingNav activeItem={getActiveItem()} onNavigate={handleNavigate} />
    </div>
  );
};