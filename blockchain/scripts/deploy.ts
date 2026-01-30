/**
 * ProofX Protocol - Deployment Script
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

    if (balance === 0n) {
        console.error("❌ Error: Deployer has no balance.");
        process.exit(1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. DEPLOY GROTH16 VERIFIER
    // ─────────────────────────────────────────────────────────────────────────

    console.log("1. Deploying Groth16Verifier...");
    const Groth16Verifier = await ethers.getContractFactory("Groth16Verifier");
    const zkVerifier = await Groth16Verifier.deploy();
    await zkVerifier.waitForDeployment();

    const zkAddress = await zkVerifier.getAddress();
    console.log(`   ✓ Groth16Verifier deployed at: ${zkAddress}\n`);

    // ─────────────────────────────────────────────────────────────────────────
    // 2. DEPLOY PROOFX VERIFIER
    // ─────────────────────────────────────────────────────────────────────────

    console.log("2. Deploying ProofXVerifier...");
    console.log(`   - ZK Verifier: ${zkAddress}`);
    console.log(`   - Admin:       ${deployer.address}`);

    const ProofXVerifier = await ethers.getContractFactory("ProofXVerifier");
    // Constructor: (address _zkVerifier, address _admin)
    const proofXVerifier = await ProofXVerifier.deploy(zkAddress, deployer.address);
    await proofXVerifier.waitForDeployment();

    const proofXAddress = await proofXVerifier.getAddress();
    const deployTx = proofXVerifier.deploymentTransaction();
    const receipt = await deployTx?.wait();

    console.log(`
✓ ProofXVerifier deployed!

  Contract Address:  ${proofXAddress}
  Transaction Hash:  ${deployTx?.hash}
  Gas Used:          ${receipt?.gasUsed?.toString() || "N/A"}

───────────────────────────────────────────────────────────────────────────────

Next steps:
  1. Verify Groth16Verifier:
     npx hardhat verify --network ${network.name} ${zkAddress}
     
  2. Verify ProofXVerifier:
     npx hardhat verify --network ${network.name} ${proofXAddress} ${zkAddress} ${deployer.address}

  3. Update frontend config
───────────────────────────────────────────────────────────────────────────────
`);

    // ─────────────────────────────────────────────────────────────────────────
    // OPTIONAL: Quick verification test
    // ─────────────────────────────────────────────────────────────────────────

    if (network.name === "hardhat" || network.name === "localhost") {
        console.log("Running quick verification test on local network...\n");

        // Dummy Proof Data (will fail crypto check but pass structure check)
        const pA: [bigint, bigint] = [0n, 0n];
        const pB: [[bigint, bigint], [bigint, bigint]] = [[0n, 0n], [0n, 0n]];
        const pC: [bigint, bigint] = [0n, 0n];
        const pubSignals: [bigint] = [1000n]; // Threshold

        try {
            // Note: This IS expected to fail crypto check with "InvalidProof"
            // or revert if inputs are invalid points.
            // We just want to see if we can CALL it.
            console.log("   - Attempting verifyProofSimple (expect revert on dummy data)...");
            await proofXVerifier.verifyProofSimple(pA, pB, pC, pubSignals);
        } catch (e: any) {
            console.log(`   - Transaction reverted as expected (Dummy proof): ${e.message ? "Reverted" : "Failed"}`);
        }

        console.log("\n✓ Local sanity check complete.\n");
    }
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
