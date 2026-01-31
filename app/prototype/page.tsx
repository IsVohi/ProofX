"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    CheckCircle,
    XCircle,
    Loader2,
    FileText,
    Lock,
    RefreshCw,
    Wallet,
    ExternalLink,
    Upload,
    AlertCircle,
    Building2,
    Receipt,
    CreditCard,
    UserCheck,
    TrendingUp,
    ShieldAlert,
    Activity,
    Clock,
    Zap,
    Globe,
    Check,
    ChevronDown,
    Eye,
    EyeOff,
    Copy,
    Sparkles,
    BarChart3,
    FileCheck,
    Network,
    Download
} from "lucide-react";
import { Button } from "@/components/ui";
import { useProofX, ProofStatus } from "@/lib";
import { DEFAULT_NETWORK } from "@/lib/config";
import { verifyDocumentSignature, SignatureVerificationResult } from "@/lib/trustedIssuers";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface VerificationType {
    id: string;
    name: string;
    shortName: string;
    icon: React.ElementType;
    description: string;
    color: string;
    gradient: string;
    samples: { name: string; file: string; compliant: boolean }[];
    extractData: (doc: Record<string, unknown>) => VerificationData | null;
}

interface VerificationData {
    entityName: string;
    entityId: string;
    primaryValue: number;
    threshold: number;
    isCompliant: boolean;
    details: { label: string; value: string; passed?: boolean }[];
}

