pragma solidity ^0.5.11;

import "./Ownable.sol";
import "./Verifier_Interface.sol";
import "./Verifier_Registry.sol";

contract Organization is Ownable {
    event VkIdsChanged(bytes32 registerVkId);
    event Register(bytes32 publicKey, address addr, string name);
    event ResetName(bytes32 publicKey, string name);

    mapping(bytes32 => address) public keyToAddress;
    mapping(address => string) public nameMap;

    bytes32 public registerVkId;
    Verifier_Registry public verifierRegistry; //the Verifier Registry contract
    Verifier_Interface public verifier; //the verification smart contract

    constructor(address _verifierRegistry, address _verifier) public {
        _owner = msg.sender;
        verifierRegistry = Verifier_Registry(_verifierRegistry);
        verifier = Verifier_Interface(_verifier);
    }

    function setVkIds(bytes32 _registerVkId) external onlyOwner {
        require(_registerVkId == verifierRegistry.getVkEntryVkId(_registerVkId), "Organization register vkId not registered.");
        registerVkId = _registerVkId;
        emit VkIdsChanged(registerVkId);
    }


    function register(uint256[] calldata _proof, uint256[] calldata _inputs, bytes32 _vkId, string calldata name, address addr) external {
        require(_vkId == registerVkId, "Incorrect vkId");
        bool result = verifier.verify(_proof, _inputs, _vkId);
        require(result, "The proof has not been verified by the contract");
        bytes32 publicKey = bytes32((_inputs[0] << 128) + _inputs[1]);
        require(keyToAddress[publicKey] == address(0), "This public key has been registered.");
        keyToAddress[publicKey] = addr;
        nameMap[addr] = name;
        emit Register(publicKey, addr, name);
    }

    function resetName(bytes32 publicKey, string calldata name) external {
        require(keyToAddress[publicKey] == msg.sender, "This account has no authority to change name");
        nameMap[msg.sender] = name;
        emit ResetName(publicKey, name);
    }

    function getName(bytes32 publicKey) public view returns (string memory) {
        return nameMap[keyToAddress[publicKey]];
    }
}
