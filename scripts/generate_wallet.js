const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const wallet = ethers.Wallet.createRandom();
console.log('=== GENERATED DEDICATED DEPLOYMENT WALLET ===');
console.log('Public Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);

const envContent = [
  '# Server Configuration',
  'PORT=4000',
  'NODE_ENV=production',
  '',
  '# ElevenLabs Voice AI Integration',
  'ELEVENLABS_API_KEY=',
  'ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM',
  'ELEVENLABS_AGENT_ID=',
  '',
  '# Polygon Amoy Testnet (Chain ID 80002)',
  'POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology',
  `POLYGON_PRIVATE_KEY=${wallet.privateKey}`,
  'ZK_VERIFIER_CONTRACT_ADDRESS=0x4A8F2b77C401a6136B3693F7A02C264b38d386E8',
  ''
].join('\n');

fs.writeFileSync('C:/Users/archi/Downloads/zk sentinel/.env', envContent);
fs.writeFileSync('C:/Users/archi/Downloads/zk sentinel/ZK-SENTINEL-project/.env', envContent);
console.log('✓ Successfully configured .env files!');
