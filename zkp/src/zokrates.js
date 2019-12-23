const Docker = require('node-docker-api').Docker;
const config = require('./config');
const path = require('path');
const jsonfile = require('jsonfile');
const fs = require('fs');

const docker = new Docker({
    socketPath: '/var/run/docker.sock',
});
const containerId = '';

const promisifyStream = stream =>
    new Promise((resolve, reject) => {
        const MAX_RETURN = 10000000;
        let chunk = '';
        stream.on('data', d => {
            chunk += d.toString('utf8'); // remove any characters that aren't in the proof.
            if (chunk.length > MAX_RETURN) chunk = '...[truncacted]'; // don't send back too much stuff
        });
        stream.on('end', () => {
            if (chunk.includes('panicked')) {
                // errors thrown by the application are not always recognised
                reject(new Error(chunk.slice(chunk.indexOf('panicked'))));
            } else {
                resolve(chunk);
            }
        });
        stream.on('error', err => reject(err));
    });

async function runContainer() {
    console.log('准备启动zokrates容器');
    const container = await docker.container.create({
        Image: config.ZOKRATES_IMAGE,
        Cmd: ['/bin/bash', '-c', 'tail -f /var/log/alternatives.log'],
    });
    console.log('容器已启动');
    console.log(`Container id: ${container.id}`);
    console.log(`手动链接容器: 'docker exec -ti ${container.id} bash'`);
    return await container.start();
}

async function runContainerMounted(_hostDirPath) {
    console.log(`ZoKrates running with Nodejs environment ${process.env.NODE_ENV}`);
    const hostDirPath = path.resolve(__dirname, '..', _hostDirPath);
    console.log(
        `启动容器; mounted: ${hostDirPath}:${config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS}:cached`,
    );
    try {
        let container = {};
        if (containerId !== '') {
            container = await docker.container.get(containerId);
        } else {
            container = await docker.container.create({
                Image: config.ZOKRATES_IMAGE,
                HostConfig: {
                    Binds: [`${hostDirPath}:${config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS}:cached`],
                },
                Cmd: ['/bin/bash', '-c', 'tail -f /var/log/alternatives.log'],
            });
        }
        console.log(`手动链接容器: 'docker exec -ti ${container.id} bash'`);
        return await container.start();
    } catch (err) {
        return console.log(err);
    }
}

async function killContainer(container) {
    console.log('正在杀死容器');
    await container.stop();
    return container.delete({
        force: true,
    });
}

async function computeWitness(container, a, zkpPath) {
    console.log('\nCompute-witness...');

    let exec;
    // handle the case of debugging compute-witness through the setup tool (where no output path is specified):
    if (!zkpPath) {
        // then we're debugging
        console.log('./zokrates compute-witness', '-a', ...a);
        console.log(
            `(你可以在容器中运行上面这行命令来调试'compute-witness')`,
        );
        exec = await container.exec.create({
            Cmd: [config.ZOKRATES_APP_FILEPATH_ABS, 'compute-witness', '-a', ...a],
            AttachStdout: true,
            AttachStderr: true,
        });
    } else {
        let outPath = path.resolve(config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS, zkpPath, 'out');
        console.log('./zokrates compute-witness', '-a', ...a, '-i', outPath);
        console.log(
            `(你可以在容器中运行上面这行命令来调试'compute-witness')`,
        );
        exec = await container.exec.create({
            Cmd: [
                config.ZOKRATES_APP_FILEPATH_ABS,
                'compute-witness',
                '-a',
                ...a,
                '-i',
                outPath,
            ],
            AttachStdout: true,
            AttachStderr: true,
        });
    }
    return promisifyStream(await exec.start(), '计算witness'); // return a promisified stream
}

async function generateProof(container, b = config.ZOKRATES_BACKEND, zkpPath) {
    console.log('\n生成证明 Proof := P(pk,w,x)');

    console.log('证明算法：', b);

    const exec = await container.exec.create({
        Cmd: [
            config.ZOKRATES_APP_FILEPATH_ABS,
            'generate-proof',
            '--proving-scheme',
            b,
            '-p',
            path.resolve(config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS, zkpPath, 'proving.key'),
            '-i',
            path.resolve(config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS, zkpPath, 'out'),
        ],
        AttachStdout: true,
        AttachStderr: true,
    });

    await promisifyStream(await exec.start(), 'generate-proof'); // wait for console output to end
    // move the proof.json into the shared host folder annoyinly you can't get zokrates to write it here

    const exec2 = await container.exec.create({
        Cmd: [
            'mv',
            path.resolve(config.ZOKRATES_OUTPUTS_DIRPATH_ABS, 'proof.json'),
            path.resolve(config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS, zkpPath, 'proof.json'),
        ],
        AttachStdout: true,
        AttachStderr: true,
    });
    await promisifyStream(await exec2.start(), 'move-proof'); // wait for console output to end
    const proofFile = path.resolve(__dirname, '../code', zkpPath,'proof.json');
    let proof = {};
    if (fs.existsSync(proofFile)) {
        console.log('从json文件中读取 proof...');
        try {
            proof = await jsonfile.readFile(proofFile)
        } catch (err) {
            console.log('读取 proof 失败');
        }
        console.log('读取 proof.json, 结果为', proof);
        proof = proof.proof;
    } else {
        console.log(proofFile, '不存在');
    }
    // check the proof for reasonableness
    if (proof.a === undefined || proof.b === undefined || proof.c === undefined) {
        console.log('\nproof.a', proof.a, '\nproof.b', proof.b, '\nproof.c', proof.c);
        throw new Error('proof object does not contain a,b, or c parameter(s)');
    }
    proof.A = proof.a; // our code expects uppercase keys
    proof.B = proof.b;
    proof.C = proof.c;
    delete proof.a;
    delete proof.b;
    delete proof.c;
    return proof;
}

async function compile(container, codeFile) {
    console.log('Compiling code in the container - this can take some minutes...');
    const exec = await container.exec.create({
        Cmd: [
            config.ZOKRATES_APP_FILEPATH_ABS,
            'compile',
            '-i',
            config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS + codeFile,
        ],
        AttachStdout: true,
        AttachStderr: true,
    });
    return promisifyStream(await exec.start(), 'compile'); // return a promisified stream
}

async function setup(container, b = config.ZOKRATES_BACKEND) {
    console.log('Setup: computing (pk,vk) := G(C,toxic) - this can take many minutes...');

    const exec = await container.exec.create({
        Cmd: [config.ZOKRATES_APP_FILEPATH_ABS, 'setup', '--proving-scheme', b],
        AttachStdout: true,
        AttachStderr: true,
    });
    return promisifyStream(await exec.start(), 'setup'); // return a promisified stream
}
async function exportVerifier(container, b = config.ZOKRATES_BACKEND) {
    const exec = await container.exec.create({
        Cmd: [config.ZOKRATES_APP_FILEPATH_ABS, 'export-verifier', '--proving-scheme', b],
        AttachStdout: true,
        AttachStderr: true,
    });
    return promisifyStream(await exec.start(), 'export-verifier'); // return a promisified stream
}
module.exports = {
    runContainer,
    runContainerMounted,
    killContainer,
    computeWitness,
    generateProof,
    compile,
    setup,
    exportVerifier
};
