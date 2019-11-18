const utils = require('./utils');
const config = require('./config');

/**
 @notice gets a node from the merkle tree data from the nfTokenShield contract.
 @param {string} account - the account that is paying for the transactions
 @param {Contract} shieldContract - an instance of the nfTokenShield smart contract
 @param {number} index - the index of the token in the merkle tree, which we want to get from the nfTokenShield contract.
 @param {number} treeType - 0 for registry tree and 1 for authority tree
 @returns {string} a hex node of the merkleTree
 */
async function getMerkleNode(account, shieldContract, index, treeType) {
    if (treeType === 0 ) {
        return await shieldContract.call('regMerkleTree', [index]);
    } else {
        return await shieldContract.call('authMerkleTree', [index]);
    }
}

/**
 @notice gets the latestRoot public variable from the nfTokenShield contract.
 @param {Contract} nfTokenShield - an instance of the nfTokenShield smart contract
 @param {number} treeType - 0 for registry tree and 1 for authority tree
 @returns {string} latestRoot
 */
async function getLatestRoot(nfTokenShield, treeType) {
    if (treeType === 0 ) {
        return await nfTokenShield.call('regLatestRoot');
    } else {
        return await nfTokenShield.call('authLatestRoot');
    }
}


module.exports = {
    getMerkleNode,
    getLatestRoot
};
