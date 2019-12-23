# 环境
- Docker
  - 在docker内拉取zokrates:0.4.11的镜像
- Python2.7
  - npm设置使用python2.7: ```npm config set python path/to/python2.7```
- Node
  - 已在node v13.3.0上测试通过
- Truffle
  - ```npm install -g truffle```
- [Ganache](https://www.trufflesuite.com/ganache)

# Trust setup
首先安装node依赖（项目根目录）：
```shell script
npm install
```
然后进入到zkp目录，执行如下命令进行trust setup
```shell script
cd zkp
npm run setup -- -i gm17/parent-dir-of-pcode/
```
```-i```参数用于指定zokrates代码存放的目录（.code文件）

或者可以直接执行命令：
```shell script
npm run setup
```
这样会一次性执行所有```zkp/code```目录下的所有.code代码的trust setup过程

# 输出文件
```npm run setup```命令将会执行如下过程：
- compile: 编译指定的zokrates代码，生成```out``` ```out.code ```
- setup: ```proof.json``` ```proving.key```
- export-verifier: ```verification.key``` ```verifier.sol```

# 协议演示
1. 在本地环境启动Ganache节点
2. 在项目根目录执行```truffle migrate --reset``，编译并部署项目用到的所有智能合约
3. 注册vkId：```npm run setVk```
4. 验证匿名授权协议的所有流程：```npm run daap```

注意：改动zokrates代码或合约后，需要重新部署合约和注册vkId
