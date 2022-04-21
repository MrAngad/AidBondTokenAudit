const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers")

const name       = "AidBond";
const symbol     = "ABND";
const totalSupply  = 210000000; // Two Hundred and ten million
const decimals   = 18;

describe("Test Token", function () {
  let AidBondToken, token, owner, addr1, addr2, addr3;

  beforeEach(async () => {
    AidBondToken = await hre.ethers.getContractFactory("AidBondToken");
    token = await AidBondToken.deploy("AidBond", "ABND", 210000000, 18);
    await token.deployed();
    [owner, addr1, addr2, addr3, _] = await ethers.getSigners();
  });

  describe('Test Token Basic Settings on deployment', () => {
    it('Should set the right name', async() => {
        expect(await token.name()).to.equal(name);
    });

    it('Should set the right symbol', async() => {
        expect(await token.symbol()).to.equal(symbol);
    });

    it('Should set the right decimals', async() => {
      expect(await token.decimals()).to.equal(decimals);
    });

    it('Should set the right owner', async() => {
      expect(await token.owner()).to.equal(owner.address);
    });

    it('Should set the right total supply', async() => {
      const supply = await token.totalSupply();
      //console.log(supply);
      expect(supply).to.equal(BigNumber.from("210000000000000000000000000"));
    });

    it('Should assign the total supply of tokens to the owner', async() => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe('Test Token Standard features', () => {
    it('Total Supply works', async() => {
      expect(await token.totalSupply()).to.equal(BigNumber.from("210000000000000000000000000"));
    });

    it('Balance Of works', async() => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it('Transfer works', async() => {
      const ownerOriginalBalance = await token.balanceOf(owner.address);
      await token.transfer(addr1.address, 20);
      const addr1Balance = await token.balanceOf(addr1.address);
      const ownerNewBalance = await token.balanceOf(owner.address);
      expect(addr1Balance).to.equal(20);
      expect(BigNumber.from(ownerOriginalBalance).sub(BigNumber.from(ownerNewBalance))).to.equal(20);
    });

    it('Approve works', async() => {
      await token.transfer(addr1.address, 20);
      await token.connect(addr1).approve(owner.address, 20);
      const addr2Approval = await token.allowance(addr1.address, owner.address);
      //const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Approval).to.equal(20);
    });

    it('Increase allowance works', async() => {
        await token.connect(addr1).approve(owner.address, 20);
        await token.allowance(addr1.address, owner.address);
        await token.connect(addr1).increaseAllowance(owner.address, 20);
        expect(await token.allowance(addr1.address, owner.address)).to.equal(40);
    });

    it('Decrease allowance works', async() => {
        await token.connect(addr1).approve(owner.address, 20);
        await token.allowance(addr1.address, owner.address);
        await token.connect(addr1).decreaseAllowance(owner.address, 20);
        expect(await token.allowance(addr1.address, owner.address)).to.equal(0);
    });

    it('Transfer From works', async() => {
      await token.transfer(addr1.address, 20);
      await token.connect(addr1).approve(owner.address, 20);
      await token.transferFrom(addr1.address, addr2.address, 20);
      const addr2Balance = await token.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(20);
    });
  });

  describe('Test Pausing', () => {

    it('Should pause', async() => {
        await token.pause();
        expect(await token.paused()).to.equal(true);
    });

    it('Should unpause', async() => {
        await token.pause();
        await token.unpause();
        expect(await token.paused()).to.equal(false);
    });

    it('Only the owner can pause and unpause the contract', async() => {
      await expect(token.connect(addr1).pause()).to.be.revertedWith('ERC20PresetMinterPauser: must have pauser role to pause');
      await expect(token.connect(addr1).unpause()).to.be.revertedWith('ERC20PresetMinterPauser: must have pauser role to unpause');
    });

    it('Transfer From should not work when the contract is paused', async() => {
      token.transfer(addr1.address, 20)
      await token.connect(addr1).approve(owner.address, 20);
      await token.pause();
      expect(await token.paused()).to.equal(true);
      await expect(token.transferFrom(addr1.address, addr2.address, 20)).to.be.revertedWith('ERC20Pausable: token transfer while paused');
    });

    it('Transfer should not work when the contract is paused', async() => {
      await token.pause();
      expect(await token.paused()).to.equal(true);
      await expect(token.transfer(addr1.address, 20)).to.be.revertedWith('ERC20Pausable: token transfer while paused');
    });
  });

  describe('Test Burning', () => {
    it('Burn works', async() => {
        const origSupply = (totalSupply * 10**18);
        const ownerOriginalBalance = await token.balanceOf(owner.address);
        
        await token.burn(20);

        const ownerNewBalance = await token.balanceOf(owner.address);

        expect(ownerOriginalBalance.sub(ownerNewBalance)).to.equal(BigInt(20));
        expect(await token.totalSupply()).to.equal(BigNumber.from("210000000000000000000000000").sub(BigInt(20)));
    });

    it('Burn From works', async() => {
      const origSupply = (totalSupply * 10**18);

      token.transfer(addr1.address, 20)
      await token.connect(addr1).approve(addr2.address, 20);

      const addr1OriginalBalance = await token.balanceOf(addr1.address);
      
      await token.connect(addr2).burnFrom(addr1.address, 20);

      const addr1NewBalance = await token.balanceOf(addr1.address);

      expect(addr1OriginalBalance.sub(addr1NewBalance)).to.equal(BigInt(20));
      expect(await token.totalSupply()).to.equal(BigNumber.from("210000000000000000000000000").sub(BigInt(20)));
    });

    it('Only the owner can burn tokens', async() => {
      await token.transfer(addr1.address, 20);
      await expect(token.connect(addr1).burn(20)).to.be.revertedWith();
    });
  });  

  describe('Test Ownership', () => {
    it('Owner function works', async() => {
        expect(await token.owner()).to.equal(owner.address);
    });

    it('Transfer ownership works', async() => {
      await token.transferOwnership(addr1.address);
      expect(await token.owner()).to.equal(addr1.address);
    });

    it('Renounce ownership works', async() => {
      await token.renounceOwnership();
      expect(await token.owner()).to.equal(BigNumber.from("0x00000000000000000000000000000000000"));
    });
  });  

});
