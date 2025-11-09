import { ethers, providers } from "ethers";

// Supported Alchemy chains for EVM and non-EVM blockchains
// NOTE: Add more chains as needed
export type AlchemyChains =
    | "bitcoin-mainnet"
    | "bitcoin-testnet"
    | "eth-mainnet"
    | "eth-sepolia"
    | "solana-mainnet"
    | "solana-devnet"
    | "arb-mainnet"
    | "arb-sepolia"
    | "base-mainnet"
    | "base-sepolia"
    | "abstract-mainnet"
    | "abstract-testnet"
    | "polygon-mainnet"
    | "polygon-amoy"
    | "hyperliquid-mainnet"
    | "hyperliquid-testnet";

function getUrl(rpcType: "JSONRPC" | "WS", chain: AlchemyChains): string {
    if (!process.env.ALCHEMY_API_KEY) {
        throw new Error("ALCHEMY_API_KEY environment variable is not set.");
    }
    return {
        JSONRPC: `https://${chain}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        WS: `wss://${chain}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    }[rpcType];
}

/**
 * Creates a JsonRpcProvider connected to Alchemy for the specified chain
 * @param chain - The Alchemy chain to connect to
 * @returns A JsonRpcProvider for the specified chain
 */
export function alchemyProvider(chain: AlchemyChains): providers.JsonRpcProvider {
    return new ethers.providers.JsonRpcProvider(getUrl("JSONRPC", chain));
}

/**
 * Creates a WebSocketProvider connected to Alchemy for the specified chain
 * @param chain - The Alchemy chain to connect to
 * @returns A WebSocketProvider for the specified chain
 */
export function alchemyWebSocket(chain: AlchemyChains): providers.WebSocketProvider {
    return new ethers.providers.WebSocketProvider(getUrl("WS", chain));
}
