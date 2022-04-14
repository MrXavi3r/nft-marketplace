import Image from "next/image";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftAddress, nftMarketAddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const CreatorDashboard = () => {
  return <div>creator-dashboard</div>;
};

export default CreatorDashboard;
