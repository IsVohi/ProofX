"use client";

import { motion } from "framer-motion";
import { Database, Server, Shield, Globe, Cpu, Lock, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Section, FadeIn, Card, Button, Label, Container } from "@/components/ui";

const layers = [
    {
        name: "Client Layer",
        icon: Database,
        color: "var(--accent)",
        components: [
            { name: "Data Vault", status: "active", description: "Secure data ingestion." },
            { name: "Proof Generator", status: "active", description: "Generates ZK circuits." },
            { name: "Trust Boundary", status: "active", description: "Sensitive data stays here." },
        ],
    },
    {
        name: "Protocol Layer",
        icon: Shield,
        color: "var(--success)",
        components: [
            { name: "Verification Engine", status: "active", description: "Decentralized validation." },
            { name: "Commitment Store", status: "active", description: "Merkle tree registry." },
            { name: "Trust Boundary", status: "active", description: "Only proofs visible." },
        ],
    },
    {
        name: "Network Layer",
        icon: Globe,
        color: "#A855F7",
        components: [
            { name: "Consensus Nodes", status: "active", description: "Global consensus." },
            { name: "State Sync", status: "active", description: "Cross-node replication." },
            { name: "Trust Boundary", status: "active", description: "Public execution trace." },
        ],
    },
];

const specs = [
    { label: "Proof Generation", value: "< 2s", description: "Average time" },
    { label: "Verification Time", value: "< 50ms", description: "On-chain" },
    { label: "Proof Size", value: "288 bytes", description: "Constant" },
    { label: "Throughput", value: "10K+ TPS", description: "Peak capacity" },
];

export default function ArchitecturePage() {
    return (
        <div className="min-h-screen pt-16">
            {/* Hero */}
            <Section className="!pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Label className="mb-4 block">Architecture</Label>
                    <h1 className="text-h1 text-[var(--text-primary)] mb-6 max-w-3xl">
                        System Architecture
                        <br />
                        <span className="text-[var(--text-secondary)]">& Technical Specifications</span>
                    </h1>
                    <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl">
                        A three-layer architecture designed for security, scalability,
                        and institutional-grade reliability.
                    </p>
                </motion.div>
            </Section>

            {/* Layer Diagram */}
            <section className="pb-24">
                <Container>
                    <div className="space-y-6">
                        {layers.map((layer, layerIndex) => (
                            <FadeIn key={layer.name} delay={layerIndex * 0.1}>
                                <Card className="overflow-hidden" hover={false}>
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Layer header */}
                                        <div
                                            className="lg:w-64 p-6 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)]"
                                            style={{ backgroundColor: `color-mix(in srgb, ${layer.color} 5%, transparent)` }}
                                        >
                                            <layer.icon className="w-8 h-8" style={{ color: layer.color }} />
                                            <div>
                                                <p className="text-label" style={{ color: layer.color }}>Layer {layerIndex + 1}</p>
                                                <h3 className="text-h3 text-[var(--text-primary)]">{layer.name}</h3>
                                            </div>
                                        </div>

                                        {/* Components */}
                                        <div className="flex-1 p-6">
                                            <div className="grid sm:grid-cols-3 gap-4">
                                                {layer.components.map((component) => (
                                                    <div
                                                        key={component.name}
                                                        className={`p-4 bg-[var(--surface-0)] rounded-lg border border-[var(--border-subtle)] ${component.name === "Trust Boundary" ? "relative overflow-hidden" : ""}`}
                                                    >
                                                        {component.name === "Trust Boundary" && (
                                                            <motion.div
                                                                className="absolute inset-0 bg-[var(--accent)]/5"
                                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                            />
                                                        )}
                                                        <div className="flex items-center gap-2 mb-2 relative z-10">
                                                            <div className={`w-2 h-2 rounded-full ${component.name === "Trust Boundary" ? "bg-[var(--accent)]" : "bg-[var(--success)]"}`} />
                                                            <span className="text-sm font-mono text-[var(--text-primary)]">
                                                                {component.name}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[var(--text-tertiary)] relative z-10">
                                                            {component.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </FadeIn>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Specs */}
            <section className="py-24 bg-[var(--surface-1)] border-y border-[var(--border-subtle)]">
                <Container>
                    <FadeIn>
                        <Label className="mb-4 block text-center">Performance</Label>
                        <h2 className="text-h2 text-[var(--text-primary)] mb-16 text-center">
                            Technical Specifications
                        </h2>
                    </FadeIn>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {specs.map((spec, index) => (
                            <FadeIn key={spec.label} delay={index * 0.1}>
                                <div className="text-center p-8 bg-[var(--surface-0)] rounded-lg border border-[var(--border-subtle)]">
                                    <p className="text-label mb-2">{spec.label}</p>
                                    <p className="text-display text-[var(--accent)] font-mono mb-2">{spec.value}</p>
                                    <p className="text-sm text-[var(--text-tertiary)]">{spec.description}</p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Security */}
            <Section>
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    <FadeIn>
                        <Label className="mb-4 block">Security Model</Label>
                        <h2 className="text-h2 text-[var(--text-primary)] mb-6">
                            Defense in Depth
                        </h2>
                        <p className="text-body-lg text-[var(--text-secondary)] mb-8">
                            Multiple layers of cryptographic protection ensure data remains
                            private even in adversarial conditions.
                        </p>

                        <div className="space-y-4">
                            {[
                                { title: "End-to-End Encryption", desc: "AES-256-GCM for data at rest and in transit" },
                                { title: "Zero-Knowledge Circuits", desc: "Groth16 proofs with trusted setup ceremony" },
                                { title: "Secure Enclaves", desc: "Optional TEE support for additional isolation" },
                                { title: "Key Management", desc: "HSM integration for institutional deployments" },
                            ].map((item, index) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    className="flex items-start gap-3 p-4 bg-[var(--surface-1)] rounded-lg border border-[var(--border-subtle)]"
                                >
                                    <CheckCircle className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-body text-[var(--text-primary)] font-medium">{item.title}</p>
                                        <p className="text-sm text-[var(--text-tertiary)]">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <Card hover={false} className="p-0 overflow-hidden">
                            <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-0)]">
                                <p className="font-mono text-sm text-[var(--text-tertiary)]">system_status.json</p>
                            </div>
                            <pre className="p-6 text-sm font-mono overflow-x-auto">
                                <code className="text-[var(--text-secondary)]">
                                    {`{
  "version": "1.0.0",
  "status": "operational",
  "uptime": "99.99%",
  "last_audit": "2025-01-15",
  "security": {
    "encryption": "AES-256-GCM",
    "proof_system": "Groth16",
    "hash_function": "Poseidon",
    "curve": "BN254"
  },
  "network": {
    "nodes": 42,
    "regions": ["us-east", "eu-west", "ap-south"],
    "latency_p99": "12ms"
  }
}`}
                                </code>
                            </pre>
                        </Card>
                    </FadeIn>
                </div>
            </Section>

            {/* CTA */}
            <section className="py-24 bg-[var(--surface-1)] border-t border-[var(--border-subtle)]">
                <Container>
                    <FadeIn className="text-center">
                        <h2 className="text-h2 text-[var(--text-primary)] mb-6">
                            Try the Prototype
                        </h2>
                        <p className="text-body-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8">
                            See the architecture in action with our interactive demo.
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
