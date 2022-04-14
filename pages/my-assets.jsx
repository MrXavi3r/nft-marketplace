import Image from "next/image";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftAddress, nftMarketAddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

// my digital assets page
const MyAssets = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  // fetches nft data from the blockchain
  // loads the nft data into the state
  const loadNFTs = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      NFTMarket.abi,
      signer
    );
    const data = await marketContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenURI);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
        };
        return item;
      })
    );
    setNfts(items);
    setLoading(false);
  };

  if (!loading && !nfts.length) {
    return <h1 className="py-10 px-20 text-3xl">No owned assets</h1>;
  }

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, index) => (
            <div
              key={index}
              className="border shadow rounded-xl overflow-hidden"
            >
              <Image
                src={nft.image}
                alt="nft"
                className="rounded"
                width={350}
                height={350}
              />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyAssets;
