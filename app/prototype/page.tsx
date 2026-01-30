"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    CheckCircle,
    XCircle,
    Loader2,
    Building,
    FileText,
    Lock,
    RefreshCw,
    Wallet,
    ExternalLink
} from "lucide-react";
import { Section, FadeIn, Card, Button, Label, Container } from "@/components/ui";
import { useProofX, ProofStatus } from "@/lib";
import { DEFAULT_NETWORK } from "@/lib/config";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const mockInstitutions = [
    { id: "acme-bank", name: "ACME Bank", type: "Commercial Bank", value: 12, threshold: 8 },
    { id: "atlas-capital", name: "Atlas Capital", type: "Investment Fund", value: 15, threshold: 10 },
    { id: "horizon-exchange", name: "Horizon Exchange", type: "Crypto Exchange", value: 5, threshold: 8 }, // Will fail
];

const complianceChecks = [
    { label: "Capital Adequacy Ratio", value: "> 8%", passed: true },
    { label: "Liquidity Coverage", value: "128%", passed: true },
    { label: "KYC Verification Rate", value: "100%", passed: true },
    { label: "AML Screening Status", value: "Complete", passed: true },
];

const failedChecks = [
    { label: "Capital Adequacy Ratio", value: "6.2%", passed: false },
    { label: "Liquidity Coverage", value: "89%", passed: false },
    { label: "KYC Verification Rate", value: "100%", passed: true },
    { label: "AML Screening Status", value: "Pending", passed: false },
];

