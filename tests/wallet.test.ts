import { expect } from "chai";

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

describe("Wallet Module Tests", function () {
    // Cleanup test directory before and after tests
    before(function () {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    after(function () {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    describe("createEvmWallet", function () {
        it("should create a valid Ethereum wallet", function () {
            const wallet = createEvmWallet();
            expect(wallet).to.be.instanceOf(ethers.Wallet);
            expect(wallet.address).to.match(/^0x[a-fA-F0-9]{40}$/);
            expect(wallet.privateKey).to.match(/^0x[a-fA-F0-9]{64}$/);
        });

        it("should create wallet with provider", function () {
            const wallet = createEvmWallet("eth-mainnet");
            expect(wallet.provider).to.exist;
        });
    });

    describe("encryptEvmPrivateKey and decryptEvmKeystore", function () {
        it("should encrypt and decrypt private key", async function () {
            const wallet = ethers.Wallet.createRandom();
            const privateKey = wallet.privateKey;
            const publicKey = wallet.address;

            // Encrypt
            const keystore = await encryptEvmPrivateKey(privateKey, TEST_PASSWORD, true, TEST_DIR);
            expect(keystore).to.exist;
            expect(typeof keystore).to.equal("string");

            // Check file was created
            const keystorePath = path.join(TEST_DIR, `keystore-${publicKey.toLowerCase()}.json`);
            expect(fs.existsSync(keystorePath)).to.be.true;

            // Decrypt
            const decryptedWallet = await decryptEvmKeystore(publicKey, TEST_PASSWORD, undefined, TEST_DIR);
            expect(decryptedWallet.address).to.equal(publicKey);
            expect(decryptedWallet.privateKey).to.equal(privateKey);
        });

        it("should encrypt without saving to file", async function () {
            const wallet = ethers.Wallet.createRandom();
            const keystore = await encryptEvmPrivateKey(wallet.privateKey, TEST_PASSWORD, false);
            expect(keystore).to.exist;
            expect(typeof keystore).to.equal("string");
        });
    });

    describe("generateEvmSeed", function () {
        it("should generate 24-word mnemonic by default", function () {
            const mnemonic = generateEvmSeed();
            const words = mnemonic.split(" ");
            expect(words).to.have.lengthOf(24);
            expect(ethers.utils.isValidMnemonic(mnemonic)).to.be.true;
        });

        it("should generate 12-word mnemonic with 16 bytes entropy", function () {
            const mnemonic = generateEvmSeed(16);
            const words = mnemonic.split(" ");
            expect(words).to.have.lengthOf(12);
            expect(ethers.utils.isValidMnemonic(mnemonic)).to.be.true;
        });
    });

    describe("deriveEvmWalletsFromMnemonic", function () {
        it("should derive multiple wallets from mnemonic", function () {
            const mnemonic = generateEvmSeed();
            const numberOfWallets = 5;

            const wallets = deriveEvmWalletsFromMnemonic(mnemonic, numberOfWallets);

            expect(wallets).to.have.lengthOf(numberOfWallets);
            wallets.forEach((wallet) => {
                expect(wallet).to.be.instanceOf(ethers.Wallet);
                expect(wallet.address).to.match(/^0x[a-fA-F0-9]{40}$/);
            });

            // Ensure all wallets are unique
            const addresses = wallets.map((w) => w.address);
            const uniqueAddresses = new Set(addresses);
            expect(uniqueAddresses.size).to.equal(numberOfWallets);
        });

        it("should derive wallets deterministically", function () {
            const mnemonic = generateEvmSeed();

            const wallets1 = deriveEvmWalletsFromMnemonic(mnemonic, 3);
            const wallets2 = deriveEvmWalletsFromMnemonic(mnemonic, 3);

            // Same mnemonic should produce same wallets
            expect(wallets1[0].address).to.equal(wallets2[0].address);
            expect(wallets1[1].address).to.equal(wallets2[1].address);
            expect(wallets1[2].address).to.equal(wallets2[2].address);
        });

        it("should throw error for invalid number of wallets", function () {
            const mnemonic = generateEvmSeed();
            expect(() => deriveEvmWalletsFromMnemonic(mnemonic, 0)).to.throw(
                "numberOfWallets must be a positive integer"
            );
            expect(() => deriveEvmWalletsFromMnemonic(mnemonic, -5)).to.throw(
                "numberOfWallets must be a positive integer"
            );
        });
    });

    describe("encryptEvmMnemonic and decryptEvmMnemonic", function () {
        it("should encrypt and decrypt mnemonic", function () {
            const mnemonic = generateEvmSeed();

            // Encrypt
            const encrypted = encryptEvmMnemonic(mnemonic, TEST_PASSWORD);
            expect(encrypted).to.exist;
            expect(typeof encrypted).to.equal("string");

            // Decrypt
            const decrypted = decryptEvmMnemonic(encrypted, TEST_PASSWORD);
            expect(decrypted).to.equal(mnemonic);
        });

        it("should fail decryption with wrong password", function () {
            const mnemonic = generateEvmSeed();
            const encrypted = encryptEvmMnemonic(mnemonic, TEST_PASSWORD);

            expect(() => decryptEvmMnemonic(encrypted, "wrong-password")).to.throw();
        });

        it("should produce different encrypted output for same mnemonic", function () {
            const mnemonic = generateEvmSeed();

            const encrypted1 = encryptEvmMnemonic(mnemonic, TEST_PASSWORD);
            const encrypted2 = encryptEvmMnemonic(mnemonic, TEST_PASSWORD);

            // Due to random salt and IV, encrypted strings should differ
            expect(encrypted1).to.not.equal(encrypted2);

            // But both should decrypt to the same mnemonic
            expect(decryptEvmMnemonic(encrypted1, TEST_PASSWORD)).to.equal(mnemonic);
            expect(decryptEvmMnemonic(encrypted2, TEST_PASSWORD)).to.equal(mnemonic);
        });
    });

    describe("fromWeiToEther and fromEtherToWei", function () {
        it("should convert Wei to Ether", function () {
            const wei = "1000000000000000000"; // 1 ETH in Wei
            const ether = fromWeiToEther(wei);
            expect(ether).to.equal("1.0");
        });

        it("should convert Ether to Wei", function () {
            const ether = "1.5";
            const wei = fromEtherToWei(ether);
            expect(wei.toString()).to.equal("1500000000000000000");
        });

        it("should handle BigNumber conversion", function () {
            const wei = ethers.BigNumber.from("2500000000000000000");
            const ether = fromWeiToEther(wei);
            expect(ether).to.equal("2.5");
        });

        it("should round-trip conversion", function () {
            const original = "3.75";
            const wei = fromEtherToWei(original);
            const ether = fromWeiToEther(wei);
            expect(ether).to.equal(original);
        });
    });
});
