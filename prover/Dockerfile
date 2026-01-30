# Production Dockerfile for ProofX Prover
# Security-Hardened: Non-root user, minimal image, explicit dependencies

# 1. Base Image
FROM node:18-bullseye-slim

# 2. Environment Variables
ENV NODE_ENV=production
ENV PORT=3001

# 3. Create App Directory
WORKDIR /app

# 4. Install Dependencies (Cached Layer)
COPY package*.json ./
RUN npm ci --only=production

# 5. Copy Source Code
COPY server.js ./

# 6. Copy Circuit Artifacts (Required for Proving)
# Assumes circuits are already compiled in ../circuits/build
COPY ../circuits/build/ ./circuits/build/
# Note: In a real monorepo build, you might mount this volume or copy from a build stage

# 7. Security: Run as non-root user
USER node

# 8. Expose Port
EXPOSE 3001

# 9. Start Service
CMD ["node", "server.js"]
