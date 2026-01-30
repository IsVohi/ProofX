# ProofX Operational Playbook

> **Scope**: Deployment, Monitoring, Incident Response
> **Target Audience**: DevOps, Security, Smart Contract Admins
> **Date**: 2026-01-30

---

## 1. Deployment Architecture

ProofX operates as a hybrid system: a centralized Prover Service (for convenience/demos) or Client-Side Proving (Production Target) interacting with decentralized Smart Contracts.

### Infrastructure Diagram

```mermaid
graph TD
    subgraph "Cloud / On-Prem (Prover)"
        LB[Load Balancer (WAF)] --> API[Prover API]
        API -->|Task| Worker[ZK Worker (Docker)]
        Worker -- Read Only --> Artifacts[(.zkey / .wasm)]
    end
    
    subgraph "Blockchain (Polygon Amoy / Ethereum)"
        Contract[ProofXVerifier.sol]
        ZK[Groth16Verifier]
        Contract -->|Call| ZK
    end
    
    subgraph "Monitoring"
        Org[Graph Node / Subgraph] .->|Index| Contract
        Sent[Sentinel / Tenderly] .->|Alert| DevOps
    end
    
    User -->|HTTPS| LB
    Worker -->|Tx / Proof| Contract
```

### Component Checklist
*   **Prover Service**: Stateless Docker containers (auto-scaling based on CPU).
*   **Smart Contracts**: Immutable `Groth16Verifier`, Upgradable `ProofXVerifier` (via logic swap or fresh deploy).
*   **Key Management**: AWS KMS or HashiCorp Vault for "Admin" key; Signer keys injected into Workers.

---

## 2. Monitoring & Alerting

We monitor both the **Health of the Service** and the **Integrity of the Protocol**.

### 🔍 Off-Chain (Infrastructure)
| Metric | Threshold | Alert Logic |
|--------|-----------|-------------|
| **Proof Gen Time** | > 3000ms | Performance degradation or large inputs. |
| **Error Rate** | > 1% | Circuit inputs invalid or bug in wasm. |
| **CPU Usage** | > 80% | Scale out workers. |

### ⛓️ On-Chain (Protocol Integrity)
*Use tools like OpenZeppelin Sentinel or Tenderly.*

| Event / State | Severity | Alert Action |
|---------------|----------|--------------|
| `ProofVerified` (Failure) | 🟡 Medium | Investigate specific signer. |
| `RoleGranted` / `Revoked` | 🔴 High | **IMMEDIATE NOTIFICATION** to Admin. Check if authorized. |
| `Paused` | 🔴 High | Protocol halted. All hands on deck. |
| **Gas Spike** | 🟡 Medium | Update gas limits in prover config. |

---

## 3. Incident Response Playbooks

### 🚨 Scenario A: Prover Key Compromise
**Symptoms**: Unrecognized transactions, `ProofVerified` events from known signer but unknown IP.
1.  **Identify**: Confirm which `signerAddress` is compromised.
2.  **Contain**:
    *   **Admin** calls `revokeRole(SIGNER_ROLE, signerAddress)`.
    *   *Effect*: Key can no longer verify proofs. Service stops accepting that key.
3.  **Recover**:
    *   Generate new Key Pair.
    *   **Admin** calls `grantRole(SIGNER_ROLE, newAddress)`.
    *   Redeploy Prover Service with new private key.

### 🚨 Scenario B: Critical Bug in Circuit
**Symptoms**: Verifier accepting invalid proofs (false positives).
1.  **Contain**:
    *   **Admin** calls `pause()` on `ProofXVerifier`.
    *   *Effect*: All verifications revert. Protocol is safe but frozen.
2.  **Remediate**:
    *   Fix `compliance.circom`.
    *   **Run New Trusted Setup** (Phase 2).
    *   Deploy new `Groth16Verifier_v2.sol`.
3.  **Restore**:
    *   Deploy `ProofXVerifier_v2` pointing to new ZK Verifier.
    *   Migrate data (if needed) or simply start fresh.
    *   Unpause (or point frontend to new address).

---

## 4. Upgrade Strategy

ProofX contracts are **Immutable** by default for trust, but the *system* is upgradable.

### Circuit Upgrades
1.  **Compile & Setup**: Generate new `.zkey`, `.wasm`, and `Verifier.sol`.
2.  **Deployment**: Deploy new Verifier Contract.
3.  **Switch**:
    *   *Option A (Hard Fork)*: Deploy new `ProofXVerifier` pointing to new ZK logic. Update Frontend config.
    *   *Option B (Proxy)*: If using UUPS Proxy, upgrade implementation to point to new ZK Verifier.

### Key Rotation Schedule
*   **Signer Keys**: Rotate every 90 days.
*   **Admin Keys**: Rotate only if signers change (Multi-Sig governance).
