"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Zap, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Section, FadeIn, Card, Button, Label, Container } from "@/components/ui";

const features = [
  {
    icon: Shield,
    title: "Cryptographic Proofs",
    description: "Generate verifiable proofs of compliance without revealing the underlying data. Built on zero-knowledge cryptography.",
  },
  {
    icon: Lock,
    title: "Data Sovereignty",
    description: "Your sensitive data never leaves your infrastructure. Verify without exposing. Control without compromise.",
  },
  {
    icon: Eye,
    title: "Transparent Verification",
    description: "Third parties can verify your compliance status instantly. No intermediaries. No trust assumptions.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Reduce compliance verification from weeks to seconds. Automated, deterministic, always-available.",
  },
];

const useCases = [
  "Banking",
  "Tax Compliance",
  "KYC/AML",
  "Credit Scoring",
  "Identity Verification",
];

export default function HomePage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-[var(--surface-0)] via-[var(--surface-0)] to-[var(--surface-1)]"
          initial={{ backgroundPosition: "0% 0%" }}
          animate={{ backgroundPosition: "0% 100%" }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          style={{ backgroundSize: "100% 200%" }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--text-tertiary) 1px, transparent 1px), linear-gradient(90deg, var(--text-tertiary) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <Container className="relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Label className="mb-6 block">The Trust Layer</Label>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-display text-[var(--text-primary)] mb-8"
            >
              Verify Compliance
              <br />
              <span className="text-[var(--text-secondary)]">Without Sharing Data</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-body-lg text-[var(--text-secondary)] max-w-2xl mb-10"
            >
              ProofX Protocol enables institutions to prove regulatory compliance
              and trustworthiness using cryptographic proofs — without exposing
              sensitive data.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-body text-[var(--text-primary)] font-medium mb-8">
                Zero data egress. 100% cryptographic certainty.
              </p>

              <div className="flex flex-wrap gap-4 mb-4">
                <Link href="/prototype">
                  <Button>
                    Try the Demo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="secondary">
                    Learn How It Works
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-[var(--text-tertiary)] opacity-80">
                No credit card required • Instant sandbox access
              </p>
            </motion.div>

            {/* Terminal Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-16 max-w-xl"
            >
              <Card className="font-mono text-sm" hover={false}>
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="w-3 h-3 rounded-full bg-[var(--error)]" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                  <span className="ml-2 text-[var(--text-tertiary)]">proofx-cli</span>
                </div>
                <div className="space-y-2">
                  <p className="text-[var(--text-tertiary)]">$ proofx verify --institution acme</p>
                  <p className="text-[var(--text-secondary)]">Generating zero-knowledge proof...</p>
                  <div className="flex items-center gap-2 text-[var(--success)]">
                    <CheckCircle className="w-4 h-4" />
                    <span>Verification PASSED</span>
                  </div>
                  <p className="text-[var(--text-tertiary)]">
                    Proof ID: 0x7f3a...8c2d
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Use Cases */}
      <section className="py-16 border-y border-[var(--border-subtle)]">
        <Container>
          <FadeIn>
            <p className="text-center text-label mb-8">Supported Verification Types</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {useCases.map((useCase) => (
                <span key={useCase} className="text-lg font-medium text-[var(--text-secondary)] px-4 py-2 bg-[var(--surface-1)] rounded-full">
                  {useCase}
                </span>
              ))}
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Features */}
      <Section>
        <FadeIn>
          <Label className="mb-4 block">Capabilities</Label>
          <h2 className="text-h1 text-[var(--text-primary)] mb-6">
            Built for Enterprise
          </h2>
          <p className="text-body-lg text-[var(--text-secondary)] max-w-2xl mb-16">
            ProofX provides the cryptographic infrastructure for privacy-preserving
            compliance verification at institutional scale.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 0.1}>
              <Card className="h-full">
                <feature.icon className="w-10 h-10 text-[var(--accent)] mb-6" />
                <h3 className="text-h3 text-[var(--text-primary)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-body text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <section className="py-32 bg-[var(--surface-1)]">
        <Container>
          <FadeIn className="text-center">
            <h2 className="text-h1 text-[var(--text-primary)] mb-6">
              Ready to See It in Action?
            </h2>
            <p className="text-body-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10">
              Experience the future of compliance verification with our
              interactive prototype.
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

      {/* Footer */}
      <footer className="py-16 border-t border-[var(--border-subtle)]">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--accent)]" />
              <span className="text-h3 text-[var(--text-primary)]">ProofX</span>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">
              © 2026 ProofX Protocol. Built for ETHGlobal.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
