import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY || '0x14ff733f325f780e29cf7edb8132446bf4670164a56404155b2177690718ad23';
const AMOY_RPC_URL = process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';

export default {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80002,
    },
  },
};
