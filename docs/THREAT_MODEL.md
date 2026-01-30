# ProofX Protocol — Threat Model & Trust Assumptions

> **Scope**: ZK Circuits, Prover Service, Keychain Signing, Verifier Contracts
> **Version**: 1.0 (Demo Architecture)
> **Date**: 2026-01-30

---

## 1. Trust Assumptions

These are the conditions that **must** be true for the system to be secure. If any of these are violated, the system fails.

| Component | Assumption | Risk Level | Notes |
|-----------|------------|------------|-------|
| **Trusted Setup** | All participants in the Phase 2 ceremony deleted their toxic waste. | 🔴 **CRITICAL** | **CURRENT STATUS: BROKEN.** Local setup = 100% trust in the developer. |
| **Prover Privacy** | The Prover Service (backend) does not log, store, or leak user's private inputs (`assets`, `liabilities`). | 🔴 **CRITICAL** | Current architecture sends private data to server. Users MUST trust the server operator. |
| **Circuit Logic** | The Circom circuit correctly implements the `assets - liabilities > threshold` logic without underflow loopholes. | 🟡 Medium | Reviewed, but not formally verified. |
| **Cryptography** | The BN254 curve and Groth16 scheme remain cryptographically sound (no quantum breaks). | 🟢 Low | Standard industry assumption (Ethereum precompiles rely on this). |
| **Blockchain** | The underlying L1/L2 (Sepolia/Amoy) ensures data availability and correct execution. | 🟢 Low | Standard assumption. |

---

## 2. Attacker Capabilities & Threats

| Threat Actor | Capability | Attack Vector | Mitigation in Place |
|--------------|------------|---------------|---------------------|
| **Malicious User** | Knows private inputs, wants to submit invalid proof. | **Forged Proof**: Try to prove compliance when insolvent. | ✅ **ZK Soundness**: Groth16 math prevents this. |
| **Network Snooper** | Can intercept HTTP traffic between User and Prover. | **Data Leak**: Read `assets`/`liabilities` in transit. | ❌ **None (HTTP)**. Prod requires HTTPS + Client-side proving. |
| **Malicious Operator** | Controls the Prover Service. | **Data Exfiltration**: Log user inputs to DB. | ❌ **None**. Operator has full visibility. |
| **Replay Attacker** | Observes valid proof on-chain. | **Replay**: Resubmit same proof today to claim compliance. | ⚠️ **Partial**. Logs timestamp, but contract doesn't enforce freshness. |
| **Toxic Waste Holder** | Has the `pot12_*.ptau` secrets. | **God Mode**: Forge fake proofs for ANY inputs. | ❌ **None**. Local setup allows this. |

---

## 3. Demo vs. Production Architecture

| Feature | Demo (Current) | Production (Required) | Risk of Deployment |
|---------|----------------|-----------------------|--------------------|
| **Trusted Setup** | Local (Single Developer) | **MPC Ceremony** (Many participants) | **Fatal**: Developer can forge arbitrary proofs. |
| **Proof Generation** | **Server-side** (Node.js) | **Client-side** (Browser WASM) | **High**: Server sees private data. Violates "Trustlessness". |
| **Transport** | HTTP | HTTPS / Local | **High**: Data leak in transit. |
| **Replay Protection** | None (Timestamp log only) | **Nonce / Epoch** in Circuit | **Medium**: Old proofs could be reused. |
| **Availability** | Single Server | Decentralized / User Device | **Medium**: Single point of failure. |

---

## 4. Production Blockers

These issues make the system **UNACCEPTABLE** for mainnet usage involving real value.

### ⛔ BLOCKER 1: Single-Party Trusted Setup
- **Issue**: Since I (the developer) generated the `.zkey` locally, I theoretically possess the random parameters to forge valid proofs for *any* statement.
- **Consequence**: The "Proof" in ProofX is properly worthless to a third party. They must trust I am not cheating.
- **Fix**: Run a snarkjs Phase 2 ceremony with external contributors.

### ⛔ BLOCKER 2: Server-Side Proving (Privacy Violation)
- **Issue**: Users send `assets` and `liabilities` to `POST /prove`.
- **Consequence**: This is not "Zero Knowledge" for the user; it is "Trusted Third Party". If the server is hacked or the operator is malicious, financial data is leaked.
- **Fix**: Move `snarkjs.fullProve()` to the **Frontend (Browser)**. The server should only serve the `.wasm` and `.zkey` files.

### ⛔ BLOCKER 3: Lack of Replay Protection
- **Issue**: A valid proof generated on Day 1 (when compliant) can be submitted on Day 30 (when insolvent) if the public input (`threshold`) hasn't changed.
- **Consequence**: Compliance checks can be bypassed using stale data.
- **Fix**: Add a `public input signal nonce` or `blockLimit` to the circuit.

---

## 5. Mitigation Roadmap

### Phase 1: hardening (Current)
- [x] Implemented correct math `assets - liabilities > threshold`
- [x] Added underflow protection
- [x] Basic signature authorization (Keychain)

### Phase 2: Decentralization (Next Steps)
1. **Move Proving to Client**:
   - Port `snarkjs.fullProve` to `useProofX.ts`.
   - Host `compliance.wasm` and `circuit_final.zkey` on public CDN/IPFS.
   - **Result**: User data NEVER leaves their device.

2. **Run MPC Ceremony**:
   - Initialize Phase 2.
   - Invite 3+ independent parties to contribute randomness.
   - Generate final `.zkey` and Verifier.
   - **Result**: No single party can forge proofs.

3. **Add Freshness**:
   - Update Circuit: `template CapitalAdequacy(N_BITS, NONCE)`
   - Contract: `mapping(uint256 => bool) usedNonces`
   - **Result**: Proofs are one-time use.

---

## 6. Conclusion

ProofX is currently in **"Trusted Demo Mode"**.
It effectively demonstrates the UX and on-chain mechanics of ZK compliance.
However, it currently relies on **Trust** (in the developer and server) rather than **Math** for privacy and integrity.

**Do not deploy to mainnet without executing Phase 2 of the roadmap.**
