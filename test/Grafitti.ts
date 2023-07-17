import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import svgs from './svgs';

describe("Graffiti", function () {
  async function deployGraffitiFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Graffiti = await ethers.getContractFactory("Graffiti");
    const graffiti = await Graffiti.deploy();

    return { graffiti, owner, otherAccount };
  }

  describe("Minting", function () {
    it("Should mint with correct metadata", async function () {
      const { graffiti, otherAccount } = await loadFixture(deployGraffitiFixture);
      await graffiti.paint(otherAccount, svgs[0]);
      expect(await graffiti.ownerOf(0)).to.equal(otherAccount.address);
      const dataURI = await graffiti.tokenURI(0);
      const json = atob(dataURI.substring(29));
      const result = JSON.parse(json);
      expect(result.name).to.equal("NMB0");
      expect(result.description).to.equal("NMB");
      expect(result.attributes).to.deep.equal([]);
      expect(atob(result.image.substring(26))).to.equal(svgs[0])
    });
  });
});
