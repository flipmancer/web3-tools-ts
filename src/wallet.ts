import crypto from "crypto";
import { ethers as ethers5 } from "ethers5";
import { ethers as ethers6 } from "ethers6";
import fs from "fs";
import path from "path";
import { AlchemyChains, alchemyProviderV5, alchemyProviderV6 } from "./providers";

/**
 * Encrypts an Ethereum private key into a keystore and optionally saves it to a file
 * @param privateKey - The Ethereum private key to encrypt
 * @param password - The password used for encryption
 * @param saveOnFile - Whether to save the keystore to a file
 * @param dir - Directory to save the keystore file
 * @returns The encrypted keystore JSON string
 */
export async function encryptEvmPrivateKey(
    privateKey: string,
    password: string,
    saveOnFile = true,
    dir = "./wallets"
): Promise<string> {
    const wallet = new ethers5.Wallet(privateKey);
    const keystore = await wallet.encrypt(password);
    const address = ethers5.utils.getAddress(wallet.address);

    if (saveOnFile) {
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(path.join(dir, `keystore-${address.toLowerCase()}.json`), keystore, "utf-8");
    }
    return keystore;
}

/**
 * Decrypts an Ethereum keystore file to retrieve the wallet
 * @param publicKey - The public address of the wallet
 * @param password - The password used to encrypt the keystore
 * @param chain - Optional Alchemy chain to connect the wallet to a provider
 * @param dir - Directory where the keystore file is located
 * @returns The decrypted EVM Private Key
 * @throws Error if the keystore file is not found or decryption fails
 */
export async function decryptEvmKeystore(
    publicKey: string,
    password: string,
    chain?: AlchemyChains,
    dir = "./wallets"
): Promise<string> {
    let file: string | undefined;
    try {
        const address = ethers5.utils.getAddress(publicKey); // throws if invalid
        file = path.join(dir, `keystore-${address.toLowerCase()}.json`);
        const keystore = await fs.promises.readFile(file, "utf-8");
        const decrypted = await ethers5.Wallet.fromEncryptedJson(keystore, password);

        return decrypted.privateKey;
    } catch (err: any) {
        if (err?.code === "ENOENT") throw new Error(`Keystore not found at ${file}`);
        throw err;
    }
}

/**
 * Creates a new random Ethereum wallet, optionally connected to a provider
 * @param chain - Optional Alchemy chain to connect the wallet to a provider
 * @returns The newly created EVM wallet
 */
export function createEvmWalletV5(chain?: AlchemyChains): ethers5.Wallet {
    const wallet = ethers5.Wallet.createRandom();
    if (!chain) return wallet;
    return wallet.connect(alchemyProviderV5(chain));
}
export function createEvmWalletV6(chain?: AlchemyChains): ethers6.HDNodeWallet {
    const wallet = ethers6.Wallet.createRandom();
    if (!chain) return wallet;
    return wallet.connect(alchemyProviderV6(chain));
}

/**
 * Converts a Wei value to Ether
 * @param weiBigNumber The Wei value to convert
 * @returns The equivalent Ether value as a string
 */
export function fromWeiToEther(weiBigNumber: BigInt): string {
    // BigInt to ethers5.BigNumberish
    const weiBigNumberish = weiBigNumber.toString();
    return ethers5.utils.formatEther(weiBigNumberish);
}

/**
 * Converts an Ether value to Wei
 * @param etherStr The Ether value as a string
 * @returns The equivalent Wei value as a BigInt
 */
export function fromEtherToWei(etherStr: string): BigInt {
    //ethers5.BigNumberish to BigInt
    const weiBigNumberish = ethers5.utils.parseEther(etherStr);
    return BigInt(weiBigNumberish.toString());
}

/**
 * Generates a new BIP-39 mnemonic seed phrase with custom entropy
 * @param {number} entropyBytes - Size of entropy in bytes (16=12 words, 32=24 words)
 * @returns {string} The mnemonic phrase
 */
export function generateEvmSeed(entropyBytes: number = 32): string {
    if (entropyBytes < 16 || entropyBytes > 32 || entropyBytes % 4 !== 0) {
        throw new Error("entropyBytes must be 16, 20, 24, 28, or 32");
    }
    const entropy = crypto.randomBytes(entropyBytes);
    return ethers5.utils.entropyToMnemonic(entropy);
}

