require("@nomiclabs/hardhat-waffle");
const dotenv = require("dotenv");

dotenv.config({ path: "./.env.local" });

let privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY.toString();

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_POLY_MUMBAI_KEY}`,
      accounts: [privateKey],
    },
    mainnet: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_POLY_MAIN_KEY}`,
      accounts: [privateKey],
    },
  },
  solidity: "0.8.4",
};
