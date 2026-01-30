"use client";

import { motion } from "framer-motion";
import { FileText, ShieldCheck, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Section, FadeIn, Card, Button, Label, Container } from "@/components/ui";

const steps = [
    {
        number: "01",
        icon: FileText,
        title: "Local Execution",
        description: "Data processes on your infrastructure.",
        detail: "Financial records, customer data, and regulatory metrics are processed in-place. Zero data egress.",
    },
    {
        number: "02",
        icon: ShieldCheck,
        title: "Zero-Knowledge Proof",
        description: "Mathematics verifies validity, not values.",
        detail: "The proof is deterministic, tamper-proof, and computationally verifiable.",
    },
    {
        number: "03",
        icon: Globe,
        title: "Global Verification",
        description: "Instant settlement on public ledger.",
        detail: "Verification happens in milliseconds. No intermediaries. No trust assumptions.",
    },
];

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen pt-16">
            {/* Hero */}
            <Section className="!pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Label className="mb-4 block">How It Works</Label>
                    <h1 className="text-h1 text-[var(--text-primary)] mb-6 max-w-3xl">
                        Privacy-Preserving Compliance
                        <br />
                        <span className="text-[var(--text-secondary)]">in Three Steps</span>
                    </h1>
                    <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl">
                        ProofX transforms how institutions prove compliance. No data sharing.
                        No intermediaries. Just cryptographic certainty.
                    </p>
                </motion.div>
            </Section>

            {/* Steps */}
            <section className="pb-32">
                <Container>
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-[39px] top-0 bottom-0 w-px bg-[var(--border-subtle)] hidden md:block" />

                        <div className="space-y-16">
                            {steps.map((step, index) => (
                                <FadeIn key={step.number} delay={index * 0.15}>
                                    <div className="flex gap-8">
                                        {/* Number node */}
                                        <div className="relative flex-shrink-0">
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                whileInView={{ scale: 1, opacity: 1 }}
                                                whileHover={{ scale: 1.1, borderColor: "var(--accent)" }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.4, delay: index * 0.15 + 0.2 }}
                                                className="w-20 h-20 rounded-full bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center cursor-default"
                                            >
                                                <span className="text-h2 text-[var(--accent)] font-mono">{step.number}</span>
                                            </motion.div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 pt-2">
                                            <div className="flex items-start gap-4 mb-4">
                                                <step.icon className="w-6 h-6 text-[var(--accent)] flex-shrink-0 mt-1" />
                                                <h2 className="text-h2 text-[var(--text-primary)]">{step.title}</h2>
                                            </div>
                                            <p className="text-body-lg text-[var(--text-secondary)] mb-4 max-w-xl ml-10">
                                                {step.description}
                                            </p>
                                            <Card className="ml-10 max-w-xl" hover={false}>
                                                <p className="text-body text-[var(--text-tertiary)] font-mono">
                                                    {step.detail}
                                                </p>
                                            </Card>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Technical Detail */}
            <section className="py-32 bg-[var(--surface-1)] border-y border-[var(--border-subtle)]">
                <Container>
                    <FadeIn>
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <Label className="mb-4 block">Zero-Knowledge Proofs</Label>
                                <h2 className="text-h2 text-[var(--text-primary)] mb-6">
                                    The Cryptography Behind ProofX
                                </h2>
                                <p className="text-body-lg text-[var(--text-secondary)] mb-6">
                                    Zero-knowledge proofs allow one party to prove to another that a
                                    statement is true, without revealing any information beyond the
                                    validity of the statement itself.
                                </p>
                                <ul className="space-y-3 text-body text-[var(--text-secondary)]">
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
                                        <span>Prove your reserves exceed liabilities without revealing amounts</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
                                        <span>Verify KYC compliance without sharing customer identities</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
                                        <span>Demonstrate audit trails without exposing transaction details</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Diagram */}
                            <div className="relative">
                                <Card hover={false} className="p-12">
                                    <div className="flex flex-col items-center gap-6">
                                        {/* Nodes */}
                                        <div className="flex items-center justify-center gap-8 w-full">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-16 h-16 rounded-lg bg-[var(--surface-0)] border border-[var(--border-subtle)] flex items-center justify-center">
                                                    <FileText className="w-6 h-6 text-[var(--text-tertiary)]" />
                                                </div>
                                                <span className="text-label">Private Data</span>
                                            </div>

                                            <ArrowRight className="w-6 h-6 text-[var(--accent)]" />

                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-16 h-16 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center">
                                                    <ShieldCheck className="w-6 h-6 text-[var(--accent)]" />
                                                </div>
                                                <span className="text-label">ZK Circuit</span>
                                            </div>

                                            <ArrowRight className="w-6 h-6 text-[var(--accent)]" />

                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-16 h-16 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 flex items-center justify-center">
                                                    <Globe className="w-6 h-6 text-[var(--success)]" />
                                                </div>
                                                <span className="text-label">Public Proof</span>
                                            </div>
                                        </div>

                                        <div className="w-full h-px bg-[var(--border-subtle)] my-4" />

                                        <p className="text-sm text-[var(--text-tertiary)] text-center">
                                            Data never leaves your infrastructure. Only the proof is shared.
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </FadeIn>
                </Container>
            </section>

            {/* CTA */}
            <Section>
                <FadeIn className="text-center">
                    <h2 className="text-h2 text-[var(--text-primary)] mb-6">
                        See the Architecture
                    </h2>
                    <p className="text-body-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
                        Dive deeper into the technical implementation and system components.
                    </p>
                    <Link href="/architecture">
                        <Button>
                            View Architecture
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </FadeIn>
            </Section>
        </div>
    );
}
