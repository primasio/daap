# Requirements
1. Install [Docker](https://www.docker.com/get-started);
2. Install [Node.js](https://nodejs.org/en/)；
3. Install Python2.7；
   - npm configuration: ```npm config set python path/to/python2.7```
4. Install Truffle；
   - ```npm install -g truffle```
5. Install [Ganache](https://www.trufflesuite.com/ganache).

# Trust setup
Under the root directory of project：
```shell script
npm install
```
then
```shell script
cd zkp
npm run setup -- -i gm17/parent-dir-of-pcode/
```
```-i``` Specify the directory where the ***ZoKrates*** code is stored (.code file)

Alternatively you can process _all_ of the folders under `/gm17` in one go by using:
```shell script
npm run setup
```
Note that this will take about 1hr to complete.

# Outputs
```npm run setup``` will：
- compile: ```out``` ```out.code ```
- setup: ```proof.json``` ```proving.key```
- export-verifier: ```verification.key``` ```verifier.sol```

These files are generated inside the docker container and then moved to the project path corresponding to each operation ```zkp/code/gm17/parent-dir-of-pcode```

# Demonstrate
1. Start the Ganache node in the local environment and ensure that the parameters after the running node are consistent with [truffle-config.js](../truffle-config.js);
2. Run ```truffle migrate --reset``` or ```npm run deploy``` under the root directory, This will compile and deploy all smart contracts used by the project.
3. Register the vkId：```npm run setVk```
4. All processes for verifying the protocol：```npm run daap```

Note：After changing the ***ZoKrates*** or ***solidity*** code, you need to delete the file ```zkp/src/vkIds.json``` , and then redeploy the contract and register the vkId. 
