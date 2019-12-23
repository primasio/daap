const Web3 = require('web3');
const path = require('path');
const contract = require('@truffle/contract');
const web3 = new Web3();
const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
web3.setProvider(provider);
function artifacts(contractName) {
    const contractPath = path.resolve(__dirname, '..', "build/contracts");
    let contractFile = path.join(contractPath, contractName);
    let artifact = require(contractFile);
    let MyContract = contract(artifact);
    MyContract.setProvider(provider);
    return MyContract
}

module.exports = {artifacts, web3};
