/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ProofX Protocol - Blockchain Interaction Layer
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This module handles all blockchain interactions for the ProofX Protocol.
 * It submits proof commitments to the ProofXVerifier smart contract and
 * listens for verification events.
 * 
 * FLOW:
 * 1. Receive proof commitment (bytes32 hash) from prover service
 * 2. Submit transaction to ProofXVerifier.verifyProof()
 * 3. Wait for transaction confirmation
 * 4. Listen for ProofVerified event
 * 5. Return transaction result
 * 
 * USAGE:
 *   const blockchain = require('./blockchain');
 *   const result = await blockchain.submitProof(commitment);
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

const { ethers } = require('ethers');
require('dotenv').config();

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

// Load from environment variables (NEVER hardcode)
const RPC_URL = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// ProofXVerifier ABI (only the functions we need)
const PROOFX_ABI = [
    // Functions
    "function verifyProof(bytes32 _commitment) external returns (bool verified)",
    "function isVerified(address _prover) external view returns (bool)",
    "function getVerification(address _prover) external view returns (bytes32 commitment, uint64 timestamp, bool verified)",
    "function totalVerifications() external view returns (uint256)",

    // Events
    "event ProofVerified(address indexed prover, bytes32 indexed commitment, bool verified, uint256 timestamp)"
];

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

let provider = null;
let wallet = null;
let contract = null;

/**
 * Initialize blockchain connection
 * Call this before using any other functions
 */
function initialize() {
    if (!RPC_URL) {
        throw new Error("RPC_URL not configured in environment");
    }
    if (!PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY not configured in environment");
    }
    if (!CONTRACT_ADDRESS) {
        throw new Error("CONTRACT_ADDRESS not configured in environment");
    }

    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(CONTRACT_ADDRESS, PROOFX_ABI, wallet);

    console.log("🔗 Blockchain layer initialized");
    console.log(`   Network: ${RPC_URL.includes('sepolia') ? 'Sepolia' : RPC_URL.includes('amoy') ? 'Polygon Amoy' : 'Unknown'}`);
    console.log(`   Contract: ${CONTRACT_ADDRESS}`);
    console.log(`   Wallet: ${wallet.address}`);

    return { provider, wallet, contract };
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Submit a proof commitment to the blockchain
 * 
 * @param {string} commitment - The 32-byte proof commitment hash (0x prefixed)
 * @returns {Promise<Object>} Transaction result with hash, status, and event data
 * 
 * FLOW:
 * 1. Send transaction to contract.verifyProof(commitment)
 * 2. Wait for transaction to be mined
 * 3. Parse the ProofVerified event from the receipt
 * 4. Return structured result
 */
async function submitProof(commitment) {
    if (!contract) {
        initialize();
    }

    console.log(`\n📤 Submitting proof to blockchain...`);
    console.log(`   Commitment: ${commitment}`);

    try {
        // 1. Send transaction
        const tx = await contract.verifyProof(commitment);
        console.log(`   Transaction sent: ${tx.hash}`);

        // 2. Wait for confirmation
        console.log(`   Waiting for confirmation...`);
        const receipt = await tx.wait();
        console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);

        // 3. Parse event from receipt
        const event = receipt.logs
            .map(log => {
                try {
                    return contract.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find(parsed => parsed?.name === 'ProofVerified');

        // 4. Structure result
        const result = {
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            verified: event?.args?.verified ?? false,
            prover: event?.args?.prover,
            commitment: event?.args?.commitment,
            timestamp: event?.args?.timestamp?.toString()
        };

        console.log(`   Verification result: ${result.verified ? 'PASSED ✅' : 'FAILED ❌'}`);

        return result;

    } catch (error) {
        console.error(`   ❌ Transaction failed:`, error.message);

        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

/**
 * Check if an address has a verified proof
 * 
 * @param {string} address - The address to check
 * @returns {Promise<boolean>} Whether the address is verified
 */
async function checkVerification(address) {
    if (!contract) {
        initialize();
    }

    const isVerified = await contract.isVerified(address);
    return isVerified;
}

/**
 * Get full verification details for an address
 * 
 * @param {string} address - The address to query
 * @returns {Promise<Object>} Verification details
 */
async function getVerificationDetails(address) {
    if (!contract) {
        initialize();
    }

    const [commitment, timestamp, verified] = await contract.getVerification(address);

    return {
        commitment,
        timestamp: timestamp.toString(),
        verified,
        timestampDate: new Date(Number(timestamp) * 1000).toISOString()
    };
}

/**
 * Get total number of verifications
 * 
 * @returns {Promise<string>} Total verification count
 */
async function getTotalVerifications() {
    if (!contract) {
        initialize();
    }

    const total = await contract.totalVerifications();
    return total.toString();
}

/**
 * Listen for ProofVerified events
 * 
 * @param {Function} callback - Called when a ProofVerified event is emitted
 * @returns {Function} Unsubscribe function
 */
function onProofVerified(callback) {
    if (!contract) {
        initialize();
    }

    contract.on('ProofVerified', (prover, commitment, verified, timestamp) => {
        callback({
            prover,
            commitment,
            verified,
            timestamp: timestamp.toString(),
            timestampDate: new Date(Number(timestamp) * 1000).toISOString()
        });
    });

    // Return unsubscribe function
    return () => contract.off('ProofVerified');
}

/**
 * Get wallet balance
 * 
 * @returns {Promise<string>} Balance in ETH
 */
async function getBalance() {
    if (!wallet) {
        initialize();
    }

    const balance = await provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {
    initialize,
    submitProof,
    checkVerification,
    getVerificationDetails,
    getTotalVerifications,
    onProofVerified,
    getBalance,
    // Expose internals for advanced usage
    getProvider: () => provider,
    getWallet: () => wallet,
    getContract: () => contract
};

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE (run with: node blockchain.js)
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
    (async () => {
        console.log(`
╔════════════════════════════════════════════════════════════════╗
║           ProofX Blockchain Layer - Test Mode                  ║
╚════════════════════════════════════════════════════════════════╝
        `);

        try {
            // Initialize
            initialize();

            // Check balance
            const balance = await getBalance();
            console.log(`\n💰 Wallet balance: ${balance} ETH`);

            if (parseFloat(balance) === 0) {
                console.log("\n⚠️  Wallet has no balance. Get testnet ETH from a faucet.");
                console.log("   Sepolia: https://sepoliafaucet.com");
                console.log("   Amoy: https://faucet.polygon.technology");
                return;
            }

            // Get total verifications
            const total = await getTotalVerifications();
            console.log(`📊 Total verifications on contract: ${total}`);

            // Example: Submit a test proof
            console.log("\n🧪 Submitting test proof...");
            const testCommitment = ethers.keccak256(ethers.toUtf8Bytes(`test-${Date.now()}`));
            const result = await submitProof(testCommitment);

            console.log("\n📋 Result:", JSON.stringify(result, null, 2));

        } catch (error) {
            console.error("\n❌ Error:", error.message);
        }
    })();
}
