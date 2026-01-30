/*
 * ═══════════════════════════════════════════════════════════════════════════
 * ProofX Protocol — Capital Adequacy Compliance Circuit
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 *   Prove that (assets - liabilities) > threshold WITHOUT revealing the
 *   actual values of assets or liabilities.
 * 
 * STATEMENT:
 *   "I know private values (assets, liabilities) such that:
 *    assets - liabilities > threshold
 *    ...and I am not revealing those values."
 * 
 * INPUTS:
 *   - assets     [PRIVATE] : Total assets in scaled integer (e.g., $1M = 1000000)
 *   - liabilities [PRIVATE] : Total liabilities in same scale
 *   - threshold   [PUBLIC]  : Minimum capital requirement
 * 
 * OUTPUT:
 *   A valid proof if and only if the constraint is satisfied.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

pragma circom 2.1.6;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT IMPORTS
// We use standard components from circomlib for safe comparisons
// ─────────────────────────────────────────────────────────────────────────────

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CIRCUIT: CapitalAdequacy
// ─────────────────────────────────────────────────────────────────────────────

template CapitalAdequacy(N_BITS) {
    /*
     * N_BITS: Number of bits for numeric precision.
     *         64 bits supports values up to ~18 quintillion.
     *         This prevents overflow in intermediate calculations.
     */

    // HARDENING: Verify N_BITS fits in the field (approx 254 bits).
    // If N_BITS is too large, additions could wrap around the field modulus.
    assert(N_BITS < 254);

    // ─────────────────────────────────────────────────────────────────────────
    // SIGNALS
    // ─────────────────────────────────────────────────────────────────────────

    // Private Inputs (known only to the prover)
    signal input assets;
    signal input liabilities;

    // Public Input (visible on-chain)
    signal input threshold;

    // Intermediate signal for capital calculation
    signal capital;

    // ─────────────────────────────────────────────────────────────────────────
    // CONSTRAINT 1: Prevent Underflow
    // Assets must be greater than or equal to liabilities.
    // This ensures 'capital' is non-negative (no underflow).
    // CRITICAL: Without this, (2 - 5) would become a huge field element.
    // ─────────────────────────────────────────────────────────────────────────

    component assetsGteLiabilities = GreaterEqThan(N_BITS);
    assetsGteLiabilities.in[0] <== assets;
    assetsGteLiabilities.in[1] <== liabilities;
    
    // SECURITY: Must be strictly enforced
    assetsGteLiabilities.out === 1;

    // ─────────────────────────────────────────────────────────────────────────
    // CONSTRAINT 2: Range Check on Inputs
    // Ensure all inputs fit within N_BITS to prevent overflow.
    // Num2Bits will fail if the value exceeds 2^N_BITS - 1.
    // ─────────────────────────────────────────────────────────────────────────

    component assetsRangeCheck = Num2Bits(N_BITS);
    assetsRangeCheck.in <== assets;

    component liabilitiesRangeCheck = Num2Bits(N_BITS);
    liabilitiesRangeCheck.in <== liabilities;

    component thresholdRangeCheck = Num2Bits(N_BITS);
    thresholdRangeCheck.in <== threshold;

    // ─────────────────────────────────────────────────────────────────────────
    // CALCULATION: Capital = Assets - Liabilities
    // This is safe because we already enforced assets >= liabilities.
    // ─────────────────────────────────────────────────────────────────────────

    capital <== assets - liabilities;

    // ─────────────────────────────────────────────────────────────────────────
    // CONSTRAINT 3: Capital > Threshold (Strict Inequality)
    // The core compliance check.
    // ─────────────────────────────────────────────────────────────────────────

    component capitalGtThreshold = GreaterThan(N_BITS);
    capitalGtThreshold.in[0] <== capital;
    capitalGtThreshold.in[1] <== threshold;

    // Enforce: capital > threshold
    // This is the MAIN compliance assertion.
    capitalGtThreshold.out === 1;

    // ─────────────────────────────────────────────────────────────────────────
    // OPTIONAL: Log output for debugging (does not affect constraints)
    // Uncomment during development, remove for production.
    // ─────────────────────────────────────────────────────────────────────────
    // log("Capital:", capital, "Threshold:", threshold);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// Instantiate with 64-bit precision.
// The 'public' keyword marks 'threshold' as a public input.
// ─────────────────────────────────────────────────────────────────────────────

component main {public [threshold]} = CapitalAdequacy(64);
