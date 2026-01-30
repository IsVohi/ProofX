const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ══════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════

/**
 * SIMULATED ZK PROOF GENERATION
 * 
 * In a real ZK system (e.g., Circom + SnarkJS), this function would:
 * 1. Take private inputs (financial data) & public inputs (thresholds)
 * 2. Run the circuit generation to create a Witness
 * 3. Generate a zk-SNARK proof (Proof) and Public Signals
 * 
 * For this hackathon/prototype, we SIMULATE this by:
 * 1. Taking the inputs
 * 2. Deterministically hashing them to create a "commitment"
 * 3. Checking the condition in plain JS (mock verification)
 * 
 * @param {Object} input - Compliance data
 * @returns {string} - The 32-byte commitment hash (mock proof)
 */
function generateMockProof(input) {
    // 1. Validate inputs (Mock circuit constraints)
    if (!input.institutionId || !input.metric || !input.value || !input.threshold) {
        throw new Error("Invalid inputs: Missing required fields");
    }

    // 2. Mock Logic Check (simulating the ZK circuit constraints)
    // Example: "Value must be greater than Threshold"
    const isCompliant = Number(input.value) >= Number(input.threshold);

    // If not compliant, a real ZK circuit would fail to generate a valid proof.
    // Here, we simulate that by throwing an error or returning a null commitment.
    if (!isCompliant) {
        throw new Error("Compliance check failed: Value below threshold");
    }

    // 3. Generate Deterministic Commitment
    // This commitment represents the "Proof" that is submitted on-chain.
    // In reality, this would be a hash of the Public Signals + Proof.
    const commitment = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(input))
    );

    return commitment;
}

// ══════════════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
    res.json({
        service: "ProofX Prover Node",
        status: "active",
        mode: "simulated_zk"
    });
});

/**
 * POST /prove
 * Generates a compliance proof commitment.
 * 
 * Body:
 * {
 *   "institutionId": "did:ethr:0x123...",
 *   "metric": "capital_adequacy",
 *   "value": 12,
 *   "threshold": 8
 * }
 */
app.post('/prove', (req, res) => {
    try {
        const input = req.body;
        console.log("📝 Received proof request:", input.institutionId, input.metric);

        // Simulate computation time (ZK proofs take time!)
        // In production, this would be the time taken by the Prover (e.g. 2-5s)
        const SIMULATED_DELAY_MS = 1000;

        setTimeout(() => {
            try {
                const commitment = generateMockProof(input);

                console.log("✅ Proof generated:", commitment);

                res.json({
                    success: true,
                    commitment: commitment,
                    details: {
                        algorithm: "mock-groth16-simulation",
                        timestamp: Date.now()
                    }
                });
            } catch (error) {
                console.error("❌ Proof generation failed (Logic):", error.message);
                res.status(400).json({
                    success: false,
                    error: "Proof generation failed: " + error.message
                });
            }
        }, SIMULATED_DELAY_MS);

    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ success: false, error: "Internal prover error" });
    }
});

// ══════════════════════════════════════════════════════════════════════════
// START
// ══════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   ProofX Prover Node (Simulated)               ║
╚════════════════════════════════════════════════════════════════╝
  
  🚀 Service running on: http://localhost:${PORT}
  📡 Endpoint:           POST /prove
  🛡️  Mode:              Stateless / Deterministic
    `);
});
