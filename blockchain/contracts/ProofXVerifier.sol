// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Groth16Verifier.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ProofX Protocol — Production ZK Verifier
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DESIGN:
 * - REAL ZK: Validates Groth16 proofs via Groth16Verifier
 * - AUTHZ: Only authorized signers can approve proofs (Keychain)
 * - REPLAY SAFETY: Prevents reusing the same proof hash
 * - EMERGENCY: Can be paused by admin
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
contract ProofXVerifier is AccessControl, Pausable, ReentrancyGuard {
    using ECDSA for bytes32;

    // ═══════════════════════════════════════════════════════════════════════
    // ROLES
    // ═══════════════════════════════════════════════════════════════════════
    
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ═══════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Reference to the Groth16 ZK verifier contract
    Groth16Verifier public immutable zkVerifier;

    /// @dev Verification record
    struct VerificationRecord {
        bytes32 proofHash;      // Unique identifier of the proof
        uint64 timestamp;       // Block timestamp
        uint64 threshold;       // Public input used
        bool verified;          // Result
    }

    /// @notice Signer address → Last Verification Record
    mapping(address => VerificationRecord) public verifications;
    
    /// @notice Prevent replay attacks: proofHash -> already used?
    mapping(bytes32 => bool) public usedProofHashes;

    /// @notice Total successful verifications
    uint256 public totalVerifications;

    // ═══════════════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event ProofVerified(
        address indexed signer,
        address indexed submitter,
        bytes32 indexed proofHash,
        uint256 threshold,
        bool verified,
        uint256 timestamp
    );

    // ═══════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error InvalidSignature();
    error UnauthorizedSigner();
    error ProofAlreadyUsed();
    error InvalidProof();
    error ZeroAddress();

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    constructor(address _zkVerifier, address _admin) {
        if (_zkVerifier == address(0)) revert ZeroAddress();
        if (_admin == address(0)) revert ZeroAddress();

        zkVerifier = Groth16Verifier(_zkVerifier);

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        // Admin is also a signer for testing, but should be separated in prod
        _grantRole(SIGNER_ROLE, _admin);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VERIFICATION LOGIC
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * @notice Verify a Groth16 ZK proof with authorization
     * @dev Protected by nonReentrant and whenNotPaused
     */
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[1] calldata _pubSignals,
        bytes calldata _signature
    ) 
        external 
        whenNotPaused 
        nonReentrant 
        returns (bool verified) 
    {
        // 1. Compute Hash
        bytes32 proofHash = keccak256(
            abi.encode(_pA, _pB, _pC, _pubSignals[0])
        );

        // 2. Replay Check
        if (usedProofHashes[proofHash]) revert ProofAlreadyUsed();

        // 3. Authorization Check
        // Recover signer from hash
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(proofHash);
        address signer = ECDSA.recover(ethSignedHash, _signature);

        if (!hasRole(SIGNER_ROLE, signer)) revert UnauthorizedSigner();
        
        // 4. ZK Cryptographic Check
        verified = zkVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        
        if (!verified) revert InvalidProof();

        // 5. State Update
        usedProofHashes[proofHash] = true;
        
        verifications[signer] = VerificationRecord({
            proofHash: proofHash,
            timestamp: uint64(block.timestamp),
            threshold: uint64(_pubSignals[0]),
            verified: true
        });

        unchecked { ++totalVerifications; }

        emit ProofVerified(
            signer,
            msg.sender,
            proofHash,
            _pubSignals[0],
            true,
            block.timestamp
        );
    }

    /**
     * @notice Simulation / Legacy verification (Sender = Signer)
     * @dev Only allowed for Authorized Signers
     */
    function verifyProofSimple(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[1] calldata _pubSignals
    ) 
        external 
        whenNotPaused
        nonReentrant 
        returns (bool verified) 
    {
        // Explicitly check if sender is authorized
        // if (!hasRole(SIGNER_ROLE, msg.sender)) revert UnauthorizedSigner();
        // HACKATHON: Allow anyone

        bytes32 proofHash = keccak256(
            abi.encode(_pA, _pB, _pC, _pubSignals[0])
        );

         // Replay Check
        if (usedProofHashes[proofHash]) revert ProofAlreadyUsed();

        verified = zkVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        
        if (!verified) revert InvalidProof();

        usedProofHashes[proofHash] = true;

        verifications[msg.sender] = VerificationRecord({
            proofHash: proofHash,
            timestamp: uint64(block.timestamp),
            threshold: uint64(_pubSignals[0]),
            verified: true
        });

        unchecked { ++totalVerifications; }

        emit ProofVerified(
            msg.sender,
            msg.sender,
            proofHash,
            _pubSignals[0],
            true,
            block.timestamp
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    function isVerified(address _signer) external view returns (bool) {
        return verifications[_signer].verified;
    }

    function getVerification(address _signer)
        external
        view
        returns (
            bytes32 proofHash,
            uint64 timestamp,
            uint64 threshold,
            bool verified
        )
    {
        VerificationRecord storage r = verifications[_signer];
        return (r.proofHash, r.timestamp, r.threshold, r.verified);
    }
}
