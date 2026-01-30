# ProofX Pre-Demo Checklist

## 🔗 Integration Flow Verified

```
Frontend                  Backend                   Contract
   │                         │                          │
   ├─── POST /prove ────────►│                          │
   │◄── commitment ──────────┤                          │
   │                         │                          │
   │ ┌─────────────────────┐ │                          │
   │ │ Keychain signs      │ │                          │
   │ │ raw commitment      │ │                          │
   │ └─────────────────────┘ │                          │
   │                         │                          │
   ├─── verifyProof(commitment, signature) ────────────►│
   │                         │    ┌──────────────────┐  │
   │                         │    │ ecrecover signer │  │
   │                         │    │ store under signer  │
   │                         │    └──────────────────┘  │
   │◄── ProofVerified event ────────────────────────────┤
```

---

## ✅ Pre-Demo Checks

| Check | Command / Action | Expected |
|-------|------------------|----------|
| 1. Prover running | `cd prover && npm start` | "Service running on :3001" |
| 2. Frontend running | `npm run dev` | Localhost:3000 works |
| 3. MetaMask on Sepolia | Check network dropdown | Sepolia selected |
| 4. Wallet has ETH | Check balance | > 0.01 ETH |
| 5. CONTRACT_ADDRESS set | Check `.env.local` | Valid 0x... address |
| 6. Frontend builds | `npm run build` | Exit code 0 |

---

## 🔐 Keychain Flow Checklist

| Step | What Happens | Verify |
|------|--------------|--------|
| 1 | Prover returns commitment | Console: "✅ Proof generated: 0x..." |
| 2 | Keychain signs raw bytes | Console: "🔑 Keychain signed commitment" |
| 3 | Contract verifyProof(commitment, sig) | MetaMask popup appears |
| 4 | Contract recovers signer | Event shows correct signer address |
| 5 | Proof stored under signer | `isVerified(signer)` returns true |

---

## ⚠️ Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Wallet not initialized" | Wrong network | Switch to Sepolia |
| "InvalidSignature" revert | Message format mismatch | Use raw commitment bytes |
| No MetaMask popup | Contract address empty | Set NEXT_PUBLIC_CONTRACT_ADDRESS |
| "Prover service failed" | Prover not running | `cd prover && npm start` |

---

## 🎯 Demo Script

1. **Start services** (do before judges arrive)
   ```bash
   # Terminal 1
   cd prover && npm start
   
   # Terminal 2
   npm run dev
   ```

2. **Connect wallet** — Click "Connect Wallet" button

3. **Select institution** — Choose "ACME Bank" (will pass)

4. **Click "Generate & Submit Proof"**
   - Wait for Keychain authorization popup
   - Sign the commitment
   - Confirm the transaction
   - Wait for blockchain confirmation

5. **Show result** — Point to:
   - ✅ Verification status
   - Transaction hash (link to Etherscan)
   - Signer address matches wallet

---

*Last verified: ETHIndia 2026*
