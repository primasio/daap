# 必要环境
1. 安装[Docker](https://www.docker.com/get-started)。本项目运行时将会自动拉取zokrates:0.4.11的镜像，并调用该镜像；
2. 安装[Node.js](https://nodejs.org/en/)；
3. 安装Python2.7；
   - npm设置使用python2.7: ```npm config set python path/to/python2.7```
4. 安装Truffle，用于智能合约的编译和部署；
   - ```npm install -g truffle```
5. 安装[Ganache](https://www.trufflesuite.com/ganache)，用于启动一个本地的以太坊测试节点。

# Trust setup
首先安装node依赖，在项目根目录执行：
```shell script
npm install
```
执行如下命令：进入到zkp目录，进行 trust setup
```shell script
cd zkp
npm run setup -- -i gm17/parent-dir-of-pcode/
```
```-i```参数用于指定zokrates代码存放的目录（.code文件）

或者可以直接执行命令：
```shell script
npm run setup
```
这样会一次性执行所有```zkp/code```目录下的所有.code代码的trust setup过程。这一步需要的时间较长，取决于机器的性能，可能花费30分钟到1个小时左右。

# 文件输出
```npm run setup```命令将会执行如下过程：
- compile: 编译指定的zokrates代码，生成```out``` ```out.code ```
- setup: ```proof.json``` ```proving.key```
- export-verifier: ```verification.key``` ```verifier.sol```

这些文件先在docker容器内生成，然后再被移动到各个操作对应的项目路径 ```zkp/code/gm17/parent-dir-of-pcode```
# 协议演示
1. 在本地环境启动Ganache节点，确保节点启动后的参数与[truffle-config.js](../truffle-config.js)中一致；
2. 在项目根目录执行```truffle migrate --reset``` 或者 ```npm run deploy```，编译并部署项目用到的所有智能合约
3. 注册vkId：```npm run setVk```
4. 验证匿名授权协议的所有流程：```npm run daap```

注意：改动zokrates代码或合约后，需要重新部署合约和注册vkId，此时需要删除文件 ```zkp/src/vkIds.json```
