// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter; // using counters to increment the id of each NFT
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("Metaverse Tokens", "METT") {
        contractAddress = marketplaceAddress;
    }

    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment(); // increment the id of the next NFT
        uint256 newItemId = _tokenIds.current(); // get the id of the new NFT

        _mint(msg.sender, newItemId); // mint the new NFT
        _setTokenURI(newItemId, tokenURI); // set the URI of the new NFT
        setApprovalForAll(contractAddress, true); // give approval to the marketplace to transact this token with other users
        return newItemId;
    }
}
