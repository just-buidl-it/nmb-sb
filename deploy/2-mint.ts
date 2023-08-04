import { ethers } from "hardhat";
import { shuffle } from "lodash";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { filesFromPaths } from 'files-from-path'
import { NFTStorage, File } from 'nft.storage';
import mime from 'mime'
import fs from 'fs'
import path from 'path'
import { Graffiti } from "../typechain-types";

const { NFT_STORAGE_KEY = '', TARGET_EOA, ETHERSCAN_API_KEY } = process.env;
const MINT_NUM = 23;

const fetchAddress = async (): Promise<string[]> => {
  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${TARGET_EOA}&page=1&offset=100&startblock=17630001&endblock=latest&sort=asc&apikey=${ETHERSCAN_API_KEY}`
  const res = await fetch(url);
  if (!res.ok) {
    throw Error('Unable to fetch addresses to graffiti')
  }
  const data = await res.json();
  const uniqueAddress = new Set();
  
  data.result.forEach((r: { from: string }) => {
    uniqueAddress.add(r.from)
  })

  const shuffled = shuffle<string>(Array.from(uniqueAddress) as string[])
  return shuffled.slice(0, MINT_NUM);
}

const func = async function (hre: HardhatRuntimeEnvironment) {
  const addresses = await fetchAddress()

  const getDirPath = (fileName: string) => `images/${hre.network.name == 'mainnet' ? 'mainnet' : 'mainnet'}${fileName}`
  const graffiti: Graffiti = await ethers.getContract("Graffiti");

  const files = await filesFromPaths([getDirPath('')])

  for (const [index, address] of addresses.entries()) {
    const nftStorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    const fileName = files[index].name;
    const name = path.basename(fileName).replace(path.extname(fileName), '')
    const metadata = {
      name,
      image: new File([await fs.promises.readFile(getDirPath(`/${fileName}`))], path.basename(fileName), { type: mime.getType(fileName) }),
      description: 'Para celebrar eth arg 2023 y la creación de la colección nfts “23 días sin lavarme” Las moscas ensuciaron 23 billeteras participantes de la conferencia. NMB <> 238',
      external_url: 'https://opensea.io/es/collection/moskas-238',
    }

    // Upload metadata and mint NFT
    const metadataUri = await nftStorage.store(metadata)
    await graffiti.paint(address, metadataUri.url)
  }
};

func.tags = ["Storage"];

export default func;
