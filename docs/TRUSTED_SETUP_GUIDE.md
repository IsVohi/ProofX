# Groth16 Trusted Setup Guide

## Overview

This guide walks through generating the trusted setup artifacts for the ProofX compliance circuit using snarkjs and the Groth16 proving system.

> ⚠️ **Demo-Only Setup**
> This uses a single-party setup suitable for development and demos.
> For production, use a multi-party ceremony (MPC) to ensure no single party knows the "toxic waste."

---

## Prerequisites

1. **Circom installed** (v2.1.6+)
2. **Node.js** (v18+)
3. **Circuit compiled** (see circuits/README.md)

```bash
cd circuits
npm install
```

---

## Step-by-Step Commands

### Step 1: Compile the Circuit

```bash
# Compile Circom circuit to R1CS + WASM
circom compliance.circom --r1cs --wasm --sym -o build
```

**Files Produced:**
| File | Location | Description |
|------|----------|-------------|
| `compliance.r1cs` | `circuits/build/` | Constraint system |
| `compliance.wasm` | `circuits/build/compliance_js/` | Witness generator |
| `compliance.sym` | `circuits/build/` | Symbol table (debugging) |

---

### Step 2: Download Powers of Tau

The "Powers of Tau" is a universal trusted setup ceremony that many projects share.
We use the Hermez/Iden3 community ceremony.

```bash
# Download pre-computed ceremony file (12 = 2^12 = 4096 constraints max)
# For larger circuits, use pot14, pot16, etc.
curl -O https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau
mv powersOfTau28_hez_final_12.ptau build/pot12_final.ptau
```

**Files Produced:**
| File | Location | Description |
|------|----------|-------------|
| `pot12_final.ptau` | `circuits/build/` | Universal ceremony file |

> **Note:** This file is from a real multi-party ceremony. It is trustworthy.

---

### Step 3: Generate Circuit-Specific Setup (Phase 2)

```bash
# Generate initial zkey (Phase 2 Step 0)
snarkjs groth16 setup build/compliance.r1cs build/pot12_final.ptau build/circuit_0000.zkey
```

**Files Produced:**
| File | Location | Description |
|------|----------|-------------|
| `circuit_0000.zkey` | `circuits/build/` | Initial proving key |

---

### Step 4: Contribute Randomness (Demo-Only)

In production, multiple parties contribute randomness in sequence.
For demo, we do a single contribution.

```bash
# Add entropy from "ProofX Demo"
snarkjs zkey contribute build/circuit_0000.zkey build/circuit_final.zkey \
    --name="ProofX Demo Contribution" \
    -e="random entropy string for demo purposes only"
```

**Files Produced:**
| File | Location | Description |
|------|----------|-------------|
| `circuit_final.zkey` | `circuits/build/` | Final proving key (DEMO) |

> ⚠️ **DEMO-ONLY:** In production, delete `circuit_0000.zkey` and run multiple contributions.

---

### Step 5: Export Verification Key

```bash
# Extract the verification key (used by Solidity verifier)
snarkjs zkey export verificationkey build/circuit_final.zkey build/verification_key.json
```

**Files Produced:**
| File | Location | Description |
|------|----------|-------------|
| `verification_key.json` | `circuits/build/` | On-chain verification parameters |

---

### Step 6: Verify the Setup (Optional but Recommended)

```bash
# Check that the zkey was generated correctly
snarkjs zkey verify build/compliance.r1cs build/pot12_final.ptau build/circuit_final.zkey
```

**Expected Output:**
```
[INFO]  snarkJS: ZKey Ok!
```

---

## Summary of Artifacts

| Artifact | Purpose | Demo-Safe? | Production? |
|----------|---------|------------|-------------|
| `compliance.r1cs` | Constraint system | ✅ | ✅ |
| `compliance.wasm` | Generate witness | ✅ | ✅ |
| `pot12_final.ptau` | Universal setup | ✅ | ✅ (community) |
| `circuit_0000.zkey` | Initial key | ✅ | ❌ Delete after |
| `circuit_final.zkey` | Proving key | ✅ Demo | ❌ Need MPC |
| `verification_key.json` | Verify proofs | ✅ | ✅ |

---

## File Storage Recommendations

```
circuits/
├── compliance.circom        # Source circuit
├── package.json
├── README.md
└── build/
    ├── compliance.r1cs      # Constraint system
    ├── compliance.sym       # Symbols (optional)
    ├── pot12_final.ptau     # Powers of Tau
    ├── circuit_0000.zkey    # DELETE after setup
    ├── circuit_final.zkey   # Proving key (keep secure)
    ├── verification_key.json # Verification (public)
    └── compliance_js/
        ├── compliance.wasm  # Witness generator
        ├── generate_witness.js
        └── witness_calculator.js
```

---

## Next Steps (Not in This Guide)

1. **Generate Solidity Verifier:**
   ```bash
   snarkjs zkey export solidityverifier build/circuit_final.zkey Groth16Verifier.sol
   ```

2. **Integrate with Backend:**
   - Replace `generateMockProof()` with `snarkjs.groth16.fullProve()`

3. **Production Setup:**
   - Run multi-party ceremony with 3+ independent contributors
   - Publish contribution hashes for auditability

---

*Document Version: 1.0 — Demo Setup*