// Status message mapping
const statusMessages: Record<ProofStatus, string> = {
    idle: "",
    connecting: "Connecting wallet...",
    generating: "Generating ZK proof...",
    signing: "Please sign in MetaMask...",
    confirming: "Confirming on blockchain...",
    success: "",
    failure: ""
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function PrototypePage() {
    const [selectedInstitution, setSelectedInstitution] = useState(mockInstitutions[0]);

    const {
        status,
        result,
        error,
        generateAndSubmitProof,
        reset,
        isConnected,
        address,
        connect
    } = useProofX();

    const isLoading = ["connecting", "generating", "signing", "confirming"].includes(status);
    const isComplete = status === "success" || status === "failure";

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleGenerateProof = async () => {
        await generateAndSubmitProof({
            institutionId: selectedInstitution.id,
            metric: "capital_adequacy",
            value: selectedInstitution.value,
            threshold: selectedInstitution.threshold
        });
    };

    const handleReset = () => {
        reset();
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen pt-16">
            {/* Hero */}
            <Section className="!pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center"
                >
                    <Label className="mb-4 block">Interactive Demo</Label>
                    <h1 className="text-h1 text-[var(--text-primary)] mb-6">
                        Secure Verification Console
                    </h1>
                    <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Experience ProofX in action. Select an institution, connect your wallet,
                        and submit a cryptographic compliance proof to Ethereum.
                    </p>
                </motion.div>
            </Section>

            {/* Console */}
            <section className="pb-32">
                <Container>
                    <FadeIn>
                        <div className="max-w-4xl mx-auto">
                            <Card className="p-0 overflow-hidden" hover={false}>
                                {/* Console Header */}
                                <div className="flex items-center justify-between px-6 py-4 bg-[var(--surface-0)] border-b border-[var(--border-subtle)]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-[var(--error)]" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                            <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                                        </div>
                                        <span className="font-mono text-sm text-[var(--text-tertiary)]">
                                            proofx-console v2.0.0
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {isConnected && address && (
                                            <span className="font-mono text-xs text-[var(--text-tertiary)]">
                                                {address.slice(0, 6)}...{address.slice(-4)}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-[var(--success)]" />
                                            <span className="text-xs text-[var(--text-tertiary)]">
                                                {DEFAULT_NETWORK.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Console Body */}
                                <div className="p-8 space-y-8">
                                    {/* Institution Select */}
                                    <div>
                                        <label className="text-label block mb-3">Select Institution</label>
                                        <div className="grid sm:grid-cols-3 gap-3">
                                            {mockInstitutions.map((institution) => (
                                                <motion.button
                                                    key={institution.id}
                                                    onClick={() => {
                                                        setSelectedInstitution(institution);
                                                        if (isComplete) handleReset();
                                                    }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    disabled={isLoading}
                                                    className={`
                                                        p-4 rounded-lg border text-left transition-colors duration-200
                                                        ${selectedInstitution.id === institution.id
                                                            ? "bg-[var(--accent)]/10 border-[var(--accent)]/50"
                                                            : "bg-[var(--surface-0)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]"
                                                        }
                                                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Building className={`w-5 h-5 ${selectedInstitution.id === institution.id
                                                            ? "text-[var(--accent)]"
                                                            : "text-[var(--text-tertiary)]"
                                                            }`} />
                                                        <span className="font-medium text-[var(--text-primary)]">
                                                            {institution.name}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-tertiary)] ml-8">
                                                        {institution.type}
                                                    </p>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex flex-col items-center">
                                        <div className="flex justify-center w-full mb-3 gap-3">
                                            {!isConnected && (
                                                <Button onClick={connect} variant="secondary" className="min-w-[200px]">
                                                    <Wallet className="w-4 h-4" />
                                                    Connect Wallet
                                                </Button>
                                            )}

                                            {!isComplete && (
                                                <Button
                                                    onClick={handleGenerateProof}
                                                    disabled={isLoading}
                                                    className="min-w-[200px]"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            {statusMessages[status]}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="w-4 h-4" />
                                                            Generate & Submit Proof
                                                        </>
                                                    )}
                                                </Button>
                                            )}

                                            {isComplete && (
                                                <Button onClick={handleReset} variant="secondary" className="min-w-[200px]">
                                                    <RefreshCw className="w-4 h-4" />
                                                    New Verification
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-center text-[var(--text-tertiary)] opacity-70">
                                            Real blockchain transaction • {DEFAULT_NETWORK.name} testnet
                                        </p>
                                    </div>

                                    {/* Loading Animation */}
                                    <AnimatePresence mode="wait">
                                        {isLoading && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-6 bg-[var(--surface-0)] rounded-lg border border-[var(--border-subtle)]">
                                                    <div className="space-y-3">
                                                        {[
                                                            { step: "Connecting to prover node...", active: status === "connecting" || status === "generating" },
                                                            { step: "Executing compliance circuit...", active: status === "generating" },
                                                            { step: "Awaiting wallet signature...", active: status === "signing" },
                                                            { step: "Confirming on Ethereum...", active: status === "confirming" },
                                                        ].map((item, index) => (
                                                            <motion.div
                                                                key={item.step}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.3 }}
                                                                className="flex items-center gap-3 font-mono text-sm"
                                                            >
                                                                <motion.div
                                                                    animate={item.active ? {
                                                                        opacity: [0.3, 1, 0.3],
                                                                    } : { opacity: 0.3 }}
                                                                    transition={{
                                                                        duration: 1,
                                                                        repeat: Infinity,
                                                                    }}
                                                                    className={`w-2 h-2 rounded-full ${item.active ? "bg-[var(--accent)]" : "bg-[var(--text-tertiary)]"}`}
                                                                />
                                                                <span className={item.active ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}>
                                                                    {item.step}
                                                                </span>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Error Display */}
                                    <AnimatePresence>
                                        {error && status === "failure" && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="p-4 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg"
                                            >
                                                <p className="text-sm text-[var(--error)]">{error}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Results */}
                                    <AnimatePresence mode="wait">
                                        {isComplete && result && (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                            >
                                                {/* Status Banner */}
                                                <div
                                                    className={`
                                                        p-6 rounded-lg border mb-6
                                                        ${result.verified
                                                            ? "bg-[var(--success)]/10 border-[var(--success)]/30"
                                                            : "bg-[var(--error)]/10 border-[var(--error)]/30"
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {result.verified ? (
                                                            <CheckCircle className="w-12 h-12 text-[var(--success)]" />
                                                        ) : (
                                                            <XCircle className="w-12 h-12 text-[var(--error)]" />
                                                        )}
                                                        <div>
                                                            <h3 className={`text-h2 ${result.verified
                                                                ? "text-[var(--success)]"
                                                                : "text-[var(--error)]"
                                                                }`}>
                                                                Verification {result.verified ? "PASSED" : "FAILED"}
                                                            </h3>
                                                            <p className="text-sm text-[var(--text-secondary)]">
                                                                {selectedInstitution.name} • Block #{result.blockNumber}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Proof Details */}
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {/* Transaction Hash */}
                                                    <div className="p-4 bg-[var(--surface-0)] rounded-lg border border-[var(--border-subtle)]">
                                                        <p className="text-label mb-2">Transaction Hash</p>
                                                        <a
                                                            href={`${DEFAULT_NETWORK.blockExplorer}/tx/${result.transactionHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-mono text-sm text-[var(--accent)] hover:underline flex items-center gap-2"
                                                        >
                                                            {result.transactionHash.slice(0, 10)}...{result.transactionHash.slice(-8)}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>

                                                    {/* Commitment */}
                                                    <div className="p-4 bg-[var(--surface-0)] rounded-lg border border-[var(--border-subtle)]">
                                                        <p className="text-label mb-2">Proof Commitment</p>
                                                        <p className="font-mono text-sm text-[var(--text-primary)] break-all">
                                                            {result.commitment.slice(0, 10)}...{result.commitment.slice(-8)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Check Details */}
                                                <div className="mt-6 p-4 bg-[var(--surface-0)] rounded-lg border border-[var(--border-subtle)]">
                                                    <p className="text-label mb-4">Compliance Checks</p>
                                                    <div className="space-y-3">
                                                        {(result.verified ? complianceChecks : failedChecks).map((check, index) => (
                                                            <motion.div
                                                                key={check.label}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {check.passed ? (
                                                                        <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                                                                    ) : (
                                                                        <XCircle className="w-4 h-4 text-[var(--error)]" />
                                                                    )}
                                                                    <span className="text-[var(--text-primary)]">{check.label}</span>
                                                                </div>
                                                                <span className={`font-mono text-sm ${check.passed ? "text-[var(--text-secondary)]" : "text-[var(--error)]"
                                                                    }`}>
                                                                    {check.value}
                                                                </span>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Card>

                            {/* Info */}
                            <div className="mt-8 text-center">
                                <p className="text-sm text-[var(--text-tertiary)]">
                                    This demo submits real transactions to {DEFAULT_NETWORK.name}.
                                    Ensure you have testnet ETH.
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </Container>
            </section>

            {/* How It Works Quick */}
            <section className="py-24 bg-[var(--surface-1)] border-t border-[var(--border-subtle)]">
                <Container>
                    <FadeIn>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            {[
                                { icon: FileText, title: "1. Data Stays Local", desc: "Your sensitive data never leaves your infrastructure" },
                                { icon: Shield, title: "2. Proof Generated", desc: "Zero-knowledge proof created from compliance data" },
                                { icon: CheckCircle, title: "3. Verified On-chain", desc: "Proof submitted to Ethereum for permanent verification" },
                            ].map((step, index) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                >
                                    <step.icon className="w-10 h-10 text-[var(--accent)] mx-auto mb-4" />
                                    <h3 className="text-h3 text-[var(--text-primary)] mb-2">{step.title}</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </FadeIn>
                </Container>
            </section>
        </div>
    );
}
