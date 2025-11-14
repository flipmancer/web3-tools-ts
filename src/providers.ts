import { ethers as ethersV5 } from "ethers5";
import { ethers as ethersV6 } from "ethers6";

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
export function alchemyProviderV5(chain: AlchemyChains): ethersV5.providers.JsonRpcProvider {
    return new ethersV5.providers.JsonRpcProvider(getUrl("JSONRPC", chain));
}
export function alchemyProviderV6(chain: AlchemyChains): ethersV6.JsonRpcProvider {
    return new ethersV6.JsonRpcProvider(getUrl("JSONRPC", chain));
}

/**
 * Creates a WebSocketProvider connected to Alchemy for the specified chain
 * @param chain - The Alchemy chain to connect to
 * @returns A WebSocketProvider for the specified chain
 */
export function alchemyWebSocketV5(chain: AlchemyChains): ethersV5.providers.WebSocketProvider {
    return new ethersV5.providers.WebSocketProvider(getUrl("WS", chain));
}
export function alchemyWebSocketV6(chain: AlchemyChains): ethersV6.WebSocketProvider {
    return new ethersV6.WebSocketProvider(getUrl("WS", chain));
}
