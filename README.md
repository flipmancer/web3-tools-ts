# web3-tools-ts

> A lightweight, type-safe TypeScript library for common Web3 operations. Built for developers who need reliable wallet management, provider utilities, and cryptographic operations across EVM chains.


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ⚠️ Alpha Release Warning

**Current version:** `0.1.0-alpha.1`

This package is in **active development** and **not production-ready**. APIs may change without notice. Use at your own risk.

## Ethers v5 vs v6

This library supports both ethers v5 and v6. Use the appropriate functions for your version

## 🚀 Features

### Current Tools

- **🔑 Wallet Management**
  - Create random EVM wallets
  - BIP-39 mnemonic generation (12/24 words)
  - HD wallet derivation (BIP-32/BIP-44)
  - Keystore encryption/decryption (AES-GCM + scrypt)
  - Mnemonic encryption with secure defaults
  - Wei/Ether conversion utilities

- **🌐 Provider Utilities**
  - Alchemy provider integration (HTTP & WebSocket)
  - Support for 15+ chains (Ethereum, Polygon, Arbitrum, Base, Solana, Bitcoin, etc.)
  - Type-safe chain selection

### Coming Soon

- Smart contract interaction helpers
- Multi-chain transaction builders
- NFT utilities (metadata, IPFS, marketplaces)
- Token utilities (ERC20, ERC721, ERC1155)
- Gas estimation & optimization tools
- Signature verification utilities
- ENS resolution helpers

---

## 📦 Installation

```bash
npm install git+https://github.com/flipmancer/web3-tools-ts.git
```

**Requirements:**

- Node.js >= 20.0.0
- ethers v5.8.0 (included as dependency)

---

## 🔧 Setup

Create a `.env` file in your project root:

```env
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

Get your free API key from [Alchemy](https://www.alchemy.com/).

---

## 📖 Usage

### Wallet Operations

```typescript
import { wallet } from "web3-tools-ts";

// Create a random wallet
const newWallet = wallet.createEvmWallet("eth-mainnet");
console.log("Address:", newWallet.address);
console.log("Private Key:", newWallet.privateKey);

// Generate a mnemonic (seed phrase)
const mnemonic = wallet.generateEvmSeed(); // 24 words by default
const mnemonic12 = wallet.generateEvmSeed(16); // 12 words

// Derive multiple wallets from mnemonic
const wallets = wallet.deriveEvmWalletsFromMnemonic(mnemonic, 5, "eth-mainnet");
wallets.forEach((w, i) => console.log(`Wallet ${i}:`, w.address));

// Encrypt private key to keystore file
const keystore = await wallet.encryptEvmPrivateKey(
  newWallet.privateKey,
  "strong-password",
  true, // save to file
  "./wallets" // directory
);

// Decrypt keystore file
const decryptedWallet = await wallet.decryptEvmKeystore(
  newWallet.address,
  "strong-password",
  "eth-mainnet",
  "./wallets"
);

// Encrypt mnemonic (returns JSON string)
const encryptedMnemonic = wallet.encryptEvmMnemonic(mnemonic, "strong-password");

// Decrypt mnemonic
const decryptedMnemonic = wallet.decryptEvmMnemonic(encryptedMnemonic, "strong-password");

// Wei/Ether conversion
const wei = wallet.fromEtherToWei("1.5"); // 1500000000000000000n
const ether = wallet.fromWeiToEther(wei); // "1.5"
```

### Provider Utilities

```typescript
import { providers } from "web3-tools-ts";

// Create JSON-RPC provider
const provider = providers.alchemyProvider("eth-mainnet");
const balance = await provider.getBalance("0x...");

// Create WebSocket provider (for real-time events)
const wsProvider = providers.alchemyWebSocket("eth-mainnet");
wsProvider.on("block", (blockNumber) => {
  console.log("New block:", blockNumber);
});
```

### Supported Chains

```typescript
type AlchemyChains =
  | "bitcoin-mainnet" | "bitcoin-testnet"
  | "eth-mainnet" | "eth-sepolia"
  | "solana-mainnet" | "solana-devnet"
  | "arb-mainnet" | "arb-sepolia"
  | "base-mainnet" | "base-sepolia"
  | "abstract-mainnet" | "abstract-testnet"
  | "polygon-mainnet" | "polygon-amoy"
  | "hyperliquid-mainnet" | "hyperliquid-testnet";
```

---

## 🧪 Testing

```bash
npm test
```

Tests cover:

- Wallet creation & derivation
- Keystore encryption/decryption
- Mnemonic generation & encryption
- Wei/Ether conversion
- Error handling

---

## 📚 API Reference

### `wallet` Module

| Function | Description | Returns |
|----------|-------------|---------|
| `createEvmWallet(chain?)` | Create random wallet, optionally connected to provider | `ethers.Wallet` |
| `generateEvmSeed(entropyBytes?)` | Generate BIP-39 mnemonic (default 32 bytes = 24 words) | `string` |
| `deriveEvmWalletsFromMnemonic(mnemonic, count, chain?)` | Derive HD wallets from mnemonic using BIP-44 path | `ethers.Wallet[]` |
| `encryptEvmPrivateKey(privateKey, password, saveOnFile?, dir?)` | Encrypt private key to keystore (JSON) | `Promise<string>` |
| `decryptEvmKeystore(publicKey, password, chain?, dir?)` | Decrypt keystore file to wallet | `Promise<ethers.Wallet>` |
| `encryptEvmMnemonic(mnemonic, password)` | Encrypt mnemonic with AES-256-GCM | `string` |
| `decryptEvmMnemonic(encryptedMnemonic, password)` | Decrypt encrypted mnemonic | `string` |
| `fromWeiToEther(wei)` | Convert Wei to Ether string | `string` |
| `fromEtherToWei(ether)` | Convert Ether string to Wei | `BigNumber` |

### `providers` Module

| Function | Description | Returns |
|----------|-------------|---------|
| `alchemyProvider(chain)` | Create JSON-RPC provider for chain | `JsonRpcProvider` |
| `alchemyWebSocket(chain)` | Create WebSocket provider for chain | `WebSocketProvider` |

---

## 🗺️ Roadmap

- [ ] Contract interaction helpers (read/write)
- [ ] Multi-chain transaction builders
- [ ] NFT utilities (metadata, IPFS, OpenSea API)
- [ ] Token utilities (balances, approvals, transfers)
- [ ] Gas estimation & optimization
- [ ] Signature utilities (EIP-712, permit)
- [ ] ENS/reverse resolution
- [ ] Batch RPC calls
- [ ] Retry logic & fallback providers
- [ ] Bitcoin & Solana wallet support

## Roadmap to v1.0.0

- [ ] Comprehensive test coverage
- [ ] Security audit
- [ ] API stability guarantee
- [ ] Documentation completion

---

## 🤝 Contributing

Contributions welcome! This is an evolving package—new tools and chain support will be added over time.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-tool`)
3. Commit your changes (`git commit -m 'Add amazing tool'`)
4. Push to the branch (`git push origin feature/amazing-tool`)
5. Open a Pull Request

---

## 📄 License

MIT © NoobishDev

---

## 🔗 Links

- [GitHub Repository](https://github.com/flipmancer/web3-tools-ts)
- [Issues & Bugs](https://github.com/flipmancer/web3-tools-ts/issues)

---

Built with ❤️ for the Web3 community
