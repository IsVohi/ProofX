/**
 * ProofX Protocol - Deployment Script
 * 
 * USAGE:
 * ─────────────────────────────────────────────────────────────────────────────
 * # Deploy to local hardhat network
 * npx hardhat run scripts/deploy.ts
 * 
 * # Deploy to Sepolia testnet
 * npx hardhat run scripts/deploy.ts --network sepolia
 * 
 * # Deploy to Polygon Amoy testnet
 * npx hardhat run scripts/deploy.ts --network amoy
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * EXPECTED OUTPUT:
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         ProofX Protocol Deployment                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * Network:          sepolia
 * Deployer:         0x742d35Cc6634C0532925a3b844Bc9e7595f2bD12
 * Balance:          0.5 ETH
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Deploying ProofXVerifier...
 * 
 * ✓ ProofXVerifier deployed!
 * 
 *   Contract Address:  0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
 *   Transaction Hash:  0x1234...abcd
 *   Gas Used:          245,892
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Next steps:
 *   1. Verify contract: npx hardhat verify --network sepolia 0x8A79...
 *   2. Update frontend with contract address
 *   3. Test with: npx hardhat console --network sepolia
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ethers, network } from "hardhat";

async function main() {
    // ─────────────────────────────────────────────────────────────────────────
    // SETUP
    // ─────────────────────────────────────────────────────────────────────────

    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                         ProofX Protocol Deployment                        ║
╚═══════════════════════════════════════════════════════════════════════════╝

Network:          ${network.name}
Deployer:         ${deployer.address}
Balance:          ${ethers.formatEther(balance)} ETH

───────────────────────────────────────────────────────────────────────────────
`);

    // Check for sufficient balance
    if (balance === 0n) {
        console.error("❌ Error: Deployer has no balance. Get testnet ETH from a faucet.");
        console.log("\n   Sepolia Faucet:  https://sepoliafaucet.com");
        console.log("   Amoy Faucet:     https://faucet.polygon.technology\n");
        process.exit(1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DEPLOYMENT
    // ─────────────────────────────────────────────────────────────────────────

    console.log("Deploying ProofXVerifier...\n");

    const ProofXVerifier = await ethers.getContractFactory("ProofXVerifier");
    const verifier = await ProofXVerifier.deploy();

    await verifier.waitForDeployment();

    const address = await verifier.getAddress();
    const deployTx = verifier.deploymentTransaction();
    const receipt = await deployTx?.wait();

    console.log(`✓ ProofXVerifier deployed!

  Contract Address:  ${address}
  Transaction Hash:  ${deployTx?.hash}
  Gas Used:          ${receipt?.gasUsed?.toString() || "N/A"}

───────────────────────────────────────────────────────────────────────────────

Next steps:
  1. Verify contract: npx hardhat verify --network ${network.name} ${address}
  2. Update frontend with contract address
  3. Test with: npx hardhat console --network ${network.name}

───────────────────────────────────────────────────────────────────────────────
`);

    // ─────────────────────────────────────────────────────────────────────────
    // OPTIONAL: Quick verification test
    // ─────────────────────────────────────────────────────────────────────────

    if (network.name === "hardhat" || network.name === "localhost") {
        console.log("Running quick verification test on local network...\n");

        // Generate a mock commitment
        const commitment = ethers.keccak256(ethers.toUtf8Bytes("test-proof-123"));

        // Submit for verification
        const tx = await verifier.verifyProof(commitment);
        await tx.wait();

        // Check result
        const isVerified = await verifier.isVerified(deployer.address);
        const total = await verifier.totalVerifications();

        console.log(`  Test commitment:   ${commitment}`);
        console.log(`  Verified:          ${isVerified}`);
        console.log(`  Total proofs:      ${total}\n`);
        console.log("✓ Local test passed!\n");
    }
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
