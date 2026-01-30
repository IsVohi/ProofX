# ProofX Protocol — Demo Safety Guide

## 🎯 Judge Pitch (One Paragraph)

> "ProofX Protocol enables institutions to prove regulatory compliance on Ethereum without exposing sensitive data. Our demo shows the complete flow: a simulated ZK prover generates a cryptographic commitment, which is then verified on-chain via a smart contract. The ZK proof generation is simulated for this hackathon — the circuit logic would be implemented in a production version using Circom or Noir. The on-chain verification is 100% real: you can verify every transaction on Etherscan."

---

## ✅ Pre-Demo Checklist

| Check | Status | Action if Failed |
|-------|--------|------------------|
| MetaMask installed & logged in | ☐ | Use backup laptop with MetaMask ready |
| Wallet has testnet ETH (>0.03) | ☐ | Top up 1 hour before demo |
| Prover service running (`localhost:3001`) | ☐ | `cd prover && npm start` |
| Frontend running (`localhost:3000`) | ☐ | `npm run dev` |
| Smart contract deployed | ☐ | Have contract address ready |
| RPC endpoint responding | ☐ | Test: `curl <RPC_URL>` |
| Network set to Sepolia | ☐ | Switch in MetaMask before demo |
| Browser DevTools closed | ☐ | Avoid showing console errors |

---

## 🛡️ Error Handling Matrix

| Failure Mode | Detection | User Message | Recovery |
|--------------|-----------|--------------|----------|
| **RPC Timeout** | Request >10s | "Network congestion detected..." | Retry with exponential backoff |
| **Wallet Rejected** | User denies tx | "Transaction cancelled" | Allow immediate retry |
| **Insufficient Funds** | Balance check | "Please add testnet ETH" | Show faucet link |
| **Wrong Network** | chainId check | "Please switch to Sepolia" | Auto-trigger network switch |
| **Prover Unreachable** | fetch fails | "Prover service unavailable" | Restart prover service |
| **Contract Error** | Revert | "Smart contract rejected proof" | Show commitment details |

---

## 🔄 Fallback Flow

### If Blockchain Demo Fails:

1. **Stay Calm** — Acknowledge: "Network conditions can be unpredictable"
2. **Show Architecture** — Navigate to `/architecture` page
3. **Explain the Flow** — Walk through the diagram
4. **Show Smart Contract** — Open `ProofXVerifier.sol` in editor
5. **Show Past Transaction** — Open Etherscan with a pre-verified tx

### Backup Etherscan Link:
```
Save a successful transaction hash before the demo!
https://sepolia.etherscan.io/tx/<YOUR_SUCCESSFUL_TX>
```

---

## ⚠️ What NOT To Do Live

| Don't | Why | Instead |
|-------|-----|---------|
| **Deploy contract live** | Compile can fail | Deploy 1 hour before |
| **Run npm install** | Dependencies can fail | Pre-install everything |
| **Switch MetaMask accounts** | Can trigger reconnect issues | Use dedicated demo wallet |
| **Clear browser data** | Loses MetaMask connection | Use incognito backup |
| **Show terminal with API keys** | Security risk | Use GUI or hide sensitive output |
| **Attempt multiple rapid transactions** | Nonce issues | Wait for confirmation |

---

## 💬 Honest Disclosures

**When asked "Is the ZK real?":**

> "The ZK proof generation is simulated for this hackathon. We generate a deterministic commitment hash that mimics a ZK circuit output. In production, this would be replaced with a real Circom or Noir circuit. However, the on-chain verification is 100% real — every transaction is recorded on Ethereum Sepolia, and you can verify it on Etherscan."

**When asked "What's simulated?":**

1. ✓ ZK circuit execution (simulated hash)
2. ✓ Compliance data (mock institutions)
3. ✗ Blockchain transactions (real)
4. ✗ Smart contract verification (real)
5. ✗ Gas costs (real testnet ETH)

---

## 🚀 Confidence Builders

1. **Pre-record a backup video** — Screen record one successful demo flow
2. **Have Etherscan tab open** — Shows credibility of on-chain activity
3. **Know your block explorer** — Navigate confidently to show tx details
4. **Practice the fallback** — Run through failure scenarios once
5. **Time your demo** — Blockchain confirmations take ~12-15s on Sepolia

---

## 📱 Emergency Contacts

| Issue | Solution |
|-------|----------|
| Sepolia down | Switch to Polygon Amoy (update network) |
| MetaMask stuck | Hard refresh browser, reconnect |
| Prover crashed | `cd prover && node server.js` |
| RPC rate limited | Use backup RPC from Infura |

---

*Last updated: ETHIndia 2026*
