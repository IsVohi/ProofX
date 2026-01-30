"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ProofX Protocol — useProofX Hook with Real ZK Proof Submission
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * FLOW:
 * 1. User inputs private data (assets, liabilities, threshold)
 * 2. Backend generates REAL Groth16 proof using snarkjs
 * 3. Frontend receives proof elements (a, b, c) + publicSignals
 * 4. Keychain signs the proof hash for authorization
 * 5. Wallet submits proof to ProofXVerifier contract
 * 6. Contract calls Groth16Verifier for cryptographic verification
 * 7. UI updates based on on-chain verification result
 * 
 * SECURITY:
 * - Private inputs (assets, liabilities) NEVER leave the prover service
 * - Only proof elements are transmitted (zero-knowledge property)
 * - Proof elements are NOT logged to prevent exposure
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from "react";
import { useWeb3 } from "./web3-context";
import { PROVER_URL } from "./config";
import { ethers } from "ethers";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ProofStatus =
    | "idle"
    | "connecting"
    | "generating"     // Prover generating ZK proof
    | "authorizing"    // Keychain signing
    | "signing"        // Blockchain tx signing
    | "confirming"     // Waiting for block confirmation
    | "success"
    | "failure";

/** Input for proof generation — private data */
export interface ProofInput {
    institutionId: string;
    metric: string;
    // Real ZK inputs
    assets: string;       // Private: total assets
    liabilities: string;  // Private: total liabilities
    threshold: string;    // Public: compliance threshold
    // Legacy fields for backward compatibility
    value?: number;
}

/** Groth16 proof structure from prover */
interface Groth16Proof {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
}

/** Result after on-chain verification */
export interface ProofResult {
    proofHash: string;
    signature: string;
    signerAddress: string;
    transactionHash: string;
    blockNumber: number;
    verified: boolean;
    threshold: string;
    timestamp: string;
    gasUsed: string;
    mode: "real_zk" | "simulated_zk";
}

interface UseProofXReturn {
    status: ProofStatus;
    result: ProofResult | null;
    error: string | null;
    generateAndSubmitProof: (input: ProofInput) => Promise<void>;
    reset: () => void;
    isConnected: boolean;
    address: string | null;
    connect: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYCHAIN SIGNING
// Signs the proof hash for on-chain authorization
// ─────────────────────────────────────────────────────────────────────────────

async function keychainSignProofHash(
    signer: { signMessage: (message: Uint8Array | string) => Promise<string>; getAddress: () => Promise<string> },
    proofHash: string
): Promise<{ signature: string; signerAddress: string }> {
    // Convert proof hash to bytes for EIP-191 signing
    const hashBytes = ethers.getBytes(proofHash);
    const signature = await signer.signMessage(hashBytes);
    const signerAddress = await signer.getAddress();

    // Log only non-sensitive metadata
    console.log("🔑 Keychain signed proof hash:", {
        signerAddress,
        hashLength: proofHash.length
        // NOTE: Proof hash is intentionally NOT logged to prevent exposure
    });

    return { signature, signerAddress };
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useProofX(): UseProofXReturn {
    const { isConnected, address, connect, contract, signer } = useWeb3();

    const [status, setStatus] = useState<ProofStatus>("idle");
    const [result, setResult] = useState<ProofResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setStatus("idle");
        setResult(null);
        setError(null);
    }, []);

    const generateAndSubmitProof = useCallback(async (input: ProofInput) => {
        reset();

        try {
            // ═══════════════════════════════════════════════════════════════
            // STEP 1: Ensure wallet connected
            // ═══════════════════════════════════════════════════════════════
            if (!isConnected) {
                setStatus("connecting");
                await connect();
                setStatus("idle");
                return;
            }

            if (!contract || !signer) {
                throw new Error("Wallet not initialized. Please ensure you are on Sepolia.");
            }

            // ═══════════════════════════════════════════════════════════════
            // STEP 2: Generate REAL ZK proof from prover service
            // The prover runs snarkjs.fullProve() and returns:
            //   - proof: { a, b, c } — Groth16 proof elements
            //   - publicSignals: [threshold] — public inputs
            //   - commitment: hash of proof for reference
            // ═══════════════════════════════════════════════════════════════
            setStatus("generating");
            console.log("📝 Requesting ZK proof generation...");
            console.log("   Institution:", input.institutionId);
            console.log("   Metric:", input.metric);
            // NOTE: Private inputs NOT logged

            const proverResponse = await fetch(`${PROVER_URL}/prove`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    institutionId: input.institutionId,
                    metric: input.metric,
                    assets: input.assets,
                    liabilities: input.liabilities,
                    threshold: input.threshold,
                    // Legacy fallback
                    value: input.value || parseInt(input.assets) - parseInt(input.liabilities)
                })
            });

