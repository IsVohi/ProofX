# ProofX Security Audit Briefing

> **Target**: External Security Auditors
> **Version**: 1.0 (Audit Ready)
> **Date**: 2026-01-30

---

## 1. System Overview

ProofX is a **Privacy-Preserving Compliance Protocol**. It enables financial institutions to prove capital adequacy (`assets - liabilities > threshold`) without revealing permissible inputs.

### Architecture Map
*   **ZK Circuits**: `compliance.circom` (Groth16, BN254).
*   **Contracts**: `ProofXVerifier.sol` (Logic), `Groth16Verifier` (Crypto).
*   **Prover**: Off-chain Node.js service (Signed Proofs).

### Documentation Index
*   [Threat Model](./THREAT_MODEL.md)
*   [Circuit Audit](./CIRCUIT_AUDIT.md)
*   [Key Management](./KEY_MANAGEMENT.md)
*   [Prover Security](./PROVER_SECURITY.md)

---

## 2. Critical Invariants

The audit should verify that these properties hold **unconditionally**.

### A. Smart Contract
1.  **Authorization**: Only addresses with `SIGNER_ROLE` can successfully call `verifyProof`.
2.  **Replay Protection**: A `proofHash` can **never** be verified twice.
3.  **Pausability**: If `paused()`, no verification can occur.
4.  **Immutability**: The `zkVerifier` address cannot be changed after deployment (preventing logic swap without migration).

### B. ZK Circuit
1.  **Underflow Safety**: `assets - liabilities` must NOT wrap around the field modulus.
    *   *Implementation*: `assetsGteLiabilities` constraints.
2.  **Range Safety**: All inputs must be constrained to 64 bits to prevent aliasing.
3.  **Correctness**: If `capital <= threshold`, proof generation **MUST** fail.

---

## 3. ZK Assumptions & Trust Roots

*   **Trusted Setup**: The system assumes a secure Phase 2 Ceremony.
    *   *Scope Note*: The current artifacts are **Demo/Local**. The audit should focus on the *Verifier Code*, not the specific `.zkey` file.
*   **Prover integrity**: The Prover Service is trusted with private inputs (in the current centralized model).

---

## 4. Known Limitations (Scope Exclusions)

Please do **NOT** report these as critical issues; they are known design constraints.

1.  **Single-Party Setup**: We know the current setup is insecure. Production will use an MPC.
2.  **64-Bit Precision**: `N_BITS` is set to 64. This is insufficient for ETH (Wei) but sufficient for demo USD.
3.  **Centralized Prover**: The roadmap moves to Client-Side Proving. Server-Side privacy risks are accepted for v1.

---

## 5. Auditor FAQ (Pre-Emptive Answers)

**Q: Can a malicious Admin forge a proof?**
**A**: **Yes**, if they hold the `SIGNER_ROLE`.
*   *Defense*: Admin is a governance Multi-Sig. Signers are restricted operational keys.

**Q: What happens if the ZK Verifier is buggy?**
**A**: The `ProofXVerifier` wraps it. If `Groth16Verifier` returns false positives, we must `pause()` and deploy a V2.

**Q: Is there a signature malleability risk?**
**A**: We use OpenZeppelin's `ECDSA` library which enforces low-S values, mitigating malleability.

**Q: Why is there no "Withdraw" function?**
**A**: ProofX is a **Signaling Protocol**. It does not hold funds. It only stores *Status*.

---

## 6. Code Metrics (Scope)

| Component | Lines of Code | Complexity |
|-----------|---------------|------------|
| `compliance.circom` | ~80 | Medium (Math) |
| `ProofXVerifier.sol` | ~150 | Low (RBAC) |
| `Groth16Verifier.sol`| ~500 | High (Generated) |

We look forward to your findings.
