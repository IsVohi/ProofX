"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ContainerProps {
    children: ReactNode;
    className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
    return (
        <div className={`max-w-[1280px] mx-auto px-6 ${className}`}>
            {children}
        </div>
    );
}

interface SectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
}

export function Section({ children, className = "", id }: SectionProps) {
    return (
        <section id={id} className={`py-24 md:py-32 ${className}`}>
            <Container>{children}</Container>
        </section>
    );
}

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 0.35,
                delay,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className = "", hover = true }: CardProps) {
    return (
        <div
            className={`
        bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-lg p-8
        ${hover ? "hover:border-[var(--border-hover)] transition-colors duration-200" : ""}
        ${className}
      `}
        >
            {children}
        </div>
    );
}

interface ButtonProps {
    children: ReactNode;
    variant?: "primary" | "secondary";
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit";
}

export function Button({
    children,
    variant = "primary",
    className = "",
    onClick,
    disabled = false,
    type = "button",
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white",
        secondary: "bg-transparent border border-[var(--border-subtle)] hover:border-[var(--border-hover)] text-[var(--text-primary)]",
    };

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </motion.button>
    );
}

interface LabelProps {
    children: ReactNode;
    className?: string;
}

export function Label({ children, className = "" }: LabelProps) {
    return (
        <span className={`text-label ${className}`}>
            {children}
        </span>
    );
}
