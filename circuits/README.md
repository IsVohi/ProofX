# ZK Circuits

This directory contains the Circom circuits for ProofX Protocol.

## Prerequisites

1. **Install Circom** (Rust-based compiler):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   git clone https://github.com/iden3/circom.git
   cd circom && cargo build --release
   cargo install --path circom
   ```

2. **Install dependencies**:
   ```bash
   cd circuits
   npm install
   ```

## Files

| File | Description |
|------|-------------|
| `compliance.circom` | Main circuit: proves (assets - liabilities) > threshold |
| `build/` | Compiled circuit outputs (generated) |

## Workflow

### 1. Compile Circuit
```bash
npm run compile
```
Outputs: `build/compliance.r1cs`, `build/compliance_js/`

### 2. Trusted Setup (One-time)
```bash
# Download Powers of Tau (community ceremony)
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O pot12_final.ptau

# Generate circuit-specific keys
npm run setup
npm run contribute
npm run export:vkey
```

### 3. Generate Solidity Verifier
```bash
npm run export:solidity
```
Creates `../blockchain/contracts/Groth16Verifier.sol`

### 4. Generate Proof (Backend)
```bash
# Create input.json with private/public inputs
node build/compliance_js/generate_witness.js build/compliance_js/compliance.wasm input.json witness.wtns
npm run prove
```

### 5. Verify Proof
```bash
npm run verify
```

## Input Format

Create `input.json`:
```json
{
  "assets": "1000000",
  "liabilities": "400000",
  "threshold": "500000"
}
```

This proves: `1000000 - 400000 = 600000 > 500000` ✓
