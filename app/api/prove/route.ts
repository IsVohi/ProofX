
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
// Force CommonJS import for snarkjs to avoid ESM issues in Next.js API routes
const snarkjs = require("snarkjs");
import { ethers } from "ethers";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

// Increase timeout for ZK proof generation (Vercel/Next.js specific export)
export const maxDuration = 60;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ProofInput {
    assets: string;
    liabilities: string;
    threshold: string;
    institutionId?: string;
    metric?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ZK GENERATION LOGIC
// ─────────────────────────────────────────────────────────────────────────────

async function generateRealProof(input: ProofInput, wasmBuffer: Buffer, zkeyBuffer: Buffer) {
    console.log("🔄 Starting generateRealProof...");
    const assets = BigInt(input.assets);
    const liabilities = BigInt(input.liabilities);
    const threshold = BigInt(input.threshold);

    // Compliance Check
    if (assets < liabilities) throw new Error("Assets must be >= Liabilities");
    if ((assets - liabilities) <= threshold) throw new Error("Capital adequacy check failed");

    const circuitInputs = {
        assets: input.assets,
        liabilities: input.liabilities,
        threshold: input.threshold
    };

    const startTime = Date.now();

    console.log("⚡ Calling snarkjs.groth16.fullProve with buffers...");

    // Generate Proof
    let proofResult;
    try {
        // Pass Uint8Arrays (converted from Buffers) to avoid file handle issues
        proofResult = await snarkjs.groth16.fullProve(
            circuitInputs,
            new Uint8Array(wasmBuffer),
            new Uint8Array(zkeyBuffer)
        );
        console.log("✅ snarkjs.groth16.fullProve completed!");
    } catch (err: any) {
        console.error("❌ snarkjs execution failed:", err);
        throw new Error(`SnarkJS Error: ${err.message}`);
    }

    const { proof, publicSignals } = proofResult;
    const proofTime = Date.now() - startTime;

    // Format for Contract
    const formattedProof = {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [
            [proof.pi_b[0][1], proof.pi_b[0][0]],
            [proof.pi_b[1][1], proof.pi_b[1][0]]
        ],
        c: [proof.pi_c[0], proof.pi_c[1]]
    };

    // Generate Commitment
    const commitment = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
            ['uint256[2]', 'uint256[2][2]', 'uint256[2]', 'uint256'],
            [formattedProof.a, formattedProof.b, formattedProof.c, publicSignals[0]]
        )
    );

    return { formattedProof, publicSignals, commitment, proofTime };
}

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTE
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body: ProofInput = await req.json();
        console.log("📝 API Prover: Request received", { entity: body.institutionId });

        // LOCATE ARTIFACTS
        // Using root-level 'zk-artifacts' folder which is traced by Next.js config
        const zkDir = path.join(process.cwd(), "zk-artifacts");
        const wasmPath = path.join(zkDir, "compliance.wasm");
        const zkeyPath = path.join(zkDir, "circuit_final.zkey");

        console.log("📂 Resolving ZK paths:");
        console.log("   CWD:", process.cwd());
        console.log("   Target Dir:", zkDir);

        // Debug: List files in CWD and Target Dir to help debugging on Vercel
        try {
            const cwdFiles = await fs.readdir(process.cwd());
            console.log("   Files in CWD:", cwdFiles.join(", "));
            if (cwdFiles.includes("zk-artifacts")) {
                const zkFiles = await fs.readdir(zkDir);
                console.log("   Files in zk-artifacts:", zkFiles.join(", "));
            } else {
                console.warn("⚠️ zk-artifacts folder NOT found in CWD");
            }
        } catch (err) {
            console.error("   FS Debug Error:", err);
        }

        // Check existence
        try {
            await fs.access(wasmPath);
            await fs.access(zkeyPath);
        } catch (e) {
            console.error("❌ ZK Artifacts missing:", e);
            // Fallback: check if they are in public/zk just in case
            return NextResponse.json(
                { success: false, error: `Server misconfiguration: ZK artifacts missing at ${zkDir}` },
                { status: 500 }
            );
        }

        console.log("🔐 Reading ZK artifacts into memory...");
        const wasmBuffer = await fs.readFile(wasmPath);
        const zkeyBuffer = await fs.readFile(zkeyPath);
        console.log("✅ Artifacts loaded. Generating proof...");

        const result = await generateRealProof(body, wasmBuffer, zkeyBuffer);

        return NextResponse.json({
            success: true,
            proof: result.formattedProof,
            publicSignals: result.publicSignals,
            commitment: result.commitment,
            proofTime: result.proofTime,
            mode: "real_zk"
        });

    } catch (error: any) {
        console.error("❌ Proof generation failed:", error.message);
        return NextResponse.json(
            { success: false, error: error.message || "Proof generation failed" },
            { status: 400 }
        );
    }
}
