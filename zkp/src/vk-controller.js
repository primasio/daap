const fs = require('fs');
const conf = require('../../web3/config');
const path = require('path');
const Contract = require('../../web3/contract');
const utils = require('./utils');
const util = require('util');
const jsonfile = require('jsonfile');

const vkIdsFile = path.join(path.resolve(__dirname), 'vkIds.json');

let vkIds = {};

/**
 Reads the vkIds json from file
 */
async function getVkIds() {
    if (fs.existsSync(vkIdsFile)) {
        console.log('从json文件中读取vkIds...');
        try {
            vkIds = await jsonfile.readFile(vkIdsFile)
        } catch (err) {
            console.log('读取vkIds失败：', err);
        }
    }
}

async function setVkIds(vkItemList) {
    const gasConfig = {
        gasPrice: 10000000000,
        gasLimit: 6500000
    };
    const organization = new Contract('Organization');
    const shield = new Contract('Shield');
    await getVkIds();
    for (let vkItem of vkItemList) {
        if (vkIds.hasOwnProperty(vkItem)) {
            if (vkItem.startsWith('org')) {
                await organization.method('setVkIds', [vkIds[vkItem].vkId], gasConfig);
                const log = organization.decodeEvent('VkIdsChanged');
                if (log !== null) {
                    console.log('Organization: ' + vkItem + ' VkIdsChanged', log)
                }
            } else {
                await shield.method('setVkIds', [vkIds[vkItem].vkId], gasConfig);
                const log = shield.decodeEvent('VkIdsChanged');
                if (log !== null) {
                    console.log('Shield: ' + vkItem + ' VkIdsChanged', log)
                }
            }
        } else {
            console.log('vkIds:' + vkItem + ' 数据不完整')
        }
    }
}

async function loadVk(vkJsonFile, vkDescription, account) {
    console.log('\n正在为' + vkDescription + '部署 VK');

    const verifier = new Contract('GM17_v0');
    const verifierRegistry = new Contract('Verifier_Registry');
    if (!verifier.deployed() || !verifierRegistry.deployed()) {
        console.log('请先部署合约！');
        return
    }
    let vk = {};
    try {
        vk = await jsonfile.readFile(vkJsonFile);
    } catch (err) {
        console.log('读取vk json文件失败', err);
        return
    }

    vk = Object.values(vk);
    // convert to flattened array:
    vk = utils.flattenDeep(vk);
    // convert to decimal, as the solidity functions expect uints
    vk = vk.map(el => utils.hexToDec(el));

    // upload the vk to the smart contract
    await verifierRegistry.method('registerVk', [vk, [verifier.address]], {
        gasPrice: 10000000000,
        gasLimit: 6500000
    });

    const log = verifierRegistry.decodeEvent('NewVkRegistered');
    if (log === null) {
        return
    }
    const vkId = log._vkId;

    // add new vkId's to the json
    vkIds[vkDescription] = {};
    vkIds[vkDescription].vkId = vkId;
    vkIds[vkDescription].Address = account;


    try {
        await jsonfile.writeFile(vkIdsFile, vkIds);
    } catch (err) {
        console.log('保存 vkIds.json 失败', err)
    }
}

async function vkController() {
    // read existing vkIds (if they exist)
    await getVkIds();
    const account = conf.accounts[0].address;
    const readdir = util.promisify(fs.readdir);

    const filePath = path.resolve(__dirname, '../code/gm17');
    let codeDirList = await readdir(filePath);
    let vkItemList = [];
    for (let dir of codeDirList) {
        let codeDir = path.join(filePath, dir);
        let fileList = await readdir(codeDir);
        for (let file of fileList) {
            if (file.endsWith('vk.json')) {
                let jsonFile = path.join(filePath, dir, file);
                let vkDes = file.slice(0, -8);
                if (!vkIds.hasOwnProperty(vkDes)) {
                    await loadVk(jsonFile, vkDes, account);
                }
                vkItemList.push(vkDes);
                console.log(jsonFile, vkDes);
            }
        }
    }
    await setVkIds(vkItemList);
    console.log('VK setup 完成');
}

vkController().then(() => {
    process.exit();
});


