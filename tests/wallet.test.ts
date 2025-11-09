import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import {
    createEvmWallet,
    decryptEvmKeystore,
    decryptEvmMnemonic,
    deriveEvmWalletsFromMnemonic,
    encryptEvmMnemonic,
    encryptEvmPrivateKey,
    fromEtherToWei,
    fromWeiToEther,
    generateEvmSeed,
} from "../src/wallet";

// Test directory for keystores
const TEST_DIR = "./test-wallets";
const TEST_PASSWORD = "test-password-123";

describe("Wallet Module Tests", () => {
    // Cleanup test directory before and after tests
    beforeAll(() => {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    afterAll(() => {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    describe("createEvmWallet", () => {
        test("should create a valid Ethereum wallet", () => {
            const wallet = createEvmWallet();
            expect(wallet).toBeInstanceOf(ethers.Wallet);
            expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
            expect(wallet.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
        });

        test("should create wallet with provider", () => {
            const wallet = createEvmWallet("eth-mainnet");
            expect(wallet.provider).toBeDefined();
        });
    });

    describe("encryptEvmPrivateKey and decryptEvmKeystore", () => {
        test("should encrypt and decrypt private key", async () => {
            const wallet = ethers.Wallet.createRandom();
            const privateKey = wallet.privateKey;
            const publicKey = wallet.address;

            // Encrypt
            const keystore = await encryptEvmPrivateKey(privateKey, TEST_PASSWORD, true, TEST_DIR);
            expect(keystore).toBeDefined();
            expect(typeof keystore).toBe("string");

            // Check file was created
            const keystorePath = path.join(TEST_DIR, `keystore-${publicKey.toLowerCase()}.json`);
            expect(fs.existsSync(keystorePath)).toBe(true);

            // Decrypt
            const decryptedWallet = await decryptEvmKeystore(publicKey, TEST_PASSWORD, undefined, TEST_DIR);
            expect(decryptedWallet.address).toBe(publicKey);
            expect(decryptedWallet.privateKey).toBe(privateKey);
        });

        test("should encrypt without saving to file", async () => {
            const wallet = ethers.Wallet.createRandom();
            const keystore = await encryptEvmPrivateKey(wallet.privateKey, TEST_PASSWORD, false);
            expect(keystore).toBeDefined();
            expect(typeof keystore).toBe("string");
        });
    });

    describe("generateEvmSeed", () => {
        test("should generate 24-word mnemonic by default", () => {
            const mnemonic = generateEvmSeed();
            const words = mnemonic.split(" ");
            expect(words).toHaveLength(24);
            expect(ethers.utils.isValidMnemonic(mnemonic)).toBe(true);
        });

        test("should generate 12-word mnemonic with 16 bytes entropy", () => {
            const mnemonic = generateEvmSeed(16);
            const words = mnemonic.split(" ");
            expect(words).toHaveLength(12);
            expect(ethers.utils.isValidMnemonic(mnemonic)).toBe(true);
        });
    });

    describe("deriveEvmWalletsFromMnemonic", () => {
        test("should derive multiple wallets from mnemonic", () => {
            const mnemonic = generateEvmSeed();
            const numberOfWallets = 5;

            const wallets = deriveEvmWalletsFromMnemonic(mnemonic, numberOfWallets);

            expect(wallets).toHaveLength(numberOfWallets);
            wallets.forEach((wallet) => {
                expect(wallet).toBeInstanceOf(ethers.Wallet);
                expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
            });

            // Ensure all wallets are unique
            const addresses = wallets.map((w) => w.address);
            const uniqueAddresses = new Set(addresses);
            expect(uniqueAddresses.size).toBe(numberOfWallets);
        });

        test("should derive wallets deterministically", () => {
            const mnemonic = generateEvmSeed();

            const wallets1 = deriveEvmWalletsFromMnemonic(mnemonic, 3);
            const wallets2 = deriveEvmWalletsFromMnemonic(mnemonic, 3);

            // Same mnemonic should produce same wallets
            expect(wallets1[0].address).toBe(wallets2[0].address);
            expect(wallets1[1].address).toBe(wallets2[1].address);
            expect(wallets1[2].address).toBe(wallets2[2].address);
        });

        test("should throw error for invalid number of wallets", () => {
            const mnemonic = generateEvmSeed();
            expect(() => deriveEvmWalletsFromMnemonic(mnemonic, 0)).toThrow(
                "numberOfWallets must be a positive integer"
            );
            expect(() => deriveEvmWalletsFromMnemonic(mnemonic, -5)).toThrow(
                "numberOfWallets must be a positive integer"
            );
        });
    });

    describe("encryptEvmMnemonic and decryptEvmMnemonic", () => {
        test("should encrypt and decrypt mnemonic", () => {
            const mnemonic = generateEvmSeed();

            // Encrypt
            const encrypted = encryptEvmMnemonic(mnemonic, TEST_PASSWORD);
            expect(encrypted).toBeDefined();
            expect(typeof encrypted).toBe("string");

            // Decrypt
            const decrypted = decryptEvmMnemonic(encrypted, TEST_PASSWORD);
            expect(decrypted).toBe(mnemonic);
        });

        test("should fail decryption with wrong password", () => {
            const mnemonic = generateEvmSeed();
            const encrypted = encryptEvmMnemonic(mnemonic, TEST_PASSWORD);

            expect(() => decryptEvmMnemonic(encrypted, "wrong-password")).toThrow();
        });

        test("should produce different encrypted output for same mnemonic", () => {
            const mnemonic = generateEvmSeed();

            const encrypted1 = encryptEvmMnemonic(mnemonic, TEST_PASSWORD);
            const encrypted2 = encryptEvmMnemonic(mnemonic, TEST_PASSWORD);

            // Due to random salt and IV, encrypted strings should differ
            expect(encrypted1).not.toBe(encrypted2);

            // But both should decrypt to the same mnemonic
            expect(decryptEvmMnemonic(encrypted1, TEST_PASSWORD)).toBe(mnemonic);
            expect(decryptEvmMnemonic(encrypted2, TEST_PASSWORD)).toBe(mnemonic);
        });
    });

    describe("fromWeiToEther and fromEtherToWei", () => {
        test("should convert Wei to Ether", () => {
            const wei = "1000000000000000000"; // 1 ETH in Wei
            const ether = fromWeiToEther(wei);
            expect(ether).toBe("1.0");
        });

        test("should convert Ether to Wei", () => {
            const ether = "1.5";
            const wei = fromEtherToWei(ether);
            expect(wei.toString()).toBe("1500000000000000000");
        });

        test("should handle BigNumber conversion", () => {
            const wei = ethers.BigNumber.from("2500000000000000000");
            const ether = fromWeiToEther(wei);
            expect(ether).toBe("2.5");
        });

        test("should round-trip conversion", () => {
            const original = "3.75";
            const wei = fromEtherToWei(original);
            const ether = fromWeiToEther(wei);
            expect(ether).toBe(original);
        });
    });
});
