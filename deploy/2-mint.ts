import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NFTStorage, File } from 'nft.storage';
import mime from 'mime'
import fs from 'fs'
import path from 'path'

const { NFT_STORAGE_KEY = '' } = process.env;

const getFilePath = (fileName: string) => `images/${fileName}`

const description = 'Ethereum Argentina'

const func = async function (hre: HardhatRuntimeEnvironment) {
    const nfts = require(`../configs/${hre.network.name}`)
    const graffiti = await ethers.getContract("Graffiti");
    const accounts = await ethers.getSigners();

    for (const metadata of nfts) {
        const nftStorage = new NFTStorage({ token: NFT_STORAGE_KEY })

        // Update metadata
        // Save address and delete from metadata
        const address = metadata.address;
        delete metadata.address;
        // Save image
        const fileName = getFilePath(metadata.image)
        metadata.image = new File([await fs.promises.readFile(fileName)], path.basename(fileName), { type: mime.getType(fileName) })

        // Add description
        metadata.description = description;

        // Upload metadata and mint NFT
        const metadataUri = nftStorage.store(metadata)
        const result = await graffiti.paint(address, metadataUri)
        console.log(result);
    }
};

func.tags = ["Storage"];

export default func;
