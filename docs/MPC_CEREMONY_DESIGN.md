# ProofX Protocol — MPC Trusted Setup Ceremony Design

> **Status**: Draft
> **Protocol**: Groth16 (bn128)
> **Tooling**: snarkjs

---

## 1. Objective
To generate the **Proving Key** and **Verification Key** for the ProofX ZK circuits in a way that is:
1.  **Trustless**: No single party possesses the "toxic waste" (randomness) to forge proofs.
2.  **Verifiable**: The entire contribution transcript is public and mathematically auditable.
3.  **Secure**: Only **one** participant needs to be honest for the entire setup to be secure (1-of-N assumption).

---

## 2. Methodology: Two-Phase Ceremony

We will utilize the industry-standard **Groth16 MPC Flow**:

### Phase 1: Powers of Tau (Universal)
*   **Goal**: Generate universal parameters for the BN254 curve.
*   **Strategy**: Use the existing **Hermez / Polygon zkEVM** perpetual Powers of Tau.
    *   *Why?* It has thousands of contributors, has been audited, and saves months of computation.
    *   *Selection*: `powersOfTau28_hez_final_12.ptau` (supports 2^12 = 4k constraints, enough for our circuit).

### Phase 2: Circuit-Specific Setup (The Ceremony)
*   **Goal**: Generate the circuit-specific relation keys.
*   **Process**: Sequential contributions by multiple independent parties.
*   **Outcome**: `circuit_final.zkey` and `verification_key.json`.

---

## 3. Ceremony Roles

| Role | Responsibilities | Requirements |
|------|------------------|--------------|
| **Coordinator** | Initializes ceremony, manages the queue, verifies contributions, publishes final keys. | High availability server, `snarkjs`. |
| **Contributor** | Downloads latest key, adds randomness (entropy), uploads new key. | Standard laptop/server, Docker (optional). |
| **Verifier** | Independent observer who downloads the transcript and verifies the hash chain. | Any machine. |

---

## 4. Operational Workflow (Phase 2)

### Step 1: Initialization (Coordinator)
The Coordinator compiles the circuit and prepares the Phase 2 file using Phase 1.

```bash
# 1. Compile Circuit
circom compliance.circom --r1cs --wasm --sym

# 2. Import Phase 1 (Powers of Tau)
snarkjs groth16 setup compliance.r1cs pot12_final.ptau circuit_0000.zkey
```

### Step 2: Contributions (Sequential)
Participants take turns. The output of Participant A becomes the input for Participant B.

**Round 1: Alice**
```bash
# Alice contributes randomness
snarkjs zkey contribute circuit_0000.zkey circuit_0001.zkey --name="Alice" -v
# Alice destroys 'circuit_0001.zkey' after sending to Bob/Coordinator
```

**Round 2: Bob**
```bash
# Bob contributes on top of Alice's output
snarkjs zkey contribute circuit_0001.zkey circuit_0002.zkey --name="Bob" -v
```

**Round 3: Charlie**
```bash
# Charlie contributes on top of Bob's output
snarkjs zkey contribute circuit_0002.zkey circuit_0003.zkey --name="Charlie" -v
```

### Step 3: Random Beacon (Coordinator)
To prevent the last contributor from grinding parameters, a "Random Beacon" is applied. This is a delay function or a high-entropy value from a public source (e.g., Bitcoin block hash #9,000,000).

```bash
snarkjs zkey beacon circuit_0003.zkey circuit_final.zkey \
    0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f \
    10 -n="Final Beacon"
```

### Step 4: Verification & Export
The Coordinator verifies the entire chain and exports the keys.

```bash
# Verify the entire chain of validity
snarkjs zkey verify compliance.r1cs pot12_final.ptau circuit_final.zkey

# Export Verification Key (for Contract)
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

# Export Solidity Verifier
snarkjs zkey export solidityverifier circuit_final.zkey Verifier.sol
```

---

## 5. Security & Trust Model

*   **1-of-N Security**: If Alice, Bob, and the Coordinator are malicious, but **Charlie is honest** (deletes his toxic waste), the entire setup is secure.
*   **Toxic Waste**: The random values `tau`, `alpha`, `beta` used to generate contributions.
    *   *Mitigation*: Contributors use ephemeral machines (Docker containers) and terminate them immediately after upload.
*   **Public Verification**: The final `circuit_final.zkey` includes a transcript of all contributions. Anyone can verify that "Alice's contribution" is included in the final key.

---

## 6. Disaster Recovery / Compromise

**Scenario**: It is revealed that ALL participants colluded or were compromised.

**Response**:
1.  **Halt**: Pause the `ProofXVerifier` contract (if pausable) or deploy a new one.
2.  **Rotate**:
    *   Run a **NEW** ceremony with a wider set of participants (e.g., public community call).
    *   Generate new `.zkey` and `Verifier.sol`.
3.  **Upgrade**:
    *   Deploy new `Groth16Verifier`.
    *   Update `ProofXVerifier` to point to the new verifier address.

---

## 7. Operational Checklist for Production

- [ ] **Select Phase 1**: Verify the SHA256 of `pot12_final.ptau` matches the official Hermez release.
- [ ] **Define Order**: Create a public schedule of contributors.
- [ ] **Public Attestation**: Each contributor signs a message "I contributed to ProofX round X and deleted my waste".
- [ ] **Publish Transcript**: Host the intermediate `.zkey` files (or hashes) for public audit.
- [ ] **Deploy Verifier**: Deploy the final `Groth16Verifier.sol` and verify source code on Etherscan.
