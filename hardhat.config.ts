import 'dotenv/config'
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers"

import 'hardhat-deploy'

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
  },
  // Hardhat deploy
  namedAccounts: {
    deployer: 0,
    acc1: 1,
    acc2: 2,
    proxyAdmin: 3,
    acc3: 4,
  },
};

export default config;
