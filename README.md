# ProofX Protocol

**Hackathon-ready compliance verification on Ethereum with Keychain authorization.**

---

## 🚀 Quick Start

```bash
# 1. Install all dependencies
npm run setup

# 2. Configure environment (single file for everything)
cp .env.example .env
# Edit .env with your settings

# 3. Run everything
npm run dev
```

This starts:
- **Frontend** on `http://localhost:3000`
- **Prover Service** on `http://localhost:3001`

---

## ⚙️ Environment Variables (Single .env file)

```env
# Contract address (set after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Prover service
NEXT_PUBLIC_PROVER_URL=http://localhost:3001
PROVER_PORT=3001

# Deployment (your wallet key)
PRIVATE_KEY=your_private_key_without_0x
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend + prover together |
| `npm run dev:frontend` | Run frontend only |
| `npm run prover` | Run prover service only |
| `npm run build` | Build production frontend |
| `npm run setup` | Install all dependencies |
| `npm run compile` | Compile smart contracts |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run deploy:amoy` | Deploy to Polygon Amoy |

---

## 🔧 Project Structure

```
ProofX/
├── app/                    # Next.js pages
│   └── prototype/          # Demo page
├── lib/                    # Web3 integration
│   ├── config.ts          # Contract ABI & addresses
│   ├── web3-context.tsx   # Wallet connection
│   └── useProofX.ts       # Proof flow orchestration
├── prover/                 # Backend prover service
│   └── server.js          # Express API
├── blockchain/             # Smart contracts
│   ├── contracts/         # Solidity files
│   └── scripts/           # Deployment scripts
└── docs/                   # Documentation
```

---

## 🔐 Keychain Integration & ZK Privacy

ProofX uses Keychain as its cryptographic authorization layer and Groth16 for privacy.

**What's Real:**
- ✅ **Groth16 Zero-Knowledge Proofs** (Real circuit execution)
- ✅ **Keychain Signing** (EIP-191 personal_sign)
- ✅ **Blockchain Verification** (Sepolia/Amoy)
- ✅ **Trusted Issuers Registry** (On-chain verification)

**Trusted Issuers Supported:**
- 🏛️ **UIDAI** (Aadhaar/eKYC with XML DSig)
- 🏦 **Central Banks** (RBI, Federal Reserve)
- 🏢 **Commercial Banks** (HDFC, SBI)
- 📊 **Credit Bureaus** (CIBIL)

---

## 🎯 Demo Flow

1. **Connect Wallet** — MetaMask on Sepolia
2. **Select Verification** — KYC, Capital, Bank, etc.
3. **Upload Document** — Upload real JSON (e.g., Aadhaar) or use sample
4. **Generate Proof** — Client-side ZK proof generation
5. **Keychain Authorization** — Sign with your key
6. **Submit to Blockchain** — Real transaction
7. **Download Proof** — Export standardized JSON proof

---

## 📋 Environment Variables

Create `.env` in the root (see `.env.example`):

```env
# Contract Address (Sepolia)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x3146ee369B979c2f776C3A74790b228C6BfE0673

# Prover Service
NEXT_PUBLIC_PROVER_URL=http://localhost:3001

# Blockchain (for deployment)
PRIVATE_KEY=your_private_key
RPC_URL=https://sepolia.infura.io/v3/...
```

---

## 🛠️ Deployment

```bash
# 1. Install dependencies
npm run setup

# 2. Compile circuits (optional, artifacts included)
# npm run compile:circuits

# 3. Deploy contracts
npm run deploy:sepolia

# 4. Start app
npm run dev
```

---

*Built for ETHGlobal*
