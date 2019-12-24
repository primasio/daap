# Digital Assets Private Publication and Authorization on Blockchain using ZKP

[中文](./README-cn.md) | [English](./README.md)

## Introduction

Zero-Knowledge Proof is one of the most promising research areas in the Blockchain industry. More recently, attention has been drawn to its potential in solving the 2 largest obstacles to mainstream adoption of Blockchain, extensibility and privacy.

As is well recognized, data recorded on Blockchain is open to the public. Everyone can read blocks and extract the data inside, which renders Blockchain unusable for a wide range of situations where data privacy is important. Take Bitcoin as an example in which the UTXO model is used to record token transfers. Anonymity is achieved by the separation of addresses from the real person but if the correspondence between one address and the person is exposed, with the help of some on-chain data analytics tools, one could easily find out all the related UTXOs of this person and calculate his total balance. The same thing happens for smart contract Blockchains such as Ethereum, where all the contract codes, all the invocations of the contracts and their parameters are visible to everyone.

ZKP could be used to solve those problems (we will not cover the details of how ZKP works in this paper though).  With some well-designed solutions on top of ZKP, we could implement the same functions Blockchain provides whilst at the same time, keeping all the data private. [ZCash](https://z.cash), for example, implements the same functions as Bitcoin whilst keeping all the transaction data (the sender, receiver and amount) private using a transaction mixing mechanism which is implemented using zk-SNARK.

Blockchains do far more than just transfer tokens, however. During this revolution of information, most enterprises are experiencing a transition from manufacturing-driven to innovation-driven value, where an enterprise's most important assets are changing from money, materials and factories to talent, knowledge (information) and human networks, or in a professional term, 'social capital'. It is becoming more and more important for enterprises to protect their data assets and create the most value from them.

Blockchain makes it easy for digital assets to be circulated but is incapable of protecting them during that circulation. ERC-721 and ERC-1155 on Ethereum, standardized Non-Fungible Tokens; this has eased the process of creating and trading digital assets on Blockchain. This transparent circulation has meant that alongside ownership of digital assets, entire transaction history is also visible. For organizations, this means their sensitive information is being leaked to the public.

Earlier this year, Ernst & Young released a project called [Nightfall](https://github.com/EYBlockchain/nightfall), which enables the private transactions of ERC-721 tokens on Ethereum. After transferring the tokens into a contract, later transfers of the same tokens inside the contract are made invisible to the outside world. The creation of ERC-721 tokens, however, is still public. For data assets such as photos and articles, however, what commonly happens is the authorization of use is purchased, rather than the actual ownership of the asset. This is not supported by the NFT model, and there are no existing solutions to the privacy problem in this scenario.

The protocol we propose in this paper addresses this problem. The protocol supports the private registration of data assets, the private authorization of them using ZKP. In more detail, the functions of the protocol are:

***1.	Registration of digital assets on the Blockchain, without revealing information about the owner.***

Using a photo as an example: One could register a photo on the Blockchain with only the id and hash of the photo made public. The photo's owner would not be identifiable.

If the owner wants to prove ownership when he publishing the photo, he could attach some text to the photo. The text could verify the ownership when querying on the Blockchain. Even with this text revealed, no one could find any other photos published by the owner on the Blockchain, nor could anyone create a fake proof of ownership.

***2.	Granting authorization of digital assets to users without revealing the buyer, the owner or any details of the digital asset.***

When someone finds the photo online and wants to purchase it for their own use, they could get receive authorization from the Blockchain, without revealing the buyer or seller’s information, or even the ID of the photo being purchased.

Again, if the buyer wants to prove using the photo was authorized, some text could be attached. Anyone could verify the validity of this authorization by sending this text to the Blockchain contract. The seller’s information is kept private, and no other purchase records would be able to be found.

Although above has used a 'photo' as an example, this protocol could be used for any kind of digital asset.

We will explain the protocol in detail in the next chapters.

Currently we have already finished the implementation of this protocol on our own Blockchain platform and have been running tests for quite a while. In the future we intend to open source the code and publish it on Github.

The transfer of ownership is not covered in our protocol since there are already existing solutions for it. Our protocol could be easily integrated into existing solutions and we will provide a fully integrated solution in the open sourced codes.

In our current implementation, [ZoKrates](https://github.com/Zokrates/ZoKrates) is used to develop the protocol, the ZKP algorithm used is [Groth 16](https://eprint.iacr.org/2016/260.pdf). The separation of ZKP algorithm and the upper level design allows the easy switch of ZKP algorithms. One could easily use [Bellman](https://github.com/zkcrypto/bellman) to replace ZoKrates, or using a more advanced algorithm such as [Bulletproofs](https://github.com/dalek-cryptography/bulletproofs) and [Sonic](https://eprint.iacr.org/2019/099) for better performance and the removal of trusted setup.

## Getting Started

To start using the codes in this repository and running some demos yourself,
please refer to the [Getting Started Guide](docs/getting-started.md).

## Protocol Specification

To get an inside look of DAAP design, please refer to the [Protocol Specification](docs/protocol.md).

## Community

Slack: [slack.primas.io](https://slack.primas.io). And join the channel #daap.

Email: [hi@primas.io](mailto:hi@primas.io)

Wechat ID: lencyforce

## Contribution

PR is welcome.
Submit issues, or add links to your project that is using this protocol.