interface VerificationHistoryItem {
    id: string;
    type: string;
    entity: string;
    result: boolean;
    timestamp: Date;
    txHash?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION TYPES CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const VERIFICATION_TYPES: VerificationType[] = [
    {
        id: "capital_adequacy",
        name: "Capital Adequacy",
        shortName: "Capital",
        icon: Building2,
        description: "Basel III bank capital compliance",
        color: "#6366F1",
        gradient: "from-indigo-500 to-purple-600",
        samples: [
            { name: "HighCap Bank", file: "/samples/highth.json", compliant: true },
            { name: "LowCap Bank", file: "/samples/lowth.json", compliant: false }
        ],
        extractData: (doc) => {
            const d = doc as { institution?: { name?: string; id?: string }; financialData?: { assets?: { total?: number }; liabilities?: { total?: number }; capital?: number } };
            if (!d.financialData?.capital) return null;
            const capital = d.financialData.capital;
            const threshold = 500000;
            return {
                entityName: d.institution?.name || "Unknown",
                entityId: d.institution?.id || "N/A",
                primaryValue: capital,
                threshold,
                isCompliant: capital >= threshold,
                details: [
                    { label: "Total Assets", value: `$${((d.financialData?.assets?.total || 0) / 1000000).toFixed(2)}M`, passed: true },
                    { label: "Total Liabilities", value: `$${((d.financialData?.liabilities?.total || 0) / 1000000).toFixed(2)}M`, passed: true },
                    { label: "Net Capital", value: `$${(capital / 1000000).toFixed(2)}M`, passed: capital > threshold },
                    { label: "Required Minimum", value: `$${(threshold / 1000000).toFixed(2)}M`, passed: capital > threshold }
                ]
            };
        }
    },
    {
        id: "gst_verification",
        name: "GST Verification",
        shortName: "GST",
        icon: Receipt,
        description: "Tax compliance verification",
        color: "#10B981",
        gradient: "from-emerald-500 to-teal-600",
        samples: [
            { name: "TechCorp Solutions", file: "/samples/gst_compliant.json", compliant: true },
            { name: "QuickMart Retail", file: "/samples/gst_defaulter.json", compliant: false }
        ],
        extractData: (doc) => {
            const d = doc as { business?: { name?: string; gstin?: string }; compliance?: { taxLiability?: number; taxPaid?: number }; returns?: { gstr3b?: { outputTax?: number; inputTaxCredit?: number } } };
            if (!d.compliance) return null;
            const { taxLiability = 0, taxPaid = 0 } = d.compliance;
            return {
                entityName: d.business?.name || "Unknown",
                entityId: d.business?.gstin || "N/A",
                primaryValue: taxPaid,
                threshold: taxLiability,
                isCompliant: taxPaid >= taxLiability,
                details: [
                    { label: "GSTIN", value: d.business?.gstin || "N/A", passed: true },
                    { label: "Output Tax", value: `₹${(d.returns?.gstr3b?.outputTax || 0).toLocaleString()}`, passed: true },
                    { label: "Input Credit", value: `₹${(d.returns?.gstr3b?.inputTaxCredit || 0).toLocaleString()}`, passed: true },
                    { label: "Tax Liability", value: `₹${taxLiability.toLocaleString()}`, passed: true },
                    { label: "Tax Paid", value: `₹${taxPaid.toLocaleString()}`, passed: taxPaid >= taxLiability }
                ]
            };
        }
    },
    {
        id: "bank_statement",
        name: "Bank Statement",
        shortName: "Bank",
        icon: CreditCard,
        description: "Account balance verification",
        color: "#3B82F6",
        gradient: "from-blue-500 to-cyan-600",
        samples: [
            { name: "Sunrise Industries", file: "/samples/bank_healthy.json", compliant: true },
            { name: "Struggling Ventures", file: "/samples/bank_low_balance.json", compliant: false }
        ],
        extractData: (doc) => {
            const d = doc as { account?: { holderName?: string; accountNumber?: string; bankName?: string }; compliance?: { currentBalance?: number; minBalance?: number } };
            if (!d.compliance) return null;
            const { currentBalance = 0, minBalance = 0 } = d.compliance;
            return {
                entityName: d.account?.holderName || "Unknown",
                entityId: d.account?.accountNumber || "N/A",
                primaryValue: currentBalance,
                threshold: minBalance,
                isCompliant: currentBalance >= minBalance,
                details: [
                    { label: "Bank", value: d.account?.bankName || "N/A", passed: true },
                    { label: "Current Balance", value: `₹${currentBalance.toLocaleString()}`, passed: currentBalance >= minBalance },
                    { label: "Min Required", value: `₹${minBalance.toLocaleString()}`, passed: currentBalance >= minBalance }
                ]
            };
        }
    },
    {
        id: "kyc_verification",
        name: "KYC Verification",
        shortName: "KYC",
        icon: UserCheck,
        description: "Identity verification",
        color: "#8B5CF6",
        gradient: "from-violet-500 to-purple-600",
        samples: [
            { name: "Rajesh Sharma", file: "/samples/kyc_verified.json", compliant: true },
            { name: "Unknown Person", file: "/samples/kyc_incomplete.json", compliant: false }
        ],
        extractData: (doc) => {
            // Support multiple Aadhaar/KYC JSON formats
            const d = doc as Record<string, unknown>;

            // Try to extract name from various formats
            let fullName = "Unknown";
            let aadhaarNumber = "N/A";
            let dob = "N/A";
            let address = "N/A";
            let verificationScore = 0;
            let minScore = 80;
            let riskCategory = "Unknown";

            // Format 1: Our sample format
            if (d.identity && typeof d.identity === "object") {
                const identity = d.identity as Record<string, unknown>;
                fullName = (identity.fullName as string) || fullName;
            }
            if (d.verification && typeof d.verification === "object") {
                const verification = d.verification as Record<string, unknown>;
                verificationScore = (verification.verificationScore as number) || 0;
                minScore = (verification.minScore as number) || 80;
                riskCategory = (verification.riskCategory as string) || "Unknown";
            }

            // Format 2: DigiLocker Aadhaar format
            if (d.name || d.Name) {
                fullName = (d.name as string) || (d.Name as string) || fullName;
                verificationScore = 95; // DigiLocker verified = high score
                riskCategory = "Low";
            }
            if (d.uid || d.UID || d.aadhaar || d.Aadhaar) {
                aadhaarNumber = (d.uid as string) || (d.UID as string) || (d.aadhaar as string) || (d.Aadhaar as string) || "Verified";
            }
            if (d.dob || d.DOB || d.dateOfBirth) {
                dob = (d.dob as string) || (d.DOB as string) || (d.dateOfBirth as string) || dob;
            }
            if (d.address || d.Address) {
                const addr = d.address || d.Address;
                if (typeof addr === "string") {
                    address = addr;
                } else if (typeof addr === "object" && addr !== null) {
                    const addrObj = addr as Record<string, unknown>;
                    address = [addrObj.house, addrObj.street, addrObj.locality, addrObj.city, addrObj.state]
                        .filter(Boolean).join(", ") || "Provided";
                }
            }

            // Format 3: UIDAI/eKYC format (simple)
            if (d.poi && typeof d.poi === "object") {
                const poi = d.poi as Record<string, unknown>;
                fullName = (poi.name as string) || fullName;
                dob = (poi.dob as string) || dob;
                verificationScore = 95;
                riskCategory = "Low";
            }
            if (d.poa && typeof d.poa === "object") {
                const poa = d.poa as Record<string, unknown>;
                address = [poa.house, poa.street, poa.loc, poa.dist, poa.state, poa.pc]
                    .filter(Boolean).join(", ") || address;
            }

            // Format 4: REAL UIDAI Aadhaar eKYC format (KycRes.UidData.Poi with @ prefixed attributes)
            if (d.KycRes && typeof d.KycRes === "object") {
                const kycRes = d.KycRes as Record<string, unknown>;
                if (kycRes.UidData && typeof kycRes.UidData === "object") {
                    const uidData = kycRes.UidData as Record<string, unknown>;

                    // Extract UID (masked)
                    if (uidData["@uid"]) {
                        aadhaarNumber = uidData["@uid"] as string;
                    }

                    // Extract POI (Proof of Identity)
                    if (uidData.Poi && typeof uidData.Poi === "object") {
                        const poi = uidData.Poi as Record<string, unknown>;
                        fullName = (poi["@name"] as string) || fullName;
                        dob = (poi["@dob"] as string) || dob;
                    }

                    // Extract POA (Proof of Address)
                    if (uidData.Poa && typeof uidData.Poa === "object") {
                        const poa = uidData.Poa as Record<string, unknown>;
                        address = [
                            poa["@house"], poa["@street"], poa["@loc"],
                            poa["@dist"], poa["@state"], poa["@pc"]
                        ].filter(Boolean).join(", ") || address;
                    }

                    // UIDAI verified = high score
                    verificationScore = 98;
                    riskCategory = "Low";
                }
            }

            // Format 5: Generic KYC format
            if (d.fullName || d.full_name) {
                fullName = (d.fullName as string) || (d.full_name as string) || fullName;
                verificationScore = 90;
                riskCategory = "Medium";
            }

            // If we found a name, consider it valid
            if (fullName === "Unknown" && !d.verification && !d.KycRes) {
                return null;
            }

            // If no verification score but we have data, set defaults
            if (verificationScore === 0 && fullName !== "Unknown") {
                verificationScore = 85;
                riskCategory = "Medium";
            }

            return {
                entityName: fullName,
                entityId: aadhaarNumber !== "N/A" ? `XXXX XXXX ${aadhaarNumber.slice(-4)}` : "ID Verified",
                primaryValue: verificationScore,
                threshold: minScore,
                isCompliant: verificationScore >= minScore,
                details: [
                    { label: "Name", value: fullName, passed: true },
                    { label: "Aadhaar", value: aadhaarNumber !== "N/A" ? `XXXX XXXX ${aadhaarNumber.slice(-4)}` : "Verified", passed: true },
                    { label: "DOB", value: dob, passed: dob !== "N/A" },
                    { label: "Score", value: `${verificationScore}/100`, passed: verificationScore >= minScore },
                    { label: "Risk", value: riskCategory, passed: riskCategory === "Low" }
                ]
            };
        }
    },
    {
        id: "credit_score",
        name: "Credit Score",
        shortName: "Credit",
        icon: TrendingUp,
        description: "Creditworthiness check",
        color: "#F59E0B",
        gradient: "from-amber-500 to-orange-600",
        samples: [
            { name: "Priya Investments", file: "/samples/credit_excellent.json", compliant: true },
            { name: "Shaky Enterprises", file: "/samples/credit_poor.json", compliant: false }
        ],
        extractData: (doc) => {
            const d = doc as { borrower?: { name?: string; pan?: string }; compliance?: { score?: number; minScore?: number } };
            if (!d.compliance) return null;
            const { score = 0, minScore = 700 } = d.compliance;
            return {
                entityName: d.borrower?.name || "Unknown",
                entityId: d.borrower?.pan || "N/A",
                primaryValue: score,
                threshold: minScore,
                isCompliant: score >= minScore,
                details: [
                    { label: "Credit Score", value: `${score}/900`, passed: score >= minScore },
                    { label: "Minimum Required", value: `${minScore}/900`, passed: score >= minScore }
                ]
            };
        }
    },
    {
        id: "aml_screening",
        name: "AML Screening",
        shortName: "AML",
        icon: ShieldAlert,
        description: "Anti-money laundering",
        color: "#EF4444",
        gradient: "from-red-500 to-rose-600",
        samples: [
            { name: "Global Trade Partners", file: "/samples/aml_clean.json", compliant: true },
            { name: "Shadow Trading", file: "/samples/aml_flagged.json", compliant: false }
        ],
        extractData: (doc) => {
            const d = doc as { entity?: { name?: string; registrationNumber?: string }; compliance?: { riskScore?: number; maxRisk?: number } };
            if (!d.compliance) return null;
            const { riskScore = 0, maxRisk = 50 } = d.compliance;
            return {
                entityName: d.entity?.name || "Unknown",
                entityId: d.entity?.registrationNumber || "N/A",
                primaryValue: riskScore,
                threshold: maxRisk,
                isCompliant: riskScore < maxRisk,
                details: [
                    { label: "Risk Score", value: `${riskScore}/100`, passed: riskScore < maxRisk },
                    { label: "Max Allowed", value: `${maxRisk}/100`, passed: riskScore < maxRisk }
                ]
            };
        }
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function PrototypePage() {
    // State
    const [selectedType, setSelectedType] = useState<VerificationType>(VERIFICATION_TYPES[0]);
    const [uploadedDocument, setUploadedDocument] = useState<Record<string, unknown> | null>(null);
    const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [signatureStatus, setSignatureStatus] = useState<SignatureVerificationResult | null>(null);
    const [showPrivateData, setShowPrivateData] = useState(false);
    const [verificationHistory, setVerificationHistory] = useState<VerificationHistoryItem[]>([]);
    const [proofProgress, setProofProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const isLoading = ["connecting", "generating", "authorizing", "signing", "confirming"].includes(status);
    const isComplete = status === "success" || status === "failure";

    // Animate proof progress
    useEffect(() => {
        if (isLoading) {
            const steps = { connecting: 10, generating: 40, authorizing: 60, signing: 80, confirming: 95 };
            setProofProgress(steps[status as keyof typeof steps] || 0);
        } else if (status === "success") {
            setProofProgress(100);
        } else {
            setProofProgress(0);
        }
    }, [status, isLoading]);

    // Add to history on success
    useEffect(() => {
        if (status === "success" && result && verificationData) {
            setVerificationHistory(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                type: selectedType.shortName,
                entity: verificationData.entityName,
                result: result.verified,
                timestamp: new Date(),
                txHash: result.transactionHash
            }, ...prev].slice(0, 5));
        }
    }, [status, result, verificationData, selectedType]);

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleTypeChange = (type: VerificationType) => {
        setSelectedType(type);
        setUploadedDocument(null);
        setVerificationData(null);
        setUploadError(null);
        setSignatureStatus(null);
        if (isComplete) reset();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploadError(null);

        try {
            const text = await file.text();
            const json = JSON.parse(text);
            const data = selectedType.extractData(json);

            if (!data) {
                throw new Error(`Invalid document format for ${selectedType.name}`);
            }

            setUploadedDocument(json);
            setVerificationData(data);
            const sigResult = verifyDocumentSignature(json);
            setSignatureStatus(sigResult);
            if (isComplete) reset();
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Failed to parse document");
            setUploadedDocument(null);
            setVerificationData(null);
        }
    };

    const handleLoadSample = async (sampleFile: string) => {
        try {
            const response = await fetch(sampleFile);
            const json = await response.json();
            const data = selectedType.extractData(json);

            if (!data) throw new Error(`Invalid sample document`);

            setUploadedDocument(json);
            setVerificationData(data);
            setUploadError(null);
            const sigResult = verifyDocumentSignature(json);
            setSignatureStatus(sigResult);
            if (isComplete) reset();
        } catch {
            setUploadError("Failed to load sample document");
            setSignatureStatus(null);
        }
    };

    const handleGenerateProof = async () => {
        if (!verificationData) return;

        await generateAndSubmitProof({
            institutionId: verificationData.entityId,
            metric: selectedType.id,
            value: Math.round(verificationData.primaryValue),
            threshold: verificationData.threshold.toString(),
            assets: verificationData.primaryValue.toString(),
            liabilities: "0"
        });
    };

    const handleReset = () => {
        reset();
        setUploadedDocument(null);
        setVerificationData(null);
        setUploadError(null);
        setSignatureStatus(null);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    const TypeIcon = selectedType.icon;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
            </div>

            <div className="relative z-10 pt-20 pb-12 px-4 lg:px-8">
                <div className="max-w-[1600px] mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <h1 className="text-2xl font-bold">Verification Console</h1>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                                        LIVE
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Zero-knowledge compliance verification • Powered by Groth16
                                </p>
                            </div>

                            {/* Network Status */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                    <div className="relative">
                                        <Globe className="w-4 h-4 text-gray-400" />
                                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    </div>
                                    <span className="text-sm text-gray-300">{DEFAULT_NETWORK.name}</span>
                                </div>

                                {isConnected && address ? (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        <span className="font-mono text-sm text-gray-300">
                                            {address.slice(0, 6)}...{address.slice(-4)}
                                        </span>
                                    </div>
                                ) : (
                                    <Button onClick={connect} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90">
                                        <Wallet className="w-4 h-4" />
                                        Connect
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Grid */}
                    <div className="grid lg:grid-cols-[1fr,380px] gap-6">
                        {/* Main Panel */}
                        <div className="space-y-6">
                            {/* Verification Type Selector */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 bg-white/[0.02] rounded-2xl border border-white/10 backdrop-blur-xl"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                        Verification Type
                                    </h2>
                                    <span className="text-xs text-gray-500">{VERIFICATION_TYPES.length} available</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                    {VERIFICATION_TYPES.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = selectedType.id === type.id;
                                        return (
                                            <motion.button
                                                key={type.id}
                                                onClick={() => handleTypeChange(type)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={isLoading}
                                                className={`
                                                    relative p-3 rounded-xl text-center transition-all duration-200
                                                    ${isSelected
                                                        ? "bg-white/10 border-2 border-white/20"
                                                        : "bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10"
                                                    }
                                                    ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                                `}
                                            >
                                                <Icon
                                                    className={`w-5 h-5 mx-auto mb-1.5 transition-colors ${isSelected ? "text-white" : "text-gray-500"}`}
                                                    style={{ color: isSelected ? type.color : undefined }}
                                                />
                                                <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
                                                    {type.shortName}
                                                </span>
                                                {isSelected && (
                                                    <motion.div
                                                        layoutId="activeType"
                                                        className="absolute inset-0 rounded-xl border-2"
                                                        style={{ borderColor: type.color }}
                                                        transition={{ duration: 0.2 }}
                                                    />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>

                            {/* Document Upload */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 bg-white/[0.02] rounded-2xl border border-white/10 backdrop-blur-xl"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <TypeIcon className="w-5 h-5" style={{ color: selectedType.color }} />
                                        <h2 className="font-semibold">{selectedType.name}</h2>
                                    </div>
                                    <span className="text-xs text-gray-500">{selectedType.description}</span>
                                </div>

                                {/* Upload Zone */}
                                <div
                                    onClick={() => !isLoading && fileInputRef.current?.click()}
                                    className={`
                                        relative p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all
                                        ${verificationData
                                            ? "border-emerald-500/50 bg-emerald-500/5"
                                            : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                                        }
                                        ${isLoading ? "opacity-50 pointer-events-none" : ""}
                                    `}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />

                                    {verificationData ? (
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <FileCheck className="w-8 h-8 text-emerald-400" />
                                            </div>
                                            <p className="text-lg font-semibold text-white mb-1">
                                                {verificationData.entityName}
                                            </p>
                                            <p className="text-sm text-gray-400 font-mono">
                                                {verificationData.entityId}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div
                                                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                                style={{ background: `linear-gradient(135deg, ${selectedType.color}20, ${selectedType.color}05)` }}
                                            >
                                                <Upload className="w-8 h-8" style={{ color: selectedType.color }} />
                                            </div>
                                            <p className="text-gray-300 font-medium mb-1">
                                                Drop your document here
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                JSON format • {selectedType.name} document
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Error Display */}
                                {uploadError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
                                    >
                                        <AlertCircle className="w-4 h-4 text-red-400" />
                                        <p className="text-sm text-red-400">{uploadError}</p>
                                    </motion.div>
                                )}

                                {/* Sample Documents */}
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <p className="text-xs text-gray-500 mb-3">Quick load sample:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedType.samples.map((sample) => (
                                            <button
                                                key={sample.file}
                                                onClick={() => handleLoadSample(sample.file)}
                                                disabled={isLoading}
                                                className={`
                                                    flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all
                                                    ${sample.compliant
                                                        ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                                        : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                    }
                                                    ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                                                `}
                                            >
                                                {sample.compliant ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {sample.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Verification Data & Actions */}
                            <AnimatePresence mode="wait">
                                {verificationData && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-4"
                                    >
                                        {/* Signature Status */}
                                        {signatureStatus && (
                                            <div
                                                className={`p-4 rounded-xl border flex items-center justify-between ${signatureStatus.isTrusted
                                                    ? "bg-indigo-500/10 border-indigo-500/30"
                                                    : signatureStatus.isValid
                                                        ? "bg-yellow-500/10 border-yellow-500/30"
                                                        : "bg-red-500/10 border-red-500/30"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${signatureStatus.isTrusted ? "bg-indigo-500" : signatureStatus.isValid ? "bg-yellow-500" : "bg-red-500"
                                                        }`}>
                                                        {signatureStatus.isTrusted ? <Shield className="w-5 h-5 text-white" /> :
                                                            signatureStatus.isValid ? <AlertCircle className="w-5 h-5 text-white" /> :
                                                                <XCircle className="w-5 h-5 text-white" />}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold ${signatureStatus.isTrusted ? "text-indigo-400" :
                                                            signatureStatus.isValid ? "text-yellow-400" : "text-red-400"
                                                            }`}>
                                                            {signatureStatus.isTrusted ? "✓ Verified by Trusted Issuer" :
                                                                signatureStatus.isValid ? "⚠ Valid Signature, Unknown Issuer" :
                                                                    "✗ Unverified Document"}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {signatureStatus.isTrusted && signatureStatus.issuer
                                                                ? `Signed by ${signatureStatus.issuer.name} (${signatureStatus.issuer.country})`
                                                                : signatureStatus.isValid
                                                                    ? `Signed by: ${signatureStatus.recoveredAddress?.slice(0, 10)}...`
                                                                    : signatureStatus.error || "No cryptographic signature found"}
                                                        </p>
                                                    </div>
                                                </div>
                                                {signatureStatus.isTrusted && signatureStatus.issuer && (
                                                    <span className="px-3 py-1 text-xs font-medium bg-indigo-500/20 text-indigo-400 rounded-full">
                                                        {signatureStatus.issuer.type.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Data Preview */}
                                        <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                                    Extracted Data
                                                </h3>
                                                <button
                                                    onClick={() => setShowPrivateData(!showPrivateData)}
                                                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {showPrivateData ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    {showPrivateData ? "Hide" : "Show"} values
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {verificationData.details.map((detail, index) => (
                                                    <div
                                                        key={detail.label}
                                                        className="p-3 bg-white/[0.02] rounded-xl border border-white/5"
                                                    >
                                                        <p className="text-xs text-gray-500 mb-1">{detail.label}</p>
                                                        <div className="flex items-center justify-between">
                                                            <p className={`font-mono text-sm ${showPrivateData ? "" : "blur-sm select-none"} ${detail.passed === false ? "text-red-400" : "text-white"
                                                                }`}>
                                                                {detail.value}
                                                            </p>
                                                            {detail.passed !== undefined && (
                                                                detail.passed
                                                                    ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                                    : <XCircle className="w-4 h-4 text-red-500" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Compliance Result */}
                                            <div className={`mt-4 p-4 rounded-xl border ${verificationData.isCompliant
                                                ? "bg-emerald-500/10 border-emerald-500/30"
                                                : "bg-red-500/10 border-red-500/30"
                                                }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {verificationData.isCompliant
                                                            ? <CheckCircle className="w-6 h-6 text-emerald-400" />
                                                            : <XCircle className="w-6 h-6 text-red-400" />
                                                        }
                                                        <div>
                                                            <p className={`font-bold ${verificationData.isCompliant ? "text-emerald-400" : "text-red-400"}`}>
                                                                {verificationData.isCompliant ? "COMPLIANT" : "NON-COMPLIANT"}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {selectedType.name} check {verificationData.isCompliant ? "passed" : "failed"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Value / Threshold</p>
                                                        <p className="font-mono text-sm">
                                                            {verificationData.primaryValue.toLocaleString()} / {verificationData.threshold.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Generate Proof Button */}
                                        {!isComplete && (
                                            <motion.button
                                                onClick={handleGenerateProof}
                                                disabled={isLoading || !verificationData}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                className={`
                                                    w-full p-4 rounded-xl font-semibold text-white transition-all relative overflow-hidden
                                                    bg-gradient-to-r ${selectedType.gradient}
                                                    ${isLoading ? "opacity-80" : "hover:opacity-90"}
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                `}
                                            >
                                                {isLoading && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-white/20"
                                                        initial={{ x: "-100%" }}
                                                        animate={{ x: `${proofProgress - 100}%` }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                )}
                                                <span className="relative flex items-center justify-center gap-2">
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            <span>
                                                                {status === "connecting" && "Connecting..."}
                                                                {status === "generating" && "Generating ZK Proof..."}
                                                                {status === "authorizing" && "Authorizing..."}
                                                                {status === "signing" && "Sign in MetaMask..."}
                                                                {status === "confirming" && "Confirming on-chain..."}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Zap className="w-5 h-5" />
                                                            Generate ZK Proof & Submit On-Chain
                                                        </>
                                                    )}
                                                </span>
                                            </motion.button>
                                        )}

                                        {/* Proof Generation Progress */}
                                        <AnimatePresence>
                                            {isLoading && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="p-6 bg-white/[0.02] rounded-2xl border border-white/10"
                                                >
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Sparkles className="w-5 h-5 text-indigo-400" />
                                                        <h3 className="font-semibold">Proof Generation</h3>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {[
                                                            { label: "Connect to Prover", step: "connecting" },
                                                            { label: "Generate Groth16 Proof", step: "generating" },
                                                            { label: "Keychain Authorization", step: "authorizing" },
                                                            { label: "Sign Transaction", step: "signing" },
                                                            { label: "Confirm on Blockchain", step: "confirming" }
                                                        ].map((item, index) => {
                                                            const steps = ["connecting", "generating", "authorizing", "signing", "confirming"];
                                                            const currentIndex = steps.indexOf(status);
                                                            const itemIndex = steps.indexOf(item.step);
                                                            const isDone = itemIndex < currentIndex;
                                                            const isActive = item.step === status;

                                                            return (
                                                                <div key={item.step} className="flex items-center gap-3">
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDone ? "bg-emerald-500" : isActive ? "bg-indigo-500" : "bg-white/10"
                                                                        }`}>
                                                                        {isDone ? (
                                                                            <Check className="w-4 h-4 text-white" />
                                                                        ) : isActive ? (
                                                                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                                                                        ) : (
                                                                            <span className="text-xs text-gray-500">{index + 1}</span>
                                                                        )}
                                                                    </div>
                                                                    <span className={`text-sm ${isDone ? "text-emerald-400" : isActive ? "text-white" : "text-gray-500"}`}>
                                                                        {item.label}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    <div className="mt-4 p-3 bg-white/[0.02] rounded-lg">
                                                        <p className="text-xs text-gray-400">
                                                            🔒 Your financial data remains private. Only the compliance result is revealed on-chain.
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Error Display */}
                                        {error && status === "failure" && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                                            >
                                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-red-400">Verification Failed</p>
                                                    <p className="text-sm text-gray-400 mt-1">{error}</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Success Result */}
                                        {isComplete && result && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-6 bg-white/[0.02] rounded-2xl border border-white/10"
                                            >
                                                <div className={`p-6 rounded-xl mb-6 ${result.verified ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result.verified ? "bg-emerald-500" : "bg-red-500"
                                                            }`}>
                                                            {result.verified
                                                                ? <CheckCircle className="w-8 h-8 text-white" />
                                                                : <XCircle className="w-8 h-8 text-white" />
                                                            }
                                                        </div>
                                                        <div>
                                                            <h3 className={`text-2xl font-bold ${result.verified ? "text-emerald-400" : "text-red-400"}`}>
                                                                {result.verified ? "VERIFIED" : "FAILED"}
                                                            </h3>
                                                            <p className="text-gray-400">
                                                                {verificationData.entityName} • Block #{result.blockNumber}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                                        <p className="text-xs text-gray-500 mb-2">Transaction Hash</p>
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={`${DEFAULT_NETWORK.blockExplorer}/tx/${result.transactionHash}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-mono text-sm text-indigo-400 hover:underline"
                                                            >
                                                                {result.transactionHash.slice(0, 10)}...{result.transactionHash.slice(-8)}
                                                            </a>
                                                            <button
                                                                onClick={() => copyToClipboard(result.transactionHash)}
                                                                className="p-1 hover:bg-white/10 rounded"
                                                            >
                                                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                                                            </button>
                                                            <a
                                                                href={`${DEFAULT_NETWORK.blockExplorer}/tx/${result.transactionHash}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1 hover:bg-white/10 rounded"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                                        <p className="text-xs text-gray-500 mb-2">Proof Hash</p>
                                                        <p className="font-mono text-sm text-gray-300">
                                                            {result.proofHash.slice(0, 10)}...{result.proofHash.slice(-8)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 mt-4">
                                                    <button
                                                        onClick={() => {
                                                            const proofData = {
                                                                proofX: {
                                                                    version: "1.2.0",
                                                                    network: DEFAULT_NETWORK.name,
                                                                    chainId: DEFAULT_NETWORK.chainId,
                                                                    generatedAt: new Date().toISOString()
                                                                },
                                                                verification: {
                                                                    type: selectedType.id,
                                                                    typeName: selectedType.name,
                                                                    entity: verificationData.entityName,
                                                                    entityId: verificationData.entityId,
                                                                    result: result.verified ? "COMPLIANT" : "NON-COMPLIANT",
                                                                    threshold: verificationData.threshold
                                                                },
                                                                blockchain: {
                                                                    transactionHash: result.transactionHash,
                                                                    blockNumber: result.blockNumber,
                                                                    proofHash: result.proofHash,
                                                                    explorerUrl: `${DEFAULT_NETWORK.blockExplorer}/tx/${result.transactionHash}`
                                                                },
                                                                issuer: signatureStatus?.isTrusted ? {
                                                                    name: signatureStatus.issuer?.name,
                                                                    type: signatureStatus.issuer?.type,
                                                                    country: signatureStatus.issuer?.country
                                                                } : null,
                                                                zkProof: {
                                                                    system: "Groth16",
                                                                    curve: "BN254",
                                                                    commitment: result.proofHash
                                                                }
                                                            };
                                                            const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
                                                            const url = URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = `proofx-${selectedType.id}-${Date.now()}.json`;
                                                            a.click();
                                                            URL.revokeObjectURL(url);
                                                        }}
                                                        className="flex-1 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download Proof
                                                    </button>
                                                    <button
                                                        onClick={handleReset}
                                                        className="flex-1 p-3 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                        New Verification
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-6 bg-white/[0.02] rounded-2xl border border-white/10 backdrop-blur-xl"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                        Session Stats
                                    </h2>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 text-center">
                                        <p className="text-2xl font-bold text-white">{verificationHistory.length}</p>
                                        <p className="text-xs text-gray-500">Verifications</p>
                                    </div>
                                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 text-center">
                                        <p className="text-2xl font-bold text-emerald-400">
                                            {verificationHistory.filter(h => h.result).length}
                                        </p>
                                        <p className="text-xs text-gray-500">Successful</p>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-white/[0.02] rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm text-gray-400">Network Status</span>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-sm text-emerald-400">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        Active
                                    </span>
                                </div>
                            </motion.div>

                            {/* Recent History */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-6 bg-white/[0.02] rounded-2xl border border-white/10 backdrop-blur-xl"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-5 h-5 text-indigo-400" />
                                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                        Recent Activity
                                    </h2>
                                </div>

                                {verificationHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {verificationHistory.map((item) => (
                                            <div
                                                key={item.id}
                                                className="p-3 bg-white/[0.02] rounded-xl border border-white/5"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-white/10 rounded">
                                                        {item.type}
                                                    </span>
                                                    {item.result
                                                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                        : <XCircle className="w-4 h-4 text-red-400" />
                                                    }
                                                </div>
                                                <p className="text-sm text-white truncate">{item.entity}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {item.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No verifications yet</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* ZK Info */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Lock className="w-5 h-5 text-indigo-400" />
                                    <h2 className="font-semibold text-white">Zero-Knowledge</h2>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">
                                    Your sensitive financial data never leaves your device. Only the cryptographic proof is submitted to the blockchain.
                                </p>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        Groth16 proving system
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        BN254 elliptic curve
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        On-chain verification
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
