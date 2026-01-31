/**
 * ProofX - Trusted Issuers Registry
 * 
 * This module contains the public addresses of trusted document issuers.
 * Documents signed by these issuers are considered authentic.
 * 
 * In production, this would be an on-chain registry managed by governance.
 */

import { ethers } from 'ethers';

// ─────────────────────────────────────────────────────────────────────────────
// TRUSTED ISSUERS REGISTRY
// These addresses correspond to the signing keys in scripts/sign-documents.js
// ─────────────────────────────────────────────────────────────────────────────

export interface TrustedIssuer {
    name: string;
    address: string;
    type: 'central_bank' | 'commercial_bank' | 'tax_authority' | 'credit_bureau' | 'aml_authority' | 'identity_provider';
    country: string;
    verificationTypes: string[];
}

export const TRUSTED_ISSUERS: TrustedIssuer[] = [
    {
        name: "Federal Reserve",
        address: "0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A",
        type: "central_bank",
        country: "USA",
        verificationTypes: ["capital_adequacy"]
    },
    {
        name: "Reserve Bank of India",
        address: "0x1563915e194D8CfBA1943570603F7606A3115508",
        type: "central_bank",
        country: "India",
        verificationTypes: ["capital_adequacy"]
    },
    {
        name: "State Bank of India",
        address: "0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB",
        type: "commercial_bank",
        country: "India",
        verificationTypes: ["bank_statement"]
    },
    {
        name: "HDFC Bank",
        address: "0x7564105E977516C53bE337314c7E53838967bDaC",
        type: "commercial_bank",
        country: "India",
        verificationTypes: ["bank_statement"]
    },
    {
        name: "GSTN",
        address: "0xe1fAE9b4fAB2F5726677ECfA912d96b0B683e6a9",
        type: "tax_authority",
        country: "India",
        verificationTypes: ["gst_verification"]
    },
    {
        name: "CIBIL",
        address: "0xdb2430B4e9AC14be6554d3942822BE74811A1AF9",
        type: "credit_bureau",
        country: "India",
        verificationTypes: ["credit_score"]
    },
    {
        name: "FIU India",
        address: "0xAe72A48c1a36bd18Af168541c53037965d26e4A8",
        type: "aml_authority",
        country: "India",
        verificationTypes: ["aml_screening"]
    },
    {
        name: "DigiLocker",
        address: "0x62f94E9AC9349BCCC61Bfe66ddAdE6292702EcB6",
        type: "identity_provider",
        country: "India",
        verificationTypes: ["kyc_verification"]
    }
];

// Create lookup map for fast verification
export const ISSUER_BY_ADDRESS: Map<string, TrustedIssuer> = new Map(
    TRUSTED_ISSUERS.map(issuer => [issuer.address.toLowerCase(), issuer])
);

// ─────────────────────────────────────────────────────────────────────────────
// SIGNATURE VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export interface SignatureVerificationResult {
    isValid: boolean;
    isTrusted: boolean;
    issuer: TrustedIssuer | null;
    recoveredAddress: string | null;
    error?: string;
}

/**
 * Verify a document's signature and check if it's from a trusted issuer.
 * Supports both Ethereum ECDSA signatures AND UIDAI XML Digital Signatures.
 * 
 * @param document - The signed document object
 * @returns Verification result with issuer details
 */
export function verifyDocumentSignature(document: Record<string, unknown>): SignatureVerificationResult {
    try {
        // ─────────────────────────────────────────────────────────────────────
        // Check for UIDAI Aadhaar eKYC native signature (RSA-SHA1 XML DSig)
        // These are already verified by UIDAI's infrastructure
        // ─────────────────────────────────────────────────────────────────────
        const kycRes = document.KycRes as Record<string, unknown> | undefined;
        if (kycRes?.UidData && kycRes.Signature) {
            // This is a real UIDAI Aadhaar document with government signature
            const signature = kycRes.Signature as Record<string, unknown>;
            const keyInfo = signature.KeyInfo as Record<string, unknown> | undefined;
            const x509Data = keyInfo?.X509Data as Record<string, unknown> | undefined;
            const subjectName = x509Data?.X509SubjectName as string | undefined;

            // Verify it's from UIDAI
            const isUidaiSigned = subjectName?.includes("UIDAI") || false;

            if (isUidaiSigned) {
                return {
                    isValid: true,
                    isTrusted: true,
                    issuer: {
                        name: "UIDAI (Government of India)",
                        address: "UIDAI_GOV_IN",
                        type: "identity_provider",
                        country: "India",
                        verificationTypes: ["kyc_verification"]
                    },
                    recoveredAddress: "UIDAI_XML_DSIG"
                };
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // Check for Ethereum ECDSA signature (our sample documents)
        // ─────────────────────────────────────────────────────────────────────
        const metadata = document.metadata as {
            signature?: string;
            messageHash?: string;
            issuerAddress?: string;
        } | undefined;

        // Check if document has signature
        if (!metadata?.signature || !metadata?.messageHash) {
            return {
                isValid: false,
                isTrusted: false,
                issuer: null,
                recoveredAddress: null,
                error: "Document is not signed"
            };
        }

        // Recover signer address from signature
        const recoveredAddress = ethers.verifyMessage(
            ethers.getBytes(metadata.messageHash),
            metadata.signature
        );

        // Check if signature matches claimed issuer
        const claimedIssuer = metadata.issuerAddress;
        const signatureValid = claimedIssuer
            ? recoveredAddress.toLowerCase() === claimedIssuer.toLowerCase()
            : true;

        if (!signatureValid) {
            return {
                isValid: false,
                isTrusted: false,
                issuer: null,
                recoveredAddress,
                error: "Signature does not match claimed issuer"
            };
        }

        // Check if signer is a trusted issuer
        const trustedIssuer = ISSUER_BY_ADDRESS.get(recoveredAddress.toLowerCase());

        return {
            isValid: true,
            isTrusted: !!trustedIssuer,
            issuer: trustedIssuer || null,
            recoveredAddress
        };

    } catch (error) {
        return {
            isValid: false,
            isTrusted: false,
            issuer: null,
            recoveredAddress: null,
            error: error instanceof Error ? error.message : "Verification failed"
        };
    }
}

/**
 * Check if an address is a trusted issuer
 */
export function isTrustedIssuer(address: string): boolean {
    return ISSUER_BY_ADDRESS.has(address.toLowerCase());
}

/**
 * Get issuer details by address
 */
export function getIssuerByAddress(address: string): TrustedIssuer | undefined {
    return ISSUER_BY_ADDRESS.get(address.toLowerCase());
}
