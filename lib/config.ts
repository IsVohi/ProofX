/**
 * ProofX Protocol - Configuration Constants
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

// ProofXVerifier ABI — Updated for Real ZK Proof Verification
export const PROOFX_ABI = [
    // Primary: Submit real Groth16 proof with Keychain signature
    "function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[1] calldata _pubSignals, bytes calldata _signature) external returns (bool verified)",
    // Simplified: No signature (sender = signer)
    "function verifyProofSimple(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[1] calldata _pubSignals) external returns (bool verified)",
    // View functions
    "function isVerified(address _signer) external view returns (bool)",
    "function getVerification(address _signer) external view returns (bytes32 proofHash, uint64 timestamp, uint64 threshold, bool verified)",
    "function totalVerifications() external view returns (uint256)",
    "function zkVerifier() external view returns (address)",
    // Event with proof details
    "event ProofVerified(address indexed signer, address indexed submitter, bytes32 indexed proofHash, uint256 threshold, bool verified, uint256 timestamp)"
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

export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.sepolia;

// ─────────────────────────────────────────────────────────────────────────────
// PROVER SERVICE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

// Development: Use standalone server (faster, no Next.js API limits)
// Production (Vercel): Use internal API route
export const PROVER_URL = process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : "/api";
