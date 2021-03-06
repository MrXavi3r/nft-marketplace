import Image from "next/image";
import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import { nftAddress, nftMarketAddress } from "../config";

// ipfs client with infura node to set & pin files to ipfs
const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

//create-item page
const CreateItem = () => {
  const [fileUrl, setFileUrl] = useState("");
  const [formInput, setFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter(); // next router

  //handles the file upload input change
  const onChange = async (e) => {
    const file = e.target.files[0];

    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}%`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.error(error);
    }
  };

  // creates a new nft, uses the createSale function to do so
  const createItem = async () => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return; // check if all fields are filled
    const data = JSON.stringify({ name, description, image: fileUrl });

    try {
      const added = await client.add(data); // add data to ipfs
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      // after file is added to ipfs, pass the URL to save it on Polygon
      createSale(url);
    } catch (error) {
      console.log("error uploading to ipfs", error);
    }
  };

  // passed as a helper to the create-item function
  const createSale = async (url) => {
    const web3Modal = new Web3Modal(); // connect user to metamask or other wallet provider
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // create a new nft, passing in url of the image
    let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();

    // after the transaction is mined, get the tokenId from the transaction
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    contract = new ethers.Contract(nftMarketAddress, NFTMarket.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    // create the item for sale, passing in the tokenId, price, and listing price
    transaction = await contract.createMarketItem(nftAddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push("/"); // redirect to home page after item is created
  };

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            setFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in MATIC"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            setFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileUrl && (
          <Image
            className="rounded mt-4"
            alt="stock image"
            width={350}
            height={350}
            src={fileUrl}
          />
        )}
        <button
          onClick={createItem}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  );
};

export default CreateItem;
