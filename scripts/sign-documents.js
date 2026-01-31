/**
 * ProofX Document Signing Utility
 * 
 * This script signs financial documents with trusted issuer keys.
 * In production, each bank/regulator would have their own signing key.
 * 
 * Usage: node scripts/sign-documents.js
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// TRUSTED ISSUERS (Demo Keys - DO NOT USE IN PRODUCTION)
// In production, these would be HSM-protected keys held by each institution
// ─────────────────────────────────────────────────────────────────────────────

const TRUSTED_ISSUERS = {
    // Federal Reserve (Demo)
    "Federal Reserve": {
        privateKey: "0x1111111111111111111111111111111111111111111111111111111111111111",
        address: null // Will be computed
    },
    // Reserve Bank of India (Demo)
    "Reserve Bank of India": {
        privateKey: "0x2222222222222222222222222222222222222222222222222222222222222222",
        address: null
    },
    // State Bank of India (Demo)
    "State Bank of India": {
        privateKey: "0x3333333333333333333333333333333333333333333333333333333333333333",
        address: null
    },
    // HDFC Bank (Demo)
    "HDFC Bank": {
        privateKey: "0x4444444444444444444444444444444444444444444444444444444444444444",
        address: null
    },
    // GST Network (Demo)
    "GSTN": {
        privateKey: "0x5555555555555555555555555555555555555555555555555555555555555555",
        address: null
    },
    // CIBIL (Demo)
    "CIBIL": {
        privateKey: "0x6666666666666666666666666666666666666666666666666666666666666666",
        address: null
    },
    // FIU India (Demo)
    "FIU India": {
        privateKey: "0x7777777777777777777777777777777777777777777777777777777777777777",
        address: null
    },
    // DigiLocker (Demo)
    "DigiLocker": {
        privateKey: "0x8888888888888888888888888888888888888888888888888888888888888888",
        address: null
    }
};

// Compute addresses from private keys
for (const [name, issuer] of Object.entries(TRUSTED_ISSUERS)) {
    const wallet = new ethers.Wallet(issuer.privateKey);
    issuer.address = wallet.address;
    console.log(`📜 ${name}: ${issuer.address}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGNING FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

async function signDocument(documentPath, issuerName) {
    // Read document
    const docContent = fs.readFileSync(documentPath, 'utf8');
    const doc = JSON.parse(docContent);

    // Get issuer
    const issuer = TRUSTED_ISSUERS[issuerName];
    if (!issuer) {
        throw new Error(`Unknown issuer: ${issuerName}`);
    }

    // Remove existing signature fields for clean signing
    delete doc.metadata?.signature;
    delete doc.metadata?.issuerAddress;
    delete doc.metadata?.issuerName;
    delete doc.metadata?.signedAt;

    // Create message to sign (hash of document data without signature)
    const dataToSign = JSON.stringify({
        documentType: doc.documentType,
        version: doc.version,
        institution: doc.institution,
        business: doc.business,
        account: doc.account,
        identity: doc.identity,
        borrower: doc.borrower,
        entity: doc.entity,
        financialData: doc.financialData,
        returns: doc.returns,
        summary: doc.summary,
        documents: doc.documents,
        creditProfile: doc.creditProfile,
        loanHistory: doc.loanHistory,
        repaymentHistory: doc.repaymentHistory,
        screening: doc.screening,
        transactionAnalysis: doc.transactionAnalysis,
        riskAssessment: doc.riskAssessment,
        verification: doc.verification,
        compliance: doc.compliance
    });

    // Create hash
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(dataToSign));

    // Sign with issuer's private key
    const wallet = new ethers.Wallet(issuer.privateKey);
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    // Add signature to metadata
    doc.metadata = {
        ...doc.metadata,
        signature: signature,
        issuerAddress: issuer.address,
        issuerName: issuerName,
        signedAt: new Date().toISOString(),
        messageHash: messageHash
    };

    // Write back
    fs.writeFileSync(documentPath, JSON.stringify(doc, null, 2));
    console.log(`✅ Signed: ${path.basename(documentPath)} by ${issuerName}`);

    return { signature, issuerAddress: issuer.address };
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN ALL SAMPLE DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────

async function signAllDocuments() {
    const samplesDir = path.resolve(__dirname, '../public/samples');

    // Map documents to their issuers
    const documentIssuers = {
        // Capital Adequacy - signed by central banks
        'highth.json': 'Federal Reserve',
        'lowth.json': 'Federal Reserve',
        'acme_bank_statement.json': 'Reserve Bank of India',
        'atlas_capital_statement.json': 'Reserve Bank of India',
        'horizon_exchange_statement.json': 'Reserve Bank of India',

        // GST - signed by GSTN
        'gst_compliant.json': 'GSTN',
        'gst_defaulter.json': 'GSTN',

        // Bank Statements - signed by respective banks
        'bank_healthy.json': 'State Bank of India',
        'bank_low_balance.json': 'HDFC Bank',

        // KYC - signed by DigiLocker
        'kyc_verified.json': 'DigiLocker',
        'kyc_incomplete.json': 'DigiLocker',

        // Credit Score - signed by CIBIL
        'credit_excellent.json': 'CIBIL',
        'credit_poor.json': 'CIBIL',

        // AML - signed by FIU India
        'aml_clean.json': 'FIU India',
        'aml_flagged.json': 'FIU India'
    };

    console.log('\n🔐 Signing documents with trusted issuer keys...\n');

    for (const [filename, issuerName] of Object.entries(documentIssuers)) {
        const filepath = path.join(samplesDir, filename);
        if (fs.existsSync(filepath)) {
            try {
                await signDocument(filepath, issuerName);
            } catch (err) {
                console.error(`❌ Failed to sign ${filename}: ${err.message}`);
            }
        } else {
            console.log(`⚠️  Not found: ${filename}`);
        }
    }

    console.log('\n✨ Done! All documents signed.\n');
}

// Export for use as module
module.exports = { TRUSTED_ISSUERS, signDocument };

// Run if called directly
if (require.main === module) {
    signAllDocuments().catch(console.error);
}
