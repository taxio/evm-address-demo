import { expect } from "chai";
import { ethers } from "hardhat";

describe("CalculateAddress", function () {
  it("from private key", async function () {
    const eoaWallet = new ethers.Wallet(ethers.utils.id("eoa test"));

    // remove prefix of compress format
    const publicKey = ethers.utils.hexDataSlice(eoaWallet.publicKey, 1);

    const caluclatedAddress = ethers.utils.hexDataSlice(ethers.utils.keccak256(publicKey), 12);

    expect((await eoaWallet.getAddress()).toLowerCase()).to.be.equal(caluclatedAddress);
  });

  describe("create", function () {
    it("by EOA", async function () {
      const [signer] = await ethers.getSigners();

      const Echo = await ethers.getContractFactory("Echo");
      const echo = await Echo.deploy();

      const receipt = await echo.deployTransaction.wait();
      const tx = await ethers.provider.getTransaction(receipt.transactionHash);

      expect(tx.from).to.be.equal(signer.address);
    
      const hexNonce = tx.nonce === 0 ? "0x" : ethers.utils.hexlify(tx.nonce);
      const computedAddress = ethers.utils.hexDataSlice(
        ethers.utils.keccak256(ethers.utils.RLP.encode([tx.from.toLocaleLowerCase(), hexNonce])),
        12
      )
      expect(echo.address.toLocaleLowerCase()).to.be.equal(computedAddress);
    });

    it("by Contract");
  });

  it("create2", async function () {
    const Echo = await ethers.getContractFactory("Echo");
    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.deploy();

    const salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("salt"));
    await factory.deploy(salt);

    // if constructor has arguments, use ethers.utils.solidityPack to pack arguments
    const initCodeHash = ethers.utils.keccak256(Echo.bytecode);

    const computedAddressByFactory = await factory.getAddress(salt);
    await Factory.attach(computedAddressByFactory).deployed();

    const computedAddressByEthers = ethers.utils.getCreate2Address(
      factory.address, salt, initCodeHash
    );

    expect(computedAddressByEthers).to.be.equal(computedAddressByFactory);

    const computedAddress = ethers.utils.hexDataSlice(
      ethers.utils.keccak256(ethers.utils.concat([
        "0xff",
        factory.address,
        salt,
        initCodeHash
      ])),
      12
    );
    expect(computedAddress).to.be.equal(computedAddressByFactory.toLocaleLowerCase());
  });
});
