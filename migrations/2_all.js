const Verifier_Registry = artifacts.require('Verifier_Registry');
const BN256G2 = artifacts.require('BN256G2');
const GM17_v0 = artifacts.require('GM17_v0');
const NFTokenMetadata = artifacts.require('NFTokenMetadata');
const Shield = artifacts.require('Shield');
const Organization = artifacts.require('Organization');
module.exports = async function (deployer) {
    await deployer.deploy(Verifier_Registry);
    await deployer.deploy(BN256G2);
    deployer.link(BN256G2, GM17_v0);
    await deployer.deploy(GM17_v0, Verifier_Registry.address);
    await deployer.deploy(Organization, Verifier_Registry.address, GM17_v0.address);
    await deployer.deploy(NFTokenMetadata);
    await deployer.deploy(Shield, Verifier_Registry.address, GM17_v0.address, NFTokenMetadata.address, Organization.address);
};
