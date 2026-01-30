"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ProofX Protocol - Web3 Context
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { BrowserProvider, JsonRpcSigner, Contract } from "ethers";
import { CONTRACT_ADDRESS, PROOFX_ABI, DEFAULT_NETWORK, SUPPORTED_NETWORKS } from "./config";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Web3State {
    isConnected: boolean;
    isConnecting: boolean;
    address: string | null;
    chainId: number | null;
    provider: BrowserProvider | null;
    signer: JsonRpcSigner | null;
    contract: Contract | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    switchNetwork: (chainId: number) => Promise<void>;
    isCorrectNetwork: boolean;
    error: string | null;
}

interface EthereumProvider {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

const Web3Context = createContext<Web3State | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export function Web3Provider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [contract, setContract] = useState<Contract | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isCorrectNetwork = chainId === DEFAULT_NETWORK.chainId;

    const connect = useCallback(async () => {
        if (typeof window === "undefined" || !window.ethereum) {
            setError("MetaMask not installed");
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            }) as string[];

            if (accounts.length === 0) {
                throw new Error("No accounts found");
            }

            const browserProvider = new BrowserProvider(window.ethereum);
            const userSigner = await browserProvider.getSigner();
            const network = await browserProvider.getNetwork();

            const proofxContract = CONTRACT_ADDRESS
                ? new Contract(CONTRACT_ADDRESS, PROOFX_ABI, userSigner)
                : null;

            setProvider(browserProvider);
            setSigner(userSigner);
            setContract(proofxContract);
            setAddress(accounts[0]);
            setChainId(Number(network.chainId));
            setIsConnected(true);

            console.log("🔗 Wallet connected:", accounts[0]);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to connect";
            setError(message);
            console.error("❌ Connection error:", message);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setProvider(null);
        setSigner(null);
        setContract(null);
        setAddress(null);
        setChainId(null);
        setIsConnected(false);
        setError(null);
        console.log("🔌 Wallet disconnected");
    }, []);

    const switchNetwork = useCallback(async (targetChainId: number) => {
        if (!window.ethereum) return;

        const chainIdHex = `0x${targetChainId.toString(16)}`;

        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: chainIdHex }]
            });
        } catch (err: unknown) {
            if ((err as { code: number }).code === 4902) {
                const network = Object.values(SUPPORTED_NETWORKS).find(
                    n => n.chainId === targetChainId
                );
                if (network) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId: network.chainIdHex,
                            chainName: network.name,
                            rpcUrls: [network.rpcUrl],
                            blockExplorerUrls: [network.blockExplorer],
                            nativeCurrency: network.currency
                        }]
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined" || !window.ethereum) return;

        const handleAccountsChanged = (...args: unknown[]) => {
            const accounts = args[0] as string[];
            if (accounts.length === 0) {
                disconnect();
            } else {
                setAddress(accounts[0]);
            }
        };

        const handleChainChanged = (...args: unknown[]) => {
            const chainIdHex = args[0] as string;
            setChainId(parseInt(chainIdHex, 16));
            window.location.reload();
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        window.ethereum.request({ method: "eth_accounts" })
            .then((result: unknown) => {
                const accounts = result as string[];
                if (accounts.length > 0) {
                    connect();
                }
            });

        return () => {
            window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
            window.ethereum?.removeListener("chainChanged", handleChainChanged);
        };
    }, [connect, disconnect]);

    const value: Web3State = {
        isConnected,
        isConnecting,
        address,
        chainId,
        provider,
        signer,
        contract,
        connect,
        disconnect,
        switchNetwork,
        isCorrectNetwork,
        error
    };

    return (
        <Web3Context.Provider value={value}>
            {children}
        </Web3Context.Provider>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useWeb3() {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error("useWeb3 must be used within a Web3Provider");
    }
    return context;
}
