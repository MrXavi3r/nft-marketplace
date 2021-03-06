import Image from "next/image";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftAddress, nftMarketAddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  // fetches nft data from the blockchain
  // loads the nft data into the state
  const loadNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://rpc-mumbai.matic.today"
    );
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      Market.abi,
      provider
    );

    // get the nft data from the NFTMarket smart contract
    const data = await marketContract.fetchMarketItems();

    // customize the response data for fetching all nfts and setting them into state
    // promise.all takes an iterable of promises, and returns a single promise
    // the response data is an array of objects
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenURI);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether"); // show price in ether format
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoading(false);
  };

  // allows the user to buy an item from the marketplace
  const buyNft = async (nft) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner(); // get the signer from the provider to call createMarketSale
    const contract = new ethers.Contract(nftMarketAddress, Market.abi, signer);
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    // create a market sale transaction
    const transaction = await contract.createMarketSale(
      nftAddress,
      nft.tokenId,
      {
        value: price,
      }
    );

    await transaction.wait(); // wait for the transaction to be mined before continuing
    loadNFTs();
  };

  // if there are no nfts in the marketplace to display, show a message
  // if (loading === false && !nfts.length)
  //   return <h1 className="px-20 py-10 text-3xl">No Items in Marketplace</h1>;

  return (
    <>
      <div className="text-white pl-10 mb-12">
        <h1 className="text-8xl">BUY</h1>
        <h2 className="text-8xl">SELL</h2>
        <h3 className="text-8xl">INVEST</h3>
        <button className="bg-pink-500 text-white text-2xl rounded-3xl w-72 pt-2 pb-3 mt-4">
          Learn more
        </button>
      </div>
      <div className="flex justify-center pb-12">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {Boolean(nfts.length) &&
              nfts.map((nft, index) => (
                <div key={index} className="shadow rounded-xl overflow-hidden">
                  <Image src={nft.image} alt="nft" width={350} height={350} />
                  <div className="p-4">
                    <p
                      className="text-2xl font-semibold text-white"
                      style={{ height: "64px" }}
                    >
                      {nft.name}
                    </p>
                    <div style={{ height: "70px", overflow: "hidden" }}>
                      <p className="text-white">{nft.description}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-2xl mb-4 font-fold text-white">
                      {nft.price} MATIC
                    </p>
                    <button
                      className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                      onClick={() => buyNft(nft)}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
