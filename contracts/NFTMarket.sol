// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // helper to prevent potential reentrancy attacks

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter; // library used to easily increment/decrement variable values
    Counters.Counter private _itemIds; // counter for the number of items in the marketplace
    Counters.Counter private _itemsSold; // counter for the number of items sold

    address payable owner; // owner will earn a royalty for each item sold
    uint256 listingPrice = 0.025 ether; // price will convert to MATIC

    constructor() {
        owner = payable(msg.sender); // owner is the person who deployed the contract and will receive the royalties
    }

    // this struct serves as the bluprint for each item in the marketplace
    struct MarketItem {
        uint256 ItemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    // fetch an item based on its id
    mapping(uint256 => MarketItem) private idToMarketItem;

    // each time an item is created, this event will emitted to the blockchain
    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );


    // helper function for viewing the listing price of the marketplace
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // creates a new item in the marketplace
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        require(price > 0, "Price must be greater than 1 wei"); // listing price cannot be free
        require(msg.value == listingPrice, "Price must match listing price"); // listing price will be received at creation and locked into contract until sale occurs

        _itemIds.increment();
        uint256 itemId = _itemIds.current(); // get the id of the new item

        // set the mapping for the new item
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender), // seller. the person who created the item
            payable(address(0)), // owner. address will be set when the item is sold, for now it defaults to 0
            price,
            false
        );

         // interface for the ERC721 contract
        // transfer ownership of the nft to the marketplace
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        // emit the event for the creation of new item
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    // function for selling an item
    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price; // price of the nft 
        uint256 tokenId = idToMarketItem[itemId].tokenId; // token id of the nft

        require(msg.value == price, "Price must match listing price");

        idToMarketItem[itemId].seller.transfer(msg.value); // pays the seller of the nft the price of the item
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId); // transfer the nft to the buyer(msg.sender)
        idToMarketItem[itemId].owner = payable(msg.sender); // set the owner of the nft to the buyer(msg.sender)
        idToMarketItem[itemId].sold = true; 
        _itemsSold.increment(); // increment the number of items sold
        payable(owner).transfer(listingPrice); // owner receives listing price royalty on completion of sale
    }

    // fetches all items in the marketplace and returns them as an array
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current(); // used for setting the length of the array
        uint256 currentIndex = 0; // used for iterating through the array and keeping up with the index

        MarketItem[] memory items = new MarketItem[](unsoldItemCount); // create an array of MarketItem structs the length of unsoldItemCount

        // iterate through all items in the marketplace
        // if the item is not sold, add it to the items array
        // return the array
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = idToMarketItem[i + 1].ItemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items;
    }

    // fetches all items in the marketplace that match the msg.sender as the owner
    // if you bought an item, you will be able to see it in this list
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        // loops over all items in the marketplace that are owned by the msg.sender
        // sets the itemCount based on # of nfts owned by the msg.sender
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount++;
            }
        }

        // create array of items the length of the itemCount
        MarketItem[] memory items = new MarketItem[](itemCount); 

        // loops over market items
        // checks if current item is owned by the msg.sender
        // pushes that nft to the items array
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = idToMarketItem[i + 1].ItemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items;
    }

    // fetches all items created by the msg.sender
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        // loops over all items in the marketplace that are owned by the msg.sender
        // sets the itemCount based on # of nfts owned by the msg.sender
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount++;
            }
        }
        
        // create array of items the length of the itemCount
        MarketItem[] memory items = new MarketItem[](itemCount);  

        // loops over market items
        // checks if current item is being sold by the msg.sender
        // pushes that item to the array
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = idToMarketItem[i + 1].ItemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex++;
            }
        }
        return items;
    }
}
