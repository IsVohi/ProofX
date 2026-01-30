/**
 * ProofX Protocol - Hardhat Configuration
 * 
 * SETUP INSTRUCTIONS:
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Copy .env.example to .env
 * 2. Fill in your private key (WITHOUT 0x prefix)
 * 3. Add your RPC URLs (get free ones from Alchemy or Infura)
 * 
 * DEPLOYMENT:
 * ─────────────────────────────────────────────────────────────────────────────
 * # Compile contracts
 * npx hardhat compile
 * 
 * # Deploy to Sepolia
 * npx hardhat run scripts/deploy.ts --network sepolia
 * 
 * # Deploy to Polygon Amoy
 * npx hardhat run scripts/deploy.ts --network amoy
 * 
 * # Verify on Etherscan (after deployment)
 * npx hardhat verify --network sepolia <DEPLOYED_ADDRESS>
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Validate required env vars
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const AMOY_RPC_URL = process.env.AMOY_RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200, // Optimize for deployment cost
            },
            viaIR: true, // Enable IR-based compilation for better optimization
        },
    },

    networks: {
        // Local development
        hardhat: {
            chainId: 31337,
        },

        // Ethereum Sepolia Testnet
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 11155111,
        },

        // Polygon Amoy Testnet (replaced Mumbai)
        amoy: {
            url: AMOY_RPC_URL,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 80002,
        },
    },

    // Contract verification
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY,
            polygonAmoy: POLYGONSCAN_API_KEY,
        },
        customChains: [
            {
                network: "polygonAmoy",
                chainId: 80002,
                urls: {
                    apiURL: "https://api-amoy.polygonscan.com/api",
                    browserURL: "https://amoy.polygonscan.com",
                },
            },
        ],
    },

    // Gas reporting for optimization
    gasReporter: {
        enabled: process.env.REPORT_GAS === "true",
        currency: "USD",
    },

    // TypeScript paths
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};

export default config;
