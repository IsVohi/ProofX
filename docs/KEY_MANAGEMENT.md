# ProofX Key Management Strategy (Keychain)

> **Context**: Production Key Lifecycle & Governance
> **Tooling**: Keychain (Client-side), OpenZeppelin AccessControl (On-chain)
> **Date**: 2026-01-30

---

## 1. Core Philosophy: Institutional Self-Sovereignty

In ProofX, "Identity" is not a username/password on a server. It is a **Cryptographic Key Pair** managed by the Keychain.

*   **Non-Custodial**: Private keys NEVER leave the institution's secure environment.
*   **Role-Based**: Keys are assigned roles (`SIGNER`, `ADMIN`) on-chain.
*   **Rotatable**: Identity is persistent (the Institution), but credentials (keys) are ephemeral.

---

## 2. Key Lifecycle

### A. Generation (Client-Side)
Keys are generated using **Keychain** within a secure hardware element or encrypted local storage.
*   **Standard**: ECDSA (secp256k1)
*   **Structure**: Hierarchical Deterministic (HD) Wallets (BIP-32).
    *   `m/44'/60'/0'/0/0`: **Admin Key** (Cold Storage / Multi-Sig)
    *   `m/44'/60'/0'/0/1`: **Operational Prover Key** (Hot Wallet)

### B. Registration (On-Chain)
A key is only valid if authorized on the `ProofXVerifier` contract.
1.  **Institution** generates `Prover Public Key`.
2.  **Admin** (Multi-Sig) calls `grantRole(SIGNER_ROLE, proverAddress)`.
3.  **Contract** updates `AccessControl` registry.

### C. Usage (Signing)
The Prover Key signs *specific* proof commitments.
*   **Format**: EIP-191 (`"\x19Ethereum Signed Message:\n32" + proofHash`).
*   **Scope**: Authorization is limited to submitting proofs; it cannot modify contract state or grant roles.

### D. Rotation ( proactive )
*   **Frequency**: Every 30-90 days, or upon staff turnover.
*   **Flow**:
    1.  Generate new `Prover Key B`.
    2.  Admin calls `grantRole(SIGNER_ROLE, KeyB)`.
    3.  Admin calls `revokeRole(SIGNER_ROLE, KeyA)`.
    4.  **Zero Downtime**: Both keys work during the transition block.

---

## 3. Compromise & Recovery

### Scenario: Prover Key Leaked
*   **Detection**: Suspicious proof logs or internal audit.
*   **Immediate Action**: Admin calls `revokeRole(SIGNER_ROLE, leakedAddress)`.
    *   *Effect*: Leaked key can no longer generate valid proofs.
*   **Recover**: Perform Rotation flow to authorize a clean key.

### Scenario: Admin Key Lost
*   **Prevention**: Admin should remain a **Gnosis Safe (Multi-Sig)**, not a single hardware wallet.
    *   e.g., 3-of-5 signatures required.
*   **Recovery**: If partial keys are lost, use the remaining signers to rotate the lost owner key.

---

## 4. Authorization Model (RBAC)

The `ProofXVerifier.sol` implements strict Role-Based Access Control:

| Role | Key Type | Capabilities | Security Requirement |
|------|----------|--------------|----------------------|
| `DEFAULT_ADMIN_ROLE` | **Multi-Sig** | Grant/Revoke roles, Pause contract, Upgrade verifier. | **Cold Storage** (Ledger/Trezor via Safe) |
| `SIGNER_ROLE` | **Hot Wallet** | Sign proof hashes (`verifyProof`). | **HSM / Secure Enclave** |
| `PAUSER_ROLE` | **Guardian** | Emergency Halt (`pause`). | **Hot Wallet** (Automated Monitoring) |

---

## 5. Keychain Alignment

This design aligns with Keychain principles by:
1.  **Decoupling Identity from Keys**: The Institution is the "Admin" (State), while the Keys are just tools.
2.  **Standardization**: Uses generic Ethereum signatures (EIP-191), compatible with all standard wallets (Metamask, Ledger, Fireblocks).
3.  **Auditability**: Every key change (`RoleGranted`, `RoleRevoked`) is emitted as a blockchain event, creating an immutable audit trail.
