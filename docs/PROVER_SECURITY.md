# Prover Security Architecture & Hardening Guide

> **Component**: ProofX Prover Service
> **Status**: Production Deployment Guide
> **Date**: 2026-01-30

---

## 1. Security Architecture

The Prover Service is a **high-value target** because it processes private financial data (`assets`, `liabilities`) and holds the cryptographic material to generate proofs.

### 🛡️ Core Principles

1.  **Ephemeral Processing**: Private inputs must reside in memory ONLY during proof generation and be overwritten immediately after.
2.  **Input Sanitation**: Strict schema validation before any ZK computation.
3.  **Isolation**: The proving process should run in an isolated worker/container, not the main web server thread.
4.  **DoS Protection**: Computationally expensive operations (ZK proving) must be strictly rate-limited.

### 🏗️ proposed Infrastructure

```mermaid
graph TD
    User[User Client] -->|HTTPS POST /prove| LB[Load Balancer / WAF]
    LB -->|Rate Limited| API[API Server (Express)]
    API -->|Job Queue| Worker[Isolated Prover Worker]
    Worker -->|Read-Only| ZKey[Circuit Artifacts]
    Worker -->|Return Proof| API
    
    auth[Auth Service] -.->|Verify Sig| API
```

---

## 2. Operational Safeguards

### A. Rate Limiting & DoS Protection
*   **Risk**: ZK proof generation takes ~500ms-2s of CPU. A flood of requests can stall the CPU.
*   **Mitigation**:
    *   Implement **IP-based Rate Limiting** (e.g., 10 req/min).
    *   Require **Proof-of-Work** or **API Key** for `/prove` endpoint.
    *   Set strict **timeouts** (e.g., 10s) on proof generation.

### B. Input Validation
*   **Risk**: Malformed inputs crashing the WASM runtime or causing undefined behavior.
*   **Mitigation**:
    *   **Strict Type Checking**: Ensure `assets` and `liabilities` are numeric strings (BigInt safe).
    *   **Range Checks**: Enforce `0 <= value < 2^64` at the API level (redundant to circuit, but cheaper).
    *   **Input Size Limit**: Max payload size 1KB.

### C. Key Isolation
*   **Risk**: If server is compromised, `circuit_final.zkey` allows false proof generation (if setup heavily trusted).
*   **Mitigation**:
    *   The `.zkey` file should be **Read-Only** for the worker process.
    *   In extreme high-security, run proving inside an **SGX Enclave** (future work).

### D. No Persistence
*   **Risk**: Database breach leaking historical asset data.
*   **Mitigation**:
    *   **NO DATABASE** connected to the Prover.
    *   Disable Request Logging for the `/prove` body parameters.
    *   Only log metadata: `timestamp`, `institutionId` (hash), `success/fail`.

---

## 3. Hardening Implementation Checklist

### 🐳 Containerization (Docker)

Create a `Dockerfile` to isolate the environment:

```dockerfile
FROM node:18-bullseye-slim
WORKDIR /app
# Install dependencies
COPY prover/package*.json ./
RUN npm ci --only=production
# Copy code & artifacts
COPY prover/ ./
COPY circuits/build/ ./circuits/build/
# Run as non-root user
USER node
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

### 🔒 Application Hardening (Code Changes)

1.  **Add `helmet`** for HTTP headers security.
2.  **Add `express-rate-limit`**.
3.  **Sanitize logs**: Ensure `req.body.assets` is never printed.

### 📝 Production Deployment Checklist

- [ ] **HTTPS Only**: Terminate TLS at Load Balancer.
- [ ] **WAF Config**: Block non-JSON bodies and large payloads (>10KB).
- [ ] **Resource Limits**: Set Docker memory limit (e.g., `--memory="4g"`).
- [ ] **Health Check**: Monitor `/` endpoint; auto-restart if unresponsive.
- [ ] **Artifact Integrity**: Verify `sha256sum` of `.zkey` on startup.

---

## 4. Disaster Recovery

If the Prover Service is compromised:
1.  **Revoke Access**: Block traffic at WAF.
2.  **Rotate Keys**: Since `.zkey` is public (verification key) but integral to proving, "rotation" implies running a **new Trusted Setup** if the toxic waste was suspected to be leaked during the *original* ceremony (not relevant to just server hack, but good to know).
3.  **Redeploy**: Deploy fresh containers from trusted CI/CD pipeline.