            if (!proverResponse.ok) {
                const errorText = await proverResponse.text();
                throw new Error(`Prover error: ${errorText}`);
            }

            const proverData = await proverResponse.json();

            if (!proverData.success) {
                throw new Error(proverData.error || "Proof generation failed");
            }

            // Extract proof components
            const proof: Groth16Proof = proverData.proof;
            const publicSignals: string[] = proverData.publicSignals;
            const proofHash: string = proverData.commitment;
            const mode = proverData.mode || "simulated_zk";

            console.log(`✅ ZK proof generated (mode: ${mode})`);
            // NOTE: Proof elements NOT logged to prevent exposure

            // ═══════════════════════════════════════════════════════════════
            // STEP 3: Keychain signs the proof hash for authorization
            // This proves the user authorized this specific proof
            // ═══════════════════════════════════════════════════════════════
            setStatus("authorizing");
            console.log("🔐 Requesting Keychain authorization...");

            const { signature, signerAddress } = await keychainSignProofHash(signer, proofHash);

            // ═══════════════════════════════════════════════════════════════
            // STEP 4: Submit proof to blockchain
            // Contract calls Groth16Verifier.verifyProof() internally
            // ═══════════════════════════════════════════════════════════════
            setStatus("signing");
            console.log("📤 Submitting proof to blockchain...");

            try {
                // Convert proof elements to BigInt arrays for contract
                const proofA: [bigint, bigint] = [
                    BigInt(proof.a[0]),
                    BigInt(proof.a[1])
                ];
                const proofB: [[bigint, bigint], [bigint, bigint]] = [
                    [BigInt(proof.b[0][0]), BigInt(proof.b[0][1])],
                    [BigInt(proof.b[1][0]), BigInt(proof.b[1][1])]
                ];
                const proofC: [bigint, bigint] = [
                    BigInt(proof.c[0]),
                    BigInt(proof.c[1])
                ];
                const pubSignals: [bigint] = [BigInt(publicSignals[0])];

                // Call contract with full Groth16 proof
                const tx = await contract.verifyProof(
                    proofA,
                    proofB,
                    proofC,
                    pubSignals,
                    signature
                );

                console.log("📤 Transaction sent:", tx.hash);

                // ═══════════════════════════════════════════════════════════════
                // STEP 5: Wait for confirmation
                // ═══════════════════════════════════════════════════════════════
                setStatus("confirming");
                console.log("⏳ Waiting for block confirmation...");

                const receipt = await tx.wait();
                console.log("✅ Confirmed in block:", receipt.blockNumber);

                // ═══════════════════════════════════════════════════════════════
                // STEP 6: Parse ProofVerified event
                // ═══════════════════════════════════════════════════════════════
                const event = receipt.logs
                    .map((log: { topics: string[]; data: string }) => {
                        try {
                            return contract.interface.parseLog(log);
                        } catch {
                            return null;
                        }
                    })
                    .find((parsed: { name: string } | null) => parsed?.name === "ProofVerified");

                const verified = event?.args?.verified ?? false;

                // ═══════════════════════════════════════════════════════════════
                // STEP 7: Set result
                // ═══════════════════════════════════════════════════════════════
                setResult({
                    proofHash,
                    signature,
                    signerAddress,
                    transactionHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    verified,
                    threshold: publicSignals[0],
                    timestamp: new Date().toISOString(),
                    gasUsed: receipt.gasUsed.toString(),
                    mode
                });

                setStatus(verified ? "success" : "failure");
                console.log(`🎉 Verification ${verified ? "PASSED ✅" : "FAILED ❌"}`);

            } catch (txError: unknown) {
                const err = txError as { code?: string | number; message?: string };
                if (err.code === "ACTION_REJECTED" || err.code === 4001) {
                    throw new Error("Transaction rejected by user");
                }
                throw new Error(err.message || "Transaction failed");
            }

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            console.error("❌ Error:", message);
            setError(message);
            setStatus("failure");
        }
    }, [isConnected, connect, contract, signer, reset]);

    return {
        status,
        result,
        error,
        generateAndSubmitProof,
        reset,
        isConnected,
        address,
        connect
    };
}
