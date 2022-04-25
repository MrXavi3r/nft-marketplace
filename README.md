# NFT MARKETPLACE APP

NEXT.JS frontend 
NODE.JS backend scripts
SOLIDITY EVM smart contracts
HARDHAT Ethereum development environment

An NFT marketplace for the Polygon chain. Users may create items for sale to populate the marketplace and also purchase items created by other users. 

Solidity smart contracts are written to handle creation of NFTs and govern the marketplace operations.

Contracts are deployed via hardhat using the deploy.js script in the scripts folder.

NPM RUN DEV TO START THE APPLICATION

Use MetaMask to connect to the Polygon Mumbai testnet to interact with the application.

The 'Home' page displays all items for sale in the marketplace. Here users may purchase items buy clicking the corresponding buy button and interacting with Metamask to confirm and sign the transaction.

The 'Sell Digital Asset' page produces a form that enables users to create an NFT asset for sale. There is a listing price fee of .025 MATIC that is hard coded into the NFT Marketplace contract. The owner of the NFT Marketplace contract will receive this fee each time a new item is listed for sale. Complete the form and interact with Metamask in order to confirm and sign the transaction and list a new item for sale. Once successfully submitted, Images are stored on the IPFS network via an Infura API and Ipfs-http-client package. Newly created items are ERC721 tokens called Metaverse Tokens('METT'). 

The 'My Digital Assets' page displays items that the active user has purchased from the marketplace.

The 'Creator Dashboard' page displays assets the active user has created in the marketplace. 






