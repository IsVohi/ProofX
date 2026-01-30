import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import ClientProviders from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProofX Protocol — Verify Compliance Without Sharing Data",
  description:
    "ProofX Protocol enables institutions to prove regulatory compliance and trustworthiness using cryptographic proofs — without exposing sensitive data.",
  keywords: ["compliance", "cryptographic proofs", "privacy", "verification", "protocol"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
          <Navigation />
          <main>{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}

