# 🔑 Where to Get Environment Variables

Here is exactly where to get every value for your `.env` file.

## 1. `PRIVATE_KEY` (Your Wallet)
**Where:** MetaMask Browser Extension
1. Open MetaMask.
2. Click the **three dots** (top right) > **Account Details**.
3. Click **Show Private Key**.
4. Enter your password and confirm.
5. **Copy the key**.
   - ⚠️ **IMPORTANT:** Paste it **WITHOUT** the `0x` at the start.
   - Example: If key is `0xabc123...`, paste `abc123...`

---

## 2. `SEPOLIA_RPC_URL` (Connection to Ethereum)
**Where:** [Alchemy](https://www.alchemy.com/) (Recommended) or [Infura](https://www.infura.io/)

**Using Alchemy (Easiest):**
1. Go to [alchemy.com](https://www.alchemy.com/) and sign up (free).
2. Dashboard > **+ Create new app**.
   - Chain: **Ethereum**
   - Network: **Sepolia**
3. Click **API Key** button on your new app.
4. Copy the **HTTPS** URL.
   - Looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

---

## 3. `AMOY_RPC_URL` (Connection to Polygon)
**Where:** Public Endpoint (Free/Instant) or Alchemy

**Option A (Public - Instant):**
- Use this exact URL: `https://rpc-amoy.polygon.technology/`

**Option B (Reliable - Alchemy):**
1. Create new app on [Alchemy](https://www.alchemy.com/).
   - Chain: **Polygon**
   - Network: **Polygon Amoy**
2. Copy the **HTTPS** URL.

---

## 4. `ETHERSCAN_API_KEY` (Optional - For verifying contracts)
**Where:** [Etherscan](https://etherscan.io/)
1. Go to [etherscan.io](https://etherscan.io/register) and sign up.
2. Sidebar > **API Keys**.
3. Click **+ Add**.
4. Copy the key.

---

## 5. `NEXT_PUBLIC_CONTRACT_ADDRESS`
**Where:** Your Terminal (After Deployment)
1. Fill in the keys above (`PRIVATE_KEY` and `SEPOLIA_RPC_URL`) in your `.env` file first.
2. Run this command in your terminal:
   ```bash
   npm run deploy:sepolia
   ```
3. Look for the output line:
   ```
   ✅ ProofXVerifier deployed to: 0x123...
   ```
4. Copy that address (`0x123...`) and paste it into `.env`.

---

## 📝 Summary of `.env` file

```env
# 1. Run 'npm run deploy:sepolia' to get this
NEXT_PUBLIC_CONTRACT_ADDRESS=

# 2. Defaults (Don't change)
NEXT_PUBLIC_PROVER_URL=http://localhost:3001
PROVER_PORT=3001

# 3. From MetaMask (Remove 0x prefix!)
PRIVATE_KEY=

# 4. From Alchemy.com
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# 5. Public URL
AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
```
