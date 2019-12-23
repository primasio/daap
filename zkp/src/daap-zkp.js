function logParameters(proof, inputs, vkId, des) {
    console.group(des);
    console.log('proof:');
    console.log(proof);
    console.log('inputs:');
    console.log(inputs);
    console.log(`vkId: ${vkId}`);
}

async function orgRegister(proof, inputs, vkId, name, addr, account, organization) {
    try {
        logParameters(proof, inputs, vkId, '在Organization合约中进行组织注册操作');
        let instance = await organization.deployed();
        let res = await instance.register(proof, inputs, vkId, name, addr, {from: account});
        console.log(res.logs[0].args.name, '组织注册成功！');
        console.groupEnd();
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

async function assetRegister(proof, inputs, vkId, account, shield) {
    try {
        logParameters(proof, inputs, vkId, '在Shield合约中进行资产注册操作');
        let instance = await shield.deployed();
        let res = await instance.register(proof, inputs, vkId, {from: account});
        console.log('资产注册成功！', res.logs[0].args);
        console.groupEnd();
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

async function assetAuth(proof, inputs, vkId, account, shield) {
    try {
        logParameters(proof, inputs, vkId, '在Shield合约中进行资产授权操作');
        let instance = await shield.deployed();
        let res = await instance.auth(proof, inputs, vkId, {from: account});
        console.log('资产授权成功！', res.logs[0].args);
        console.groupEnd();
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

async function authProof(proof, inputs, vkId, account, shield) {
    try {
        logParameters(proof, inputs, vkId, '在Shield合约中进行授权证明操作');
        let instance = await shield.deployed();
        let res = await instance.proof(proof, inputs, vkId, {from: account});
        console.log('授权证明成功！', res.logs[0].args);
        console.groupEnd();
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

module.exports = {
    orgRegister,
    assetRegister,
    assetAuth,
    authProof
};
