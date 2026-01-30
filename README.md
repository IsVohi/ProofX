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

## 🔐 Keychain Integration

ProofX uses Keychain as its cryptographic authorization layer. Before a compliance proof can be recorded on Ethereum, the submitting institution must sign the proof commitment with their private key. The smart contract verifies this signature on-chain using ECDSA recovery, ensuring that proofs can only be submitted by their rightful owners.

**What's Real:**
- ✅ Keychain signing (EIP-191 personal_sign)
- ✅ Blockchain transactions (Sepolia/Amoy)
- ✅ Smart contract verification

**What's Simulated:**
- ⚡ ZK proof generation (deterministic hash for hackathon)

---

## 🎯 Demo Flow

1. **Connect Wallet** — MetaMask on Sepolia
2. **Select Institution** — Choose compliance scenario
3. **Generate Proof** — Prover creates commitment
4. **Keychain Authorization** — Sign with your key
5. **Submit to Blockchain** — Real transaction
6. **Verified** — Check on Etherscan

---

## 📋 Environment Variables

Create `.env.local` in the root:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  # Deployed contract
NEXT_PUBLIC_PROVER_URL=http://localhost:3001
```

---

## 🛠️ Deployment

```bash
# 1. Configure blockchain/.env with your private key
cd blockchain
cp .env.example .env
# Edit with PRIVATE_KEY and RPC URLs

# 2. Deploy
npm run deploy:sepolia

# 3. Copy contract address to frontend .env.local
```

---

*Built for ETHIndia 2026*
