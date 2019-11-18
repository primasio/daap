/**
Contract to enable the management of hidden non fungible toke transactions.
@Author Westlad, Chaitanya-Konda, iAmMichaelConnor
*/
pragma solidity ^0.5.11;

import "./Ownable.sol";
import "./Verifier_Registry.sol"; //we import the implementation to have visibility of its 'getters'
import "./Verifier_Interface.sol";
import "./NFTokenInterface.sol";


contract Shield is Ownable {

    /*
    @notice Explanation of the Merkle Tree, in this contract:
    We store the merkle tree nodes in a flat array.



                                        0  <-- this is our Merkle Root
                                 /             \
                          1                             2
                      /       \                     /       \
                  3             4               5               6
                /   \         /   \           /   \           /    \
              7       8      9      10      11      12      13      14
            /  \    /  \   /  \    /  \    /  \    /  \    /  \    /  \
           15  16  17 18  19  20  21  22  23  24  25  26  27  28  29  30

  depth row  width  st#     end#
    1    0   2^0=1  w=0   2^1-1=0
    2    1   2^1=2  w=1   2^2-1=2
    3    2   2^2=4  w=3   2^3-1=6
    4    3   2^3=8  w=7   2^4-1=14
    5    4   2^4=16 w=15  2^5-1=30

    d = depth = 5
    r = row number
    w = width = 2^(depth-1) = 2^3 = 16
    #nodes = (2^depth)-1 = 2^5-2 = 30

    */


    event VerifierChanged(address newVerifierContract);
    event VkIdsChanged(bytes32 vkId);
    event Register(bytes32 regCommitment, bytes32 assetId, uint256 commitment_index);
    event Auth(bytes32 authCommitment, uint256 commitment_index);

    uint constant merkleWidth = 4294967296; //2^32
    uint constant merkleDepth = 33; //33

    mapping(uint256 => bytes27) public regMerkleTree;
    mapping(uint256 => bytes27) public authMerkleTree; // the entire Merkle Tree of nodes, with the latter 'half' of merkleTree being the leaves.
    mapping(bytes32 => bytes32) public authRoots;
    mapping(bytes32 => bytes32) public regRoots; // holds each root we've calculated so that we can pull the one relevant to the prover
    mapping(bytes32 => bytes32) public vkIds;
    mapping(bytes32 => bytes32) public assets;
    mapping(bytes32 => uint256) public regCommitmentIndex;
    mapping(bytes32 => uint256) public authCommitmentIndex;

    uint256 public regLeafCount;
    uint256 public authLeafCount; //remembers the number of commitments we hold
    bytes32 public regLatestRoot;
    bytes32 public authLatestRoot; //holds the index for the latest root so that the prover can provide it later and this contract can look up the relevant root

    Verifier_Registry public verifierRegistry; //the Verifier Registry contract
    Verifier_Interface public verifier; //the verification smart contract
    NFTokenInterface public nfToken; //the NFToken ERC-721 token contract

    constructor(address _verifierRegistry, address _verifier, address _nfToken) public {
        _owner = msg.sender;
        verifierRegistry = Verifier_Registry(_verifierRegistry);
        verifier = Verifier_Interface(_verifier);
        nfToken = NFTokenInterface(_nfToken);
    }

    /**
    self destruct
    */
    function close() external onlyOwner {
        selfdestruct(address(uint160(_owner)));
    }

    /**
    function to change the address of the underlying Verifier contract
    */
    function changeVerifier(address _verifier) external onlyOwner {
        verifier = Verifier_Interface(_verifier);
        emit VerifierChanged(_verifier);
    }

    /**
    returns the verifier-interface contract address that this shield contract is calling
    */
    function getVerifier() external view returns (address) {
        return address(verifier);
    }

    function setVkIds(bytes32 vkId) external onlyOwner {
        // ensure the vkId's have been registered:
        require(vkId == verifierRegistry.getVkEntryVkId(vkId), "vkId not registered.");
        vkIds[vkId] = vkId;
        emit VkIdsChanged(vkId);
    }

    /**
    returns the ERC-721 contract address that this shield contract is calling
    */
    function getNFToken() public view returns (address){
        return address(nfToken);
    }

    /**
    * SafeTransferFrom implementation of ERC-721 contract checks the return value of onERC721Received of tokenShield contract.
    * If the correct value is not returned, then the transferFrom() function is rolled back as it has been  determined that the _to does not
    * implement the expected interface.
    * The correct value is Returns `bytes4(keccak256("onERC721Received(address,uint256,bytes)"))`
    */
    function onERC721Received(address, address, uint256, bytes memory) public pure returns (bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }

    function register(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId) external {
        bytes32 regCommitment = (bytes32(_inputs[0]) << 128) | bytes32(_inputs[1]);
        bytes32 assetId = (bytes32(_inputs[2]) << 128) | bytes32(_inputs[3]);
        require(vkIds[_vkId] == _vkId, "Incorrect vkId");
        require(assets[assetId] != assetId, "Duplicated assetId");
        bool result = verifier.verify(_proof, _inputs, _vkId);
        require(result, "The proof has not been verified by the contract");

        uint256 leafIndex = merkleWidth - 1 + regLeafCount; // specify the index of the commitment within the merkleTree
        regMerkleTree[leafIndex] = bytes27(regCommitment<<40); // add the commitment to the merkleTree

        assets[assetId] = assetId;
        updatePathToRoot(leafIndex, 0);
        nfToken.mint(uint256(assetId), '');
        regLeafCount++;
        regCommitmentIndex[regCommitment] = regLeafCount;
        emit Register(regCommitment, assetId, regLeafCount);
    }

    function auth(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId) external {
        bytes32 authCommitment = (bytes32(_inputs[0]) << 128) | bytes32(_inputs[1]);
        bytes32 root = (bytes32(_inputs[2]) << 128) | bytes32(_inputs[3]);
        require(vkIds[_vkId] == _vkId, "Incorrect vkId");
        require(regRoots[root] == root, "The input root has never been the root of the Merkle Tree");

        bool result = verifier.verify(_proof, _inputs, _vkId);
        require(result, "The proof has not been verified by the contract");

        uint256 leafIndex = merkleWidth - 1 + authLeafCount; // specify the index of the commitment within the merkleTree
        authMerkleTree[leafIndex] = bytes27(authCommitment<<40); // add the commitment to the merkleTree

        updatePathToRoot(leafIndex, 1);
        authLeafCount++;
        authCommitmentIndex[authCommitment] = authLeafCount;

        emit Auth(authCommitment, authLeafCount);
    }

    /**
    Updates each node of the Merkle Tree on the path from leaf to root.
    p - is the leafIndex of the new commitment within the merkleTree.
    */
    function updatePathToRoot(uint p, uint tp) private returns (bytes32) {

        /*
        If Z were the commitment, then the p's mark the 'path', and the s's mark the 'sibling path'

                         p
                p                  s
           s         p        EF        GH
        A    B    Z    s    E    F    G    H
        */

        uint s;
        //s is the 'sister' path of p.
        uint t;
        //temp index for the next p (i.e. the path node of the row above)
        bytes32 h;
        //hash
        for (uint r = merkleDepth - 1; r > 0; r--) {
            if (p % 2 == 0) {//p even index in the merkleTree
                s = p - 1;
                t = (p - 1) / 2;
                if (tp == 0) {
                    h = sha256(abi.encodePacked(regMerkleTree[s], regMerkleTree[p]));
                    regMerkleTree[t] = bytes27(h << 40);
                } else {
                    h = sha256(abi.encodePacked(authMerkleTree[s], authMerkleTree[p]));
                    authMerkleTree[t] = bytes27(h << 40);
                }

            } else {//p odd index in the merkleTree
                s = p + 1;
                t = p / 2;
                if (tp == 0) {
                    h = sha256(abi.encodePacked(regMerkleTree[p], regMerkleTree[s]));
                    regMerkleTree[t] = bytes27(h << 40);
                } else {
                    h = sha256(abi.encodePacked(authMerkleTree[p], authMerkleTree[s]));
                    authMerkleTree[t] = bytes27(h << 40);
                }
            }
            p = t;
            //move to the path node on the next highest row of the tree
        }
        if (tp == 0) {
            regLatestRoot = h;
            regRoots[h] = h;
        } else {
            authLatestRoot = h;
            authRoots[h] = h;
        }
        return h;
        //the (256-bit) root of the merkleTree
    }
}
