"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Globe, Shield, Building, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Section, FadeIn, Card, Button, Label, Container } from "@/components/ui";

const metrics = [
    {
        value: "$2.4T",
        label: "Assets Under Verification",
        description: "Annual compliance verification volume",
        icon: TrendingUp,
    },
    {
        value: "340+",
        label: "Institutions Onboarded",
        description: "Banks, funds, and financial services",
        icon: Building,
    },
    {
        value: "47",
        label: "Countries Supported",
        description: "Global regulatory coverage",
        icon: Globe,
    },
    {
        value: "99.99%",
        label: "Verification Accuracy",
        description: "Cryptographic certainty",
        icon: Shield,
    },
];

const marketImpact = [
    {
        title: "Cost Reduction",
        description: "Eliminating manual audits and reconciliation overhead.",
        stat: "90% savings",
    },
    {
        title: "Settlement Speed",
        description: "Moving from T+2 settlement to instant finality.",
        stat: "< 50ms",
    },
    {
        title: "Risk Removal",
        description: "Zero third-party liability for sensitive data handling.",
        stat: "100% indemnified",
    },
];

const socialImpact = [
    {
        title: "Privacy",
        description: "Protecting user privacy worldwide.",
        icon: Shield,
    },
    {
        title: "Access",
        description: "Democratizing financial compliance access.",
        icon: Globe,
    },
    {
        title: "Freedom",
        description: "Eliminating surveillance from verification.",
        icon: Users,
    },
];

