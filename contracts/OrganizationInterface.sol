pragma solidity ^0.5.11;

contract OrganizationInterface {
    function getName(bytes32 publicKey) public view returns (string memory);
    function resetName(bytes32 publicKey, string calldata name) external;
}
