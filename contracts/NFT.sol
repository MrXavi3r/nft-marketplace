// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter; // using Counters library
    Counters.Counter private _tokenIds;
    address contractAddress; // this is not the address of this contract, this will be set to the address of the marketplace contract for use in SetApprovalForAll()

    constructor(address marketplaceAddress) ERC721("Mueshi Token", "MTT") {
        contractAddress = marketplaceAddress; // set contractAddress to the NFT Marketplace address
    }

    // creates a new NFT
    // each time an item is created in the markeplace, this function is executed
    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment(); // increments and sets the id of the new NFT
        uint256 newItemId = _tokenIds.current(); // get the id of the new NFT

        _mint(msg.sender, newItemId); // mint the new NFT token, inherited from ERC721
        _setTokenURI(newItemId, tokenURI); // set the URI of the new NFT, inherited from ERC721URIStorage
        setApprovalForAll(contractAddress, true); // give approval to the marketplace to transact(change ownership) this token with other users, inherited from ERC721
        return newItemId; // return the id of the new NFT for use on the frontend, when the item is up for sale, its id will be used to reference the item
    }
}
