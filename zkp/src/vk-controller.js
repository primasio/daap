const fs = require('fs');
const conf = require('../../web3/config');
const path = require('path');
const artifacts = require('../../web3/artifacts');
const utils = require('./utils');
const util = require('util');
const jsonfile = require('jsonfile');
const web3 = require('../../web3/eth');
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
    try {
        let accounts = await web3.eth.getAccounts();
        const organization = await artifacts('Organization').deployed();
        const shield = await artifacts('Shield').deployed();
        await getVkIds();
        for (let vkItem of vkItemList) {
            if (vkIds.hasOwnProperty(vkItem)) {
                if (vkItem.startsWith('org')) {
                    let res = await organization.setVkIds(vkIds[vkItem].vkId, {from: accounts[0]});
                    if (res !== null) {
                        console.log('Organization: ' + vkItem + ' VkIdsChanged', res.logs[0].args)
                    }
                } else {
                    let res = await shield.setVkIds(vkIds[vkItem].vkId, {from: accounts[0]});
                    if (res !== null) {
                        console.log('Shield: ' + vkItem + ' VkIdsChanged', res.logs[0].args)
                    }
                }
            } else {
                console.log('vkIds:' + vkItem + ' 数据不完整')
            }
        }
    } catch (e) {
        console.log(e);
        process.exit();
    }

}

async function loadVk(vkJsonFile, vkDescription) {
    try {
        console.log('\n正在为' + vkDescription + '部署 VK');
        let accounts = await web3.eth.getAccounts();
        const verifier = await artifacts('GM17_v0').deployed();
        const verifierRegistry = await artifacts('Verifier_Registry').deployed();
        let vk = {};
        vk = await jsonfile.readFile(vkJsonFile);

        vk = Object.values(vk);
        // convert to flattened array:
        vk = utils.flattenDeep(vk);
        // convert to decimal, as the solidity functions expect uints
        vk = vk.map(el => utils.hexToDec(el));

        // upload the vk to the smart contract
        let res = await verifierRegistry.registerVk(vk, [verifier.address], {from: accounts[0]});

        const vkId = res.logs[0].args._vkId;

        // add new vkId's to the json
        vkIds[vkDescription] = {};
        vkIds[vkDescription].vkId = vkId;
        vkIds[vkDescription].Address = accounts[0];

        await jsonfile.writeFile(vkIdsFile, vkIds);
    } catch (e) {
        console.log('loadVk失败', e)
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


