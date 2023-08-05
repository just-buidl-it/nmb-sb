import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Graffiti", function () {
  async function deployGraffitiFixture() {
    const [deployer, otherAccount] = await ethers.getSigners();
    const Graffiti = await ethers.getContractFactory("Graffiti");
    const graffiti = await Graffiti.deploy();
    const mockMetadataUrl = 'ifps://mockmetadata/url/0';
    await graffiti.paint(otherAccount, mockMetadataUrl);
    return { graffiti, deployer, otherAccount };
  }

  describe("Minting", function () {
    it("Should mint with correct metadata", async function () {
      const { graffiti, otherAccount } = await loadFixture(deployGraffitiFixture);
      const mockMetadataUrl = 'ifps://mockmetadata/url/1';
      await graffiti.paint(otherAccount, mockMetadataUrl);
      expect(await graffiti.ownerOf(1)).to.equal(otherAccount.address);
      const dataURI = await graffiti.tokenURI(1);
      expect(dataURI).to.equal(mockMetadataUrl);
    });

    it("Should only mint 23 tokens", async function () {
      const { graffiti, otherAccount } = await loadFixture(deployGraffitiFixture);
      let index = 0;
      // Looping to mint 22 because the first is minted in the fixture
      while (index < 22) {
        const mockMetadataUrl = `ifps://mockmetadata/url/${index}`;
        await graffiti.paint(otherAccount, mockMetadataUrl);
        await graffiti.tokenURI(index);
        index += 1;
      }
      await expect(graffiti.paint(otherAccount, 'metadataurl')).to.rejectedWith('Ran out of paint');
    });
  });

  describe("Cannot be transferred", function () {
    it("Should throw error when transferred", async function () {
      const { graffiti, otherAccount, deployer } = await loadFixture(deployGraffitiFixture);

      await expect(graffiti.connect(otherAccount)["safeTransferFrom(address,address,uint256)"](otherAccount.address, deployer.address, 0)).to.rejectedWith('Graffiti is non-transferrable');
      await expect(graffiti.connect(otherAccount).transferFrom(otherAccount.address, deployer.address, 0)).to.rejectedWith('Graffiti is non-transferrable');
    });
  });

  describe("Can be removed", function () {
    it("Should not be removable by non owner", async function () {
      const { graffiti } = await loadFixture(deployGraffitiFixture);
      await expect(graffiti.remove(0)).to.rejectedWith('Only the owner can remove graffiti');
    });

    it("Should be removable by owner", async function () {
      const { graffiti, otherAccount, deployer } = await loadFixture(deployGraffitiFixture);
      console.log(await graffiti.ownerOf(0), otherAccount.address, deployer.address);
      await graffiti.connect(otherAccount).remove(0);
      await expect(graffiti.ownerOf(0)).to.rejectedWith('ERC721: invalid token ID');
    });
  });
});
