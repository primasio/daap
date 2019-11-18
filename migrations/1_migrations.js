const Contract = require('../web3/contract');

const Verifier_Registry = new Contract('Verifier_Registry');
const BN256G2 = new Contract('BN256G2');
const GM17_v0 = new Contract('GM17_v0');
const NFTokenMetadata = new Contract('NFTokenMetadata');
const Shield = new Contract('Shield');
const Organization = new Contract('Organization');

async function deployContracts() {
    let gasConfig = {gasPrice: 10000000000};
    await Verifier_Registry.deploy([], gasConfig);
    await BN256G2.deploy([], gasConfig);
    GM17_v0.link(BN256G2);
    await GM17_v0.deploy([Verifier_Registry.address], gasConfig);
    await NFTokenMetadata.deploy([], gasConfig);
    await Shield.deploy([Verifier_Registry.address, GM17_v0.address, NFTokenMetadata.address], gasConfig);
    await Organization.deploy([Verifier_Registry.address, GM17_v0.address], gasConfig)
}

deployContracts().then(() => {
    console.log('所有操作已完成！');
    process.exit();
});