export default function ImpactPage() {
    return (
        <div className="min-h-screen pt-16">
            {/* Hero */}
            <Section className="!pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Label className="mb-4 block">Impact</Label>
                    <h1 className="text-h1 text-[var(--text-primary)] mb-6 max-w-3xl">
                        Global Scale.
                        <br />
                        <span className="text-[var(--text-secondary)]">Institutional Trust.</span>
                    </h1>
                    <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl">
                        ProofX is transforming how financial institutions approach compliance,
                        privacy, and trust verification at unprecedented scale.
                    </p>
                </motion.div>
            </Section>

            {/* Metrics */}
            <section className="pb-24">
                <Container>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {metrics.map((metric, index) => (
                            <FadeIn key={metric.label} delay={index * 0.1}>
                                <Card className="text-center relative overflow-hidden">
                                    <div className="absolute top-4 right-4 opacity-10">
                                        <metric.icon className="w-16 h-16 text-[var(--accent)]" />
                                    </div>
                                    <motion.p
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                                        className="text-display text-[var(--accent)] font-mono mb-2 relative z-10"
                                    >
                                        {metric.value}
                                    </motion.p>
                                    <p className="text-h3 text-[var(--text-primary)] mb-2 relative z-10">{metric.label}</p>
                                    <p className="text-sm text-[var(--text-tertiary)] relative z-10">{metric.description}</p>
                                </Card>
                            </FadeIn>
                        ))}
                    </div>
                </Container>
            </section>

            {/* World Map Visualization */}
            <section className="py-24 bg-[var(--surface-1)] border-y border-[var(--border-subtle)] overflow-hidden">
                <Container>
                    <FadeIn className="text-center mb-16">
                        <Label className="mb-4 block">Network</Label>
                        <h2 className="text-h2 text-[var(--text-primary)]">
                            Global Verification Network
                        </h2>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <div className="relative h-64 md:h-96 rounded-xl bg-[var(--surface-0)] border border-[var(--border-subtle)] overflow-hidden">
                            {/* Simplified world map dots */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg viewBox="0 0 800 400" className="w-full h-full opacity-30">
                                    {/* Americas */}
                                    <circle cx="150" cy="150" r="3" fill="var(--accent)" />
                                    <circle cx="180" cy="180" r="3" fill="var(--accent)" />
                                    <circle cx="200" cy="200" r="3" fill="var(--accent)" />
                                    <circle cx="170" cy="220" r="3" fill="var(--accent)" />
                                    <circle cx="220" cy="280" r="3" fill="var(--accent)" />

                                    {/* Europe */}
                                    <circle cx="400" cy="120" r="3" fill="var(--accent)" />
                                    <circle cx="420" cy="130" r="3" fill="var(--accent)" />
                                    <circle cx="380" cy="140" r="3" fill="var(--accent)" />
                                    <circle cx="440" cy="150" r="3" fill="var(--accent)" />
                                    <circle cx="410" cy="160" r="3" fill="var(--accent)" />

                                    {/* Asia */}
                                    <circle cx="550" cy="140" r="3" fill="var(--accent)" />
                                    <circle cx="600" cy="160" r="3" fill="var(--accent)" />
                                    <circle cx="650" cy="180" r="3" fill="var(--accent)" />
                                    <circle cx="680" cy="200" r="3" fill="var(--accent)" />
                                    <circle cx="620" cy="220" r="3" fill="var(--accent)" />

                                    {/* Australia */}
                                    <circle cx="700" cy="300" r="3" fill="var(--accent)" />
                                    <circle cx="720" cy="320" r="3" fill="var(--accent)" />
                                </svg>

                                {/* Animated pulse dots */}
                                {[
                                    { x: "19%", y: "38%", delay: 0 },
                                    { x: "52%", y: "35%", delay: 0.5 },
                                    { x: "80%", y: "50%", delay: 1 },
                                    { x: "26%", y: "55%", delay: 1.5 },
                                ].map((dot, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-3 h-3"
                                        style={{ left: dot.x, top: dot.y }}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{
                                            scale: [0, 1, 1.5, 1],
                                            opacity: [0, 1, 0.5, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            delay: dot.delay,
                                            repeat: Infinity,
                                            repeatDelay: 3,
                                        }}
                                    >
                                        <div className="w-full h-full rounded-full bg-[var(--accent)]" />
                                        <div className="absolute inset-0 rounded-full bg-[var(--accent)] animate-ping opacity-75" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Stats overlay */}
                            <div className="absolute bottom-6 left-6 right-6 flex justify-between">
                                <div className="bg-[var(--surface-1)]/90 backdrop-blur px-4 py-2 rounded-lg border border-[var(--border-subtle)]">
                                    <p className="text-label">Active Nodes</p>
                                    <p className="text-h3 text-[var(--accent)] font-mono">42</p>
                                </div>
                                <div className="bg-[var(--surface-1)]/90 backdrop-blur px-4 py-2 rounded-lg border border-[var(--border-subtle)]">
                                    <p className="text-label">Daily Verifications</p>
                                    <p className="text-h3 text-[var(--accent)] font-mono">1.2M+</p>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </Container>
            </section>

            {/* Use Cases */}
            <Section>
                <FadeIn>
                    <Label className="mb-4 block">Use Cases</Label>
                    <h2 className="text-h2 text-[var(--text-primary)] mb-16">
                        Real-World Applications
                    </h2>
                </FadeIn>

                <div className="grid md:grid-cols-3 gap-6">
                    {[...marketImpact, ...socialImpact].map((item, index) => (
                        <FadeIn key={item.title} delay={index * 0.1}>
                            <Card className="h-full flex flex-col">
                                {'icon' in item && (
                                    <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                                        <item.icon className="w-8 h-8 text-[var(--accent)] mb-4" />
                                    </motion.div>
                                )}
                                <h3 className="text-h3 text-[var(--text-primary)] mb-4">{item.title}</h3>
                                <p className="text-body text-[var(--text-secondary)] mb-6 flex-1">{item.description}</p>
                                {'stat' in item && (
                                    <div className="pt-4 border-t border-[var(--border-subtle)]">
                                        <p className="text-label">Impact</p>
                                        <p className="text-h3 text-[var(--accent)] font-mono">{item.stat}</p>
                                    </div>
                                )}
                            </Card>
                        </FadeIn>
                    ))}
                </div>
            </Section>

            {/* CTA */}
            <section className="py-24 bg-[var(--surface-1)] border-t border-[var(--border-subtle)]">
                <Container>
                    <FadeIn className="text-center">
                        <h2 className="text-h2 text-[var(--text-primary)] mb-6">
                            Experience the Future of Compliance
                        </h2>
                        <p className="text-body-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
                            Try our interactive prototype and see how ProofX transforms
                            compliance verification.
                        </p>
                        <Link href="/prototype">
                            <Button>
                                Launch Prototype
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </FadeIn>
                </Container>
            </section>
        </div>
    );
}
