# Circuit Audit: CapitalAdequacy

> **Circuit**: `compliance.circom`
> **Version**: 1.0 (Demo hardend)
> **Auditor**: AI Auditor
> **Date**: 2026-01-30

---

## 1. Executive Summary

The circuit implements a **Capital Adequacy Check** (`assets - liabilities > threshold`).
The design is **SOUND** for the intended logic, provided that inputs are within the 64-bit range.
The primary missing feature for a production financial system is **Replay Protection** (Nullifier/Nonce).

| Category | Status | Notes |
|----------|--------|-------|
| **Arithmetic Safety** | ✅ Secure | Underflow prevented via `assets >= liabilities`. |
| **Constraint Completeness** | ✅ Secure | All inputs constrained by `Num2Bits`. |
| **Data Privacy** | ✅ Secure | Only `threshold` is public. |
| **Replay Protection** | ❌ **Missing** | No nonce; proof can be reused. |
| **Bit Range** | ⚠️ Notice | Limited to 64-bit inputs (~18 Quintillion). |

---

## 2. Detailed Findings

### ✅ Underflow Protection
**Logic**: `capital = assets - liabilities`
**Risk**: In modular arithmetic, `2 - 5` wraps around to `P - 3` (a huge number).
**Mitigation**: The circuit explicitly enforces `assets >= liabilities` using `GreaterEqThan(N_BITS)`.
- If `assets < liabilities`, the constraint `assetsGteLiabilities.out === 1` fails.
- This prevents the "wrapping" attack where a negative capital appears as a huge positive capital.

### ✅ Strict Inequality
**Logic**: `capital > threshold`
**Mitigation**: Uses `GreaterThan(N_BITS)` correctly.
- Edge case: `capital == threshold`. Result is `0`. Constraint fails. Correct.
- Edge case: `capital == 0, threshold == 0`. Result is `0`. Constraint fails. Correct.

### ✅ Input Range Checks
**Logic**: `Num2Bits(64)` on `assets`, `liabilities`, `threshold`.
**Importance**:
- Prevents "aliasing" attacks where a user provides `x + P` as input.
- Ensures `GreaterEqThan` works correctly (as it assumes n-bit inputs).
**Status**: All inputs are properly constrained.

### ❌ Replay Attack (Nonce)
**Risk**: A user who was compliant yesterday (valid proof) can re-submit the *same proof* today even if they are now insolvent.
**Impact**: High for ongoing compliance monitoring.
**Fix**: Add `signal input nonce;` to the circuit and make it public. The verifier contract should track used nonces.

---

## 3. Hardened Circuit Recommendations

We applied the following "soft" hardening measures to `compliance.circom`:

1.  **Compile-Time Assertions**: Ensure `N_BITS` is safe regarding the field size (~254 bits).
2.  **Documentation**: Added critical security comments explaining *why* specific constraints exist.

### Proposed Logic for Next Version (Non-Demo)

To fix the Replay Attack, the circuits should be updated as follows (requires new Setup):

```circom
template CapitalAdequacyHardened(N_BITS) {
    // ... consistent inputs ...
    signal input nonce; // NEW: Random unique value
    
    // ... logic ...

    // Constrain nonce to prevent tampering
    component nonceCheck = Num2Bits(N_BITS);
    nonceCheck.in <== nonce;
    
    // Nonce is unused in calculation but part of the proof
    signal dummy <== nonce * nonce; 
}
component main {public [threshold, nonce]} = ...
```

---

## 4. Production Checklist

- [ ] **Review N_BITS**: Confirm 64 bits ($18 Quintillion) is enough for the currency precision (e.g. 18 decimals).
    - *Note*: $18Q / 10^18 = 18 units. If tracking Wei, 64 bits is **TOO SMALL**. 
    - *Action*: For ETH (18 decimals), increase `N_BITS` to **128 or 252**.
- [ ] **Trusted Setup**: Must run MPC.
- [ ] **Verification**: Verify `out === 1` is used on all comparators.
