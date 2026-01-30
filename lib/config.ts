/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ProofX Protocol - Configuration Constants
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

// Deployed ProofXVerifier contract address
// Update this after deployment!
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// ProofXVerifier ABI (minimal, only what frontend needs)
export const PROOFX_ABI = [
    "function verifyProof(bytes32 _commitment) external returns (bool verified)",
    "function isVerified(address _prover) external view returns (bool)",
    "function getVerification(address _prover) external view returns (bytes32 commitment, uint64 timestamp, bool verified)",
    "function totalVerifications() external view returns (uint256)",
    "event ProofVerified(address indexed prover, bytes32 indexed commitment, bool verified, uint256 timestamp)"
];

// ─────────────────────────────────────────────────────────────────────────────
// NETWORK CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const SUPPORTED_NETWORKS = {
    sepolia: {
        chainId: 11155111,
        chainIdHex: "0xaa36a7",
        name: "Sepolia",
        rpcUrl: "https://sepolia.infura.io/v3/",
        blockExplorer: "https://sepolia.etherscan.io",
        currency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 }
    },
    amoy: {
        chainId: 80002,
        chainIdHex: "0x13882",
        name: "Polygon Amoy",
        rpcUrl: "https://rpc-amoy.polygon.technology/",
        blockExplorer: "https://amoy.polygonscan.com",
        currency: { name: "MATIC", symbol: "MATIC", decimals: 18 }
    }
};

// Default network
export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.sepolia;

// ─────────────────────────────────────────────────────────────────────────────
// PROVER SERVICE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const PROVER_URL = process.env.NEXT_PUBLIC_PROVER_URL || "http://localhost:3001";
