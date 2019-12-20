const Web3 = require('web3');
const conf = require('./config');
const path = require('path');
const contract = require('@truffle/contract');
function artifacts(contractName) {
    const contractPath = path.resolve(__dirname, '..', "build/contracts");
    let contractFile = path.join(contractPath, contractName);
    let artifact = require(contractFile);
    let MyContract = contract(artifact);
    MyContract.setProvider(new Web3.providers.HttpProvider(conf.web3ProviderURL));
    return MyContract
}
module.exports = artifacts;
