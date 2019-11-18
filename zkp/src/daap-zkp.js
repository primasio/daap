const utils = require('./utils');
const config = require('./config');

function logParameters(proof, inputs, vkId, des) {
    console.group(des);
    console.log('proof:');
    console.log(proof);
    console.log('inputs:');
    console.log(inputs);
    console.log(`vkId: ${vkId}`);
}

async function orgRegister(proof, inputs, vkId, name, addr, account, organization) {
    logParameters(proof, inputs, vkId, '在Organization合约中进行组织注册操作');

    const accountWith0x = utils.ensure0x(account);
    const addrWith0x = utils.ensure0x(addr);
    await organization.method('register', [proof, inputs, vkId, name, addrWith0x], {
        from: accountWith0x,
        gas: 6500000,
        gasPrice: config.GASPRICE,
    });
    const log = organization.decodeEvent('Register');

    console.log(log.name, '组织注册成功！');
    console.groupEnd();
}

async function assetRegister(proof, inputs, vkId, account, shield) {
    logParameters(proof, inputs, vkId, '在Shield合约中进行资产注册操作');

    const accountWith0x = utils.ensure0x(account);
    await shield.method('register', [proof, inputs, vkId], {
        from: accountWith0x,
        gas: 6500000,
        gasPrice: config.GASPRICE,
    });
    const log = shield.decodeEvent('Register');

    console.log('资产注册成功！', log);
    console.groupEnd();
}

async function assetAuth(proof, inputs, vkId, account, shield) {
    logParameters(proof, inputs, vkId, '在Shield合约中进行资产授权操作');

    const accountWith0x = utils.ensure0x(account);
    await shield.method('auth', [proof, inputs, vkId], {
        from: accountWith0x,
        gas: 6500000,
        gasPrice: config.GASPRICE,
    });
    const log = shield.decodeEvent('Auth');

    console.log('资产授权成功！', log);
    console.groupEnd();
}

module.exports = {
    orgRegister,
    assetRegister,
    assetAuth
};
