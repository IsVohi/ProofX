# ProofX Protocol — ZK Architecture

## Overview

ProofX enables financial institutions to prove regulatory compliance (e.g., capital adequacy) without revealing sensitive financial data. The proof is verified on Ethereum.

---

## 1. Input Classification

### Private Inputs (Never Leave the Prover)
These values are known only to the institution. They are used to compute the proof but are **never transmitted** to the blockchain or any external party.

| Input | Example | Description |
|-------|---------|-------------|
| `tier1Capital` | $50M | Core equity capital |
| `tier2Capital` | $20M | Supplementary capital |
| `riskWeightedAssets` | $500M | Denominator for CAR |
| `institutionSecret` | 0x... | Optional: binds proof to identity |

### Public Inputs (Visible On-Chain)
These values are part of the proof's "public statement." Anyone can see them.

| Input | Example | Description |
|-------|---------|-------------|
| `threshold` | 8 (representing 8%) | Minimum required ratio |
| `metricType` | 1 (CAR) | Enum for compliance type |
| `timestamp` | 1706600000 | Proof generation time |
| `institutionId` | 0xABC... | Public identifier (optional) |

---

## 2. What the Proof Asserts

The ZK proof makes **exactly one claim**:

> "I know private values (tier1Capital, tier2Capital, riskWeightedAssets) such that:
> 
> **(tier1Capital + tier2Capital) / riskWeightedAssets ≥ threshold**
> 
> …and I am not revealing those values."

### Proof Output Type
- **Boolean:** The circuit outputs `1` (compliant) or fails to generate a valid proof.
- There is no "partial compliance." Either the proof verifies, or it doesn't.

---

## 3. Trust Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                     TRUSTED ZONE                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Institution's Environment                          │   │
│  │  - Private Inputs stored here                       │   │
│  │  - Proof generation happens here                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Proof + Public Inputs
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   UNTRUSTED ZONE                            │
│  ┌─────────────────┐    ┌─────────────────────────────┐    │
│  │  ProofX Backend │    │  Ethereum Blockchain        │    │
│  │  (Relay only)   │    │  (Verifier Contract)        │    │
│  └─────────────────┘    └─────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Who Trusts Whom?

| Entity | Trusts | Does NOT Trust |
|--------|--------|----------------|
| Blockchain | Math (Groth16 verifier) | Backend, Frontend, Institution |
| Backend | Nothing | It only relays data |
| Frontend | User's wallet (Keychain) | Backend responses are verified |
| Regulator | Blockchain state | Nothing else |

---

## 4. Blockchain Knowledge Boundaries

### What the Blockchain KNOWS
- ✅ The proof is mathematically valid
- ✅ The public threshold (e.g., 8%)
- ✅ The timestamp of verification
- ✅ The signer's Ethereum address (via Keychain)
- ✅ That "someone" passed compliance

### What the Blockchain NEVER KNOWS
- ❌ The actual capital amounts
- ❌ The actual ratio (e.g., 14%)
- ❌ Any private inputs
- ❌ Which specific data was used
- ❌ How "close" or "far" above threshold

---

## 5. Upgrade Path: Demo → Production

### Current State (Demo)
| Component | Status |
|-----------|--------|
| Proof Generation | **Simulated** (keccak256 hash) |
| Verification | **Mock** (first byte check) |
| Circuit | None |
| Trusted Setup | None |

### Production State
| Component | Implementation |
|-----------|----------------|
| Proof Generation | Circom + SnarkJS (Groth16) |
| Verification | Auto-generated `Verifier.sol` |
| Circuit | `compliance.circom` |
| Trusted Setup | Powers of Tau + Phase 2 |

### Migration Steps

1. **Write Circuit**
   - Create `circuits/compliance.circom`
   - Define constraints for CAR calculation
   - Compile with `circom`

2. **Trusted Setup**
   - Download Powers of Tau file (community ceremony)
   - Run Phase 2 for ProofX-specific circuit
   - Generate `proving_key.zkey` and `verification_key.json`

3. **Generate Verifier Contract**
   - Run `snarkjs zkey export solidityverifier`
   - Deploy new `Groth16Verifier.sol`
   - Update `ProofXVerifier` to call it

4. **Update Backend**
   - Replace `generateMockProof()` with `snarkjs.groth16.fullProve()`
   - Return `{ proof, publicSignals }` instead of hash

5. **Update Frontend**
   - Pass full proof object to contract
   - Contract calls `Groth16Verifier.verifyProof()`

---

## 6. Assumptions

1. **Honest Prover Environment**
   - The institution's machine is not compromised.
   - Private inputs are correct (garbage in = garbage out).

2. **Correct Circuit**
   - The Circom circuit accurately represents the compliance rule.
   - Circuit is audited before production.

3. **Trusted Setup Integrity**
   - At least one participant in the ceremony was honest.
   - "Toxic waste" was properly destroyed.

4. **No Data Oracle**
   - The system does NOT verify that inputs match real-world data.
   - That requires a data oracle or auditor attestation (future scope).

---

## 7. Limitations

| Limitation | Explanation |
|------------|-------------|
| No real-time data | Proof is a snapshot; doesn't reflect changes |
| No cross-institution aggregation | Each proof is independent |
| Fixed logic | Changing rules requires new circuit + setup |
| 64-bit precision | Large numbers need careful scaling |
| No revocation | Once verified, cannot be "un-verified" |

---

## 8. Security Properties

| Property | Guarantee |
|----------|-----------|
| **Soundness** | Cannot create valid proof without satisfying constraints |
| **Zero-Knowledge** | Verifier learns nothing beyond "compliant or not" |
| **Succinctness** | Proof is ~300 bytes, verification is ~200k gas |
| **Non-Interactivity** | Single message from prover to verifier |

---

*Document Version: 1.0 — Pre-Production Architecture*
