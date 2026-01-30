# Keychain Integration — Architectural Overview

## What Keychain Is Responsible For

Keychain serves as the **Secure Cryptographic Authorization Layer** in ProofX Protocol:

1. **Wallet Authentication** — Verifies that the entity submitting a proof is authorized to represent the claimed institution
2. **Transaction Signing** — Provides secure key management for signing blockchain transactions
3. **Session Authorization** — Manages cryptographic sessions between the prover and the on-chain verifier
4. **Credential Binding** — Binds institutional identity to wallet addresses without exposing PII

---

## What Keychain Is NOT Responsible For

| Layer | Responsibility |
|-------|----------------|
| ZK Proof Generation | Handled by Prover Service (simulated) |
| Compliance Logic | Runs off-chain, never touches Keychain |
| Smart Contract Verification | Immutable on-chain logic in ProofXVerifier |
| Data Storage | No data stored — commitments only |

Keychain does **not** perform proof verification, store compliance data, or execute business logic.

---

## Trust Boundary Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TRUST BOUNDARY                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐          ┌─────────────┐          ┌─────────────────┐    │
│   │ Institution │  ──────▶ │   Prover    │  ──────▶ │   KEYCHAIN      │    │
│   │ (Off-chain) │  data    │  (Simulated)│  commit  │ (Authorization) │    │
│   └─────────────┘          └─────────────┘          └────────┬────────┘    │
│                                                               │             │
│                                                        signs tx│             │
│                                                               ▼             │
│                                                    ┌──────────────────┐    │
│                                                    │  ProofXVerifier  │    │
│                                                    │   (Ethereum)     │    │
│                                                    └──────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Keychain sits between proof generation and on-chain submission**, ensuring only authorized entities can submit proofs.

---

## Updated System Flow

```
1. Institution prepares compliance data (off-chain, private)
2. Prover Service generates commitment hash (simulated ZK)
3. Keychain authenticates the institution's wallet
4. Keychain authorizes and signs the transaction
5. Signed transaction submitted to ProofXVerifier
6. Smart contract verifies commitment, emits event
7. Result returned to frontend
```

---

## Why Keychain Fits ProofX (3 Sentences)

1. **ProofX requires cryptographic assurance that only legitimate institutions can submit compliance proofs — Keychain provides this authorization layer without exposing private keys or credentials.**

2. **By separating authorization (Keychain) from verification (smart contract), ProofX achieves defense-in-depth: even if a proof is valid, it won't be accepted unless the submitter is authorized.**

3. **Keychain's session-based signing model allows institutions to pre-authorize proof submissions without manual wallet interaction for each transaction, enabling scalable, enterprise-grade compliance verification.**

---

*Integration Point: Keychain SDK would replace or wrap the current MetaMask signing flow in `lib/web3-context.tsx`.*
