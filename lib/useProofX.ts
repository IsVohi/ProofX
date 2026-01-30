"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ProofX Protocol - useProofX Hook
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Orchestrates the complete end-to-end proof verification flow:
 * 
 * FLOW:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ 1. Frontend calls generateAndSubmitProof(input)                        │
 * │ 2. Hook calls Backend Prover → receives commitment hash                │
 * │ 3. Hook calls contract.verifyProof(commitment) via MetaMask            │
 * │ 4. User signs transaction in MetaMask                                  │
 * │ 5. Hook waits for transaction confirmation                             │
 * │ 6. Hook listens for ProofVerified event                                │
 * │ 7. Hook returns final result to Frontend                               │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * USAGE:
 *   const { generateAndSubmitProof, status, result, error } = useProofX();
 *   
 *   await generateAndSubmitProof({
 *     institutionId: "acme-bank",
 *     metric: "capital_adequacy",
 *     value: 12,
 *     threshold: 8
 *   });
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from "react";
import { useWeb3 } from "./web3-context";
import { PROVER_URL } from "./config";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ProofStatus =
    | "idle"           // Initial state
    | "connecting"     // Connecting wallet
    | "generating"     // Calling prover service
    | "signing"        // Waiting for user to sign in MetaMask
    | "confirming"     // Waiting for blockchain confirmation
    | "success"        // Proof verified on-chain
    | "failure";       // Verification failed (logic or tx error)

export interface ProofInput {
    institutionId: string;
    metric: string;
    value: number;
    threshold: number;
}

export interface ProofResult {
    commitment: string;
    transactionHash: string;
    blockNumber: number;
    verified: boolean;
    timestamp: string;
    gasUsed: string;
}

interface UseProofXReturn {
    // State
    status: ProofStatus;
    result: ProofResult | null;
    error: string | null;

    // Actions
    generateAndSubmitProof: (input: ProofInput) => Promise<void>;
    reset: () => void;

    // Wallet state (from Web3 context)
    isConnected: boolean;
    address: string | null;
    connect: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useProofX(): UseProofXReturn {
    const { isConnected, address, connect, contract, signer } = useWeb3();

    const [status, setStatus] = useState<ProofStatus>("idle");
    const [result, setResult] = useState<ProofResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // RESET STATE
    // ─────────────────────────────────────────────────────────────────────────

    const reset = useCallback(() => {
        setStatus("idle");
        setResult(null);
        setError(null);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN FLOW: Generate Proof → Sign → Submit → Confirm
    // ─────────────────────────────────────────────────────────────────────────

    const generateAndSubmitProof = useCallback(async (input: ProofInput) => {
        reset();

        try {
            // ──────────────────────────────────────────────────────────────────
            // STEP 1: Ensure wallet is connected
            // ──────────────────────────────────────────────────────────────────
            if (!isConnected) {
                setStatus("connecting");
                await connect();
                // If we just connected, we can't proceed immediately because 'contract' 
                // in this closure is stale (null). User needs to click again.
                // We could use refs to get fresh state, but for simplicity/safety:
                setStatus("idle");
                return;
            }

            // ──────────────────────────────────────────────────────────────────
            // STEP 1.5: Ensure correct network
            // ──────────────────────────────────────────────────────────────────
            // Note: We need to get fresh values from context or check current state
            // accessing hooks directly inside callback uses closure values

            // Getting fresh values via window.ethereum is safer for immediate checks after connect
            // but for now, we rely on the user flow (Connect -> Check -> Submit)

            // To be safe, we can trigger switch if we detect we are ready but on wrong chain
            // However, useWeb3 context values in this closure might be stale if we just connected
            // So we'll skip the strict check here and rely on the UI button being disabled 
            // OR we can try to force switch if we have a provider

            if (!contract || !signer) {
                // If connected but no contract, likely wrong network or disconnected
                throw new Error("Wallet not fully initialized. Please ensure you are on Sepolia.");
            }

            // ──────────────────────────────────────────────────────────────────
            // STEP 2: Call Prover Service to generate commitment
            // ──────────────────────────────────────────────────────────────────
            setStatus("generating");
            console.log("📝 Calling prover service...", input);

            const proverResponse = await fetch(`${PROVER_URL}/prove`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input)
            });

            const proverData = await proverResponse.json();

            if (!proverData.success || !proverData.commitment) {
                throw new Error(proverData.error || "Prover service failed");
            }

            const commitment = proverData.commitment;
            console.log("✅ Proof generated:", commitment);

            // ──────────────────────────────────────────────────────────────────
            // STEP 3: Submit to blockchain (triggers MetaMask popup)
            // ──────────────────────────────────────────────────────────────────
            setStatus("signing");
            console.log("🔐 Requesting signature...");

            try {
                const tx = await contract.verifyProof(commitment);
                console.log("📤 Transaction sent:", tx.hash);

                // ──────────────────────────────────────────────────────────────────
                // STEP 4: Wait for confirmation
                // ──────────────────────────────────────────────────────────────────
                setStatus("confirming");
                console.log("⏳ Waiting for confirmation...");

                const receipt = await tx.wait();
                console.log("✅ Confirmed in block:", receipt.blockNumber);

                // ──────────────────────────────────────────────────────────────────
                // STEP 5: Parse ProofVerified event
                // ──────────────────────────────────────────────────────────────────
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

                // ──────────────────────────────────────────────────────────────────
                // STEP 6: Set final result
                // ──────────────────────────────────────────────────────────────────
                setResult({
                    commitment,
                    transactionHash: receipt.hash,
                    blockNumber: receipt.blockNumber,
                    verified,
                    timestamp: new Date().toISOString(),
                    gasUsed: receipt.gasUsed.toString()
                });

                setStatus(verified ? "success" : "failure");
                console.log(`🎉 Verification ${verified ? "PASSED" : "FAILED"}`);

            } catch (txError: any) {
                // Handle user rejection specifically
                if (txError.code === "ACTION_REJECTED" || txError.code === 4001) {
                    throw new Error("Transaction rejected by user");
                }
                // Handle network mismatch errors or reverts
                throw txError;
            }

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            console.error("❌ Error:", message);
            setError(message);
            setStatus("failure");
        }
    }, [isConnected, connect, contract, signer, reset]);

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

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
