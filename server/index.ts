import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { DataParserService } from './services/dataParser.js';
import { ScoringEngine } from './services/scoringEngine.js';
import { VoiceService } from './services/voiceService.js';
import { ZKEngine } from './zk/zkEngine.js';
import { BlockchainService } from './services/blockchainService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File Upload Config (Memory Storage for Ephemeral Processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/json' ||
      file.mimetype === 'application/pdf' ||
      file.originalname.endsWith('.csv') ||
      file.originalname.endsWith('.json') ||
      file.originalname.endsWith('.pdf')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only CSV, JSON, and PDF datasets are allowed.'));
    }
  },
});

// Root Welcome Route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'ZK-Sentinel Core API',
    version: '1.0.0',
    network: 'Polygon Amoy Testnet (Chain ID 80002)',
    health: '/api/health',
    repository: 'https://github.com/archisha-codes/ZK-SENTINEL-project',
  });
});

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'ZK-Sentinel Core API',
    timestamp: new Date().toISOString(),
    network: 'Polygon Amoy Testnet (Chain ID 80002)',
  });
});

// 1. Voice / Text Turn Endpoint
app.post('/api/onboarding/turn', async (req: Request, res: Response) => {
  try {
    const { stepIndex = 0, transcript } = req.body;
    const response = await VoiceService.processVoiceTurn(Number(stepIndex), transcript);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Voice turn processing failed' });
  }
});

// 2. CSV / JSON / PDF Data Upload & Signal Parser
app.post('/api/documents/parse', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let fileContent = '';
    let filename = 'dataset.csv';

    if (req.file) {
      fileContent = req.file.buffer.toString('utf8');
      filename = req.file.originalname;
    } else if (req.body.content) {
      fileContent = req.body.content;
      filename = req.body.filename || 'dataset.json';
    } else {
      return res.status(400).json({ error: 'No file uploaded or content provided.' });
    }

    let parsedData;
    if (filename.endsWith('.pdf')) {
      parsedData = DataParserService.parsePDF(filename, fileContent);
    } else if (filename.endsWith('.json') || fileContent.trim().startsWith('{') || fileContent.trim().startsWith('[')) {
      parsedData = DataParserService.parseJSON(fileContent);
    } else {
      parsedData = DataParserService.parseCSV(fileContent);
    }

    res.json({
      status: 'success',
      filename,
      data: parsedData,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to parse financial dataset' });
  }
});

// 3. AI Financial Scoring Endpoint
app.post('/api/analysis/score', async (req: Request, res: Response) => {
  try {
    const { financialData, minThreshold = 700 } = req.body;
    if (!financialData) {
      return res.status(400).json({ error: 'Missing financialData in request body.' });
    }

    const scoreResult = ScoringEngine.calculateScore(financialData, Number(minThreshold));

    res.json({
      status: 'success',
      assessment: scoreResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Financial scoring calculation failed' });
  }
});

// 4. ZK Proof Generation Endpoint
app.post('/api/zk/prove', async (req: Request, res: Response) => {
  try {
    const { score, minThreshold = 700, salt } = req.body;
    if (score === undefined) {
      return res.status(400).json({ error: 'Missing score parameter.' });
    }

    const proofPayload = await ZKEngine.generateProof(Number(score), Number(minThreshold), salt);

    res.json({
      status: 'success',
      proofPayload,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'ZK proof generation failed' });
  }
});

// 5. ZK Proof Verification Endpoint
app.post('/api/zk/verify', async (req: Request, res: Response) => {
  try {
    const { proofPayload } = req.body;
    if (!proofPayload) {
      return res.status(400).json({ error: 'Missing proofPayload.' });
    }

    const isValid = await ZKEngine.verifyProof(proofPayload);
    res.json({ status: 'success', isValid });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'ZK verification failed' });
  }
});

// 6. Polygon Amoy Anchoring Endpoint
app.post('/api/blockchain/anchor', async (req: Request, res: Response) => {
  try {
    const { commitment, proofHash, policyVersion } = req.body;
    if (!commitment || !proofHash) {
      return res.status(400).json({ error: 'Missing commitment or proofHash.' });
    }

    const result = await BlockchainService.anchorCertificate(commitment, proofHash, policyVersion);
    res.json({ status: 'success', certificate: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Blockchain certificate anchoring failed' });
  }
});

// 7. Public Certificate Verification Query
app.get('/api/public/verify/:certificateId', async (req: Request, res: Response) => {
  try {
    const certificateId = String(req.params.certificateId);
    const certDetails = await BlockchainService.queryCertificate(certificateId);
    res.json({ status: 'success', certificate: certDetails });
  } catch (err: any) {
    res.status(404).json({ error: 'Certificate not found or invalid' });
  }
});

app.listen(PORT, () => {
  console.log(`✓ ZK-Sentinel Express Backend Server running on http://localhost:${PORT}`);
});
