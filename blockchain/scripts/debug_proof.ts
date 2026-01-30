
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x661672E8c5FEefCDb81cFEc65DEe95D40E56f1a5"; // Fallback to provided address

    console.log("Debugging Proof Hash Mismatch");
    console.log("-----------------------------");
    console.log("Deployer/Signer:", deployer.address);
    console.log("Contract:", contractAddress);

    // 1. Mock Proof Data (Real structure)
    const proof = {
        a: ["1", "2"],
        b: [["3", "4"], ["5", "6"]],
        c: ["7", "8"]
    };
    const publicSignals = ["1000"];

    // 2. Compute Hash (JS Side - matching server.js)
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const encoded = abiCoder.encode(
        ['uint256[2]', 'uint256[2][2]', 'uint256[2]', 'uint256'],
        [proof.a, proof.b, proof.c, publicSignals[0]]
    );
    const proofHash = ethers.keccak256(encoded);

    console.log("\nComputed Hash (JS):", proofHash);

    // 3. Sign Hash
    const signature = await deployer.signMessage(ethers.getBytes(proofHash));
    console.log("Signature:", signature);

    // 4. Call Contract
    const ProofXVerifier = await ethers.getContractFactory("ProofXVerifier");
    const verifier = ProofXVerifier.attach(contractAddress);

    console.log("\nAttempting verifyProof (Expect 'InvalidProof' but NOT 'UnauthorizedSigner')...");

    try {
        // Convert to BigInts for Ethers contract call
        const pA = [BigInt(proof.a[0]), BigInt(proof.a[1])];
        const pB = [[BigInt(proof.b[0][0]), BigInt(proof.b[0][1])], [BigInt(proof.b[1][0]), BigInt(proof.b[1][1])]];
        const pC = [BigInt(proof.c[0]), BigInt(proof.c[1])];
        const pub = [BigInt(publicSignals[0])];

        // Using callStatic to see revert reason without spending gas
        // Note: verifyProof writes to storage (usedProofHashes), so callStatic simulates it.
        await verifier.verifyProof.staticCall(pA, pB, pC, pub, signature);

        console.log("✅ callStatic success (returned true/false)");
    } catch (e: any) {
        console.log("❌ REVERTED:");
        if (e.data) {
            // Decode error
            const decoded = verifier.interface.parseError(e.data);
            console.log("  Reason:", decoded ? decoded.name : e.data);
        } else {
            console.log("  Message:", e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
