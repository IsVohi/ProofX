"use client";

import { Web3Provider } from "@/lib/web3-context";

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
}) {
    return <Web3Provider>{children}</Web3Provider>;
}
