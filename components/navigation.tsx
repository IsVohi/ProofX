"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const navItems = [
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/architecture", label: "Architecture" },
    { href: "/prototype", label: "Prototype" },
    { href: "/impact", label: "Impact" },
];

export function Navigation() {
    const pathname = usePathname();

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--surface-0)]/80 border-b border-[var(--border-subtle)]"
        >
            <nav className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <Shield className="w-6 h-6 text-[var(--accent)]" />
                    <span className="text-h3 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-200">
                        ProofX
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${isActive
                                        ? "text-[var(--text-primary)]"
                                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    }`}
                            >
                                {item.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="absolute bottom-0 left-4 right-4 h-px bg-[var(--accent)]"
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <Link
                    href="/prototype"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                    Try Demo
                </Link>
            </nav>
        </motion.header>
    );
}