/**
 * Derives multiple wallets from a BIP-39 mnemonic using Ethereum's BIP-44 derivation path
 * @param mnemonic - BIP-39 mnemonic phrase (12 or 24 words)
 * @param numberOfWallets - Number of wallets to derive
 * @param chain - Optional Alchemy chain to connect wallets to a provider
 * @returns Array of derived Ethereum wallets
 * @throws Error if mnemonic is invalid or numberOfWallets is not positive
 */
export function deriveEvmWalletsFromMnemonicV5(
    mnemonic: string,
    numberOfWallets: number,
    chain?: AlchemyChains
): Array<ethers5.Wallet> {
    if (!ethers5.utils.isValidMnemonic(mnemonic)) throw new Error("Invalid BIP-39 mnemonic");
    if (numberOfWallets <= 0) throw new Error("numberOfWallets must be a positive integer");

    const wallets: Array<ethers5.Wallet> = [];

    for (let i = 0; i < numberOfWallets; i++) {
        // BIP-44 derivation path for Ethereum: m/44'/60'/0'/0/{index}
        const path = `m/44'/60'/0'/0/${i}`;
        const w = ethers5.Wallet.fromMnemonic(mnemonic, path);

        // Optionally connect to provider if chain is specified
        wallets.push(chain ? w.connect(alchemyProviderV5(chain)) : w);
    }

    return wallets;
}

export function deriveEvmWalletsFromMnemonicV6(
    mnemonic: string,
    numberOfWallets: number,
    chain?: AlchemyChains
): Array<ethers6.HDNodeWallet> {
    if (!ethers6.Mnemonic.isValidMnemonic(mnemonic)) throw new Error("Invalid BIP-39 mnemonic");
    if (numberOfWallets <= 0) throw new Error("numberOfWallets must be a positive integer");
    const wallets: Array<ethers6.HDNodeWallet> = [];
    const parsedMnemonic = ethers6.Mnemonic.fromPhrase(mnemonic); // to ensure mnemonic is valid

    for (let i = 0; i < numberOfWallets; i++) {
        // BIP-44 derivation path for Ethereum: m/44'/60'/0'/0/{index}
        const path = `m/44'/60'/0'/0/${i}`;
        const w = ethers6.HDNodeWallet.fromMnemonic(parsedMnemonic, path);

        // Optionally connect to provider if chain is specified
        wallets.push(chain ? w.connect(alchemyProviderV6(chain)) : w);
    }

    return wallets;
}

/**
 * Encrypts a mnemonic using a password with AES-256-GCM
 * @param mnemonic The mnemonic phrase to encrypt
 * @param password The password used for encryption
 * @returns The encrypted mnemonic string
 */
export function encryptEvmMnemonic(mnemonic: string, password: string): string {
    // Generate random salt and IV
    const salt = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16); // 96-bit IV recommended for GCM
    const kdfParams = { N: 16384, r: 8, p: 1 };

    // Derive key with proper scrypt parameters (N=16384, r=8, p=1)
    const key = crypto.scryptSync(password, salt, 32, kdfParams);

    // Use AES-256-GCM for authenticated encryption
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(mnemonic, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    const payload = {
        v: 1,
        alg: "aes-256-gcm",
        kdf: "scrypt",
        kdfparams: { ...kdfParams, salt: salt.toString("hex") },
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
        ct: ciphertext.toString("hex"),
    };
    return JSON.stringify(payload);
}
/**
 *  Decrypts an encrypted mnemonic using the provided password
 * @param encryptedMnemonic  The encrypted mnemonic string
 * @param password  The password used for decryption
 * @returns The decrypted mnemonic string
 */
export function decryptEvmMnemonic(encryptedMnemonic: string, password: string): string {
    const data = JSON.parse(encryptedMnemonic);
    if (data.alg !== "aes-256-gcm" || data.kdf !== "scrypt") {
        throw new Error("Unsupported mnemonic envelope");
    }
    const salt = Buffer.from(data.kdfparams.salt, "hex");
    const iv = Buffer.from(data.iv, "hex");
    const tag = Buffer.from(data.tag, "hex");

    // Derive key with same parameters
    const key = crypto.scryptSync(password, salt, 32, {
        N: data.kdfparams.N,
        r: data.kdfparams.r,
        p: data.kdfparams.p,
    });

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const out = Buffer.concat([decipher.update(Buffer.from(data.ct, "hex")), decipher.final()]);
    return out.toString("utf8");
}
