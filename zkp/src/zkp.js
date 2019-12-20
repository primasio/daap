
/**
 @notice gets a node from the merkle tree data from the nfTokenShield contract.
 @param {string} account - the account that is paying for the transactions
 @param {Contract} shieldContract - an instance of the nfTokenShield smart contract
 @param {number} index - the index of the token in the merkle tree, which we want to get from the nfTokenShield contract.
 @param {number} treeType - 0 for registry tree and 1 for authority tree
 @returns {string} a hex node of the merkleTree
 */
async function getMerkleNode(account, shieldContract, index, treeType) {
    let instance = await shieldContract.deployed();
    if (treeType === 0 ) {
        return await instance.regMerkleTree(index);
    } else {
        return await instance.authMerkleTree(index);
    }
}

/**
 @notice gets the latestRoot public variable from the shieldContract contract.
 @param {Contract} shieldContract - an instance of the shieldContract smart contract
 @param {number} treeType - 0 for registry tree and 1 for authority tree
 @returns {string} latestRoot
 */
async function getLatestRoot(shieldContract, treeType) {
    let instance = await shieldContract.deployed();
    if (treeType === 0 ) {
        return await instance.regLatestRoot();
    } else {
        return await instance.authLatestRoot();
    }
}


module.exports = {
    getMerkleNode,
    getLatestRoot
};
