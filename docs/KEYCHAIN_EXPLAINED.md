# Keychain in ProofX — Judge Briefing

## 🔑 What Keychain Does (5 Bullet Explanation)

1. **Keychain is the signature layer** — Before any compliance proof can be submitted to the blockchain, the institution must sign it with their private key. This signature proves they authorized the submission.

2. **It prevents fake proofs** — Anyone can generate a proof hash, but only the institution holding the private key can create a valid signature. If someone tries to submit a proof pretending to be another institution, the signature won't match, and the contract rejects it.

3. **The blockchain verifies the signature** — When a proof is submitted, the smart contract mathematically recovers who signed it. The proof is then permanently recorded under that signer's address — not whoever sent the transaction.

4. **No passwords, no databases** — There's no central server storing credentials. Authorization is purely cryptographic. If you have the key, you can sign. If you don't, you can't fake it.

5. **What's real vs simulated** — The Keychain signing is 100% real (we use standard Ethereum signatures). The ZK proof generation is simulated for this hackathon — we generate a deterministic hash instead of running a real circuit.

---

## 🎤 20-Second Spoken Answer

> "Keychain handles authorization in ProofX. When an institution wants to prove compliance, they sign the proof with their private key. The smart contract then verifies that signature on-chain and records the proof under their identity. This means nobody can fake a proof for someone else — the math won't allow it. The signing is real Ethereum cryptography; only the ZK circuit is simulated for the hackathon."

---

## 📄 README Paragraph

### Keychain Integration

ProofX uses Keychain as its cryptographic authorization layer. Before a compliance proof can be recorded on Ethereum, the submitting institution must sign the proof commitment with their private key. The smart contract verifies this signature on-chain using ECDSA recovery, ensuring that proofs can only be submitted by their rightful owners. This creates a tamper-proof audit trail where each verification is permanently bound to the signer's blockchain identity — no central server, no stored passwords, just cryptographic truth.

---

## 🧠 Key Differentiator

| Without Keychain | With Keychain |
|------------------|---------------|
| Anyone could submit proofs claiming to be any institution | Only key holders can sign valid proofs |
| Trust relies on backend authentication | Trust relies on cryptographic math |
| Proofs bound to "whoever submitted" | Proofs bound to "whoever signed" |

---

*Prepared for ETHIndia 2026 judging*
