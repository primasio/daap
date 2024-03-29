# 基于零知识证明的数字资产私密发布和授权协议

[中文](./README-cn.md) | [English](./README.md)

# 基于零知识证明的数字资产私密发布和授权协议

## 概述

零知识证明是目前区块链研究最为火热的领域之一，有望在扩容和隐私保护两个方向为区块链带来巨大的突破。

众所周知，在区块链上存储的数据是全部公开的，任何人都可以获取、解析所有的区块数据。这极大地限制了区块链的应用场景。例如，在比特币等采用UTXO模型设计的区块链系统中，每一笔UTXO的流动都是公开的，匿名性的保证是通过隐藏人和地址的对应关系来实现，一旦某一个地址和人的对应关系暴露，再配合一些链上数据分析工具，基本上可以追踪到这个人的全部交易记录和资金数量。在以太坊等智能合约区块链中，每一个合约的代码、每一次合约调用的参数也都是完全公开的，所有数据对所有人可见。

而零知识证明恰好可以用来解决这个问题。关于零知识证明的原理在本文中不再赘述。通过一些巧妙的方案设计，我们可以使用零知识证明来保证链上没有任何公开的数据，同时不影响区块链的正常功能。比如[ZCash](https://z.cash)项目，就通过零知识证明设计了交易记录混合方案，实现了和比特币一样的功能，但是链上不存储任何一笔交易的具体信息（发送人、接收人、金额等）。

区块链的应用远远不止Token转账这一种。人类社会正在经历信息革命带来的巨大冲击，从企业的视角来看，大部分企业正在经历从制造型企业到创新型企业的转型。企业的核心生产资料，正在从资金、厂房、原料等转变为人、知识（信息）、知识形成的网络，专业的说法叫“社会资本”。在这样的大背景下，知识类资料、成果等数字资产的保护和有效流通对企业来说就变得尤其重要。

区块链在帮助数字资产流通上有着天生的优势，但是却在保护数字资产的隐私性上有很大的劣势。以太坊上的ERC-721、ERC-1155提案实现了对非同质化Token（NFT）的标准化，使得在区块链上进行数字资产的发行、交易变得非常容易。但是资产的所有权、转移记录，对外都是完全公开的，这无疑暴露了企业的很多敏感信息。

安永（EY）之前发布的[Nightfall](https://github.com/EYBlockchain/nightfall)项目，实现了对以太坊上ERC-721类资产私密转账的支持。但是ERC-721的使用使得资产的注册是必须公开的，在资产注册以后转入一个私密合约，之后的转移操作才是对外不可见的。另外，对于文章、图片等类型的数字资产，最重要的流通方式不是所有权的转移，而是使用权的购买。比如文章的转载权购买、图片的购买使用等。对于这类数字资产，使用NFT模型抽象是不够的，也就更加无法实现使用权的私密购买。

针对这样的场景，我们设计了数字资产的私密发布和私密授权协议。基于零知识证明实现了如下的功能：

***1. 可以在链上发布数字资产，但是隐藏数字资产的所有者。***

用发布图片来举例子。比如，我可以在链上注册一张图片，链上没有这张图片的原始内容，只有图片的哈希值和ID。从链上也看不出这张图片是我发的。

下一步，假如我还需要证明我对图片的所有权，我在某个媒体上发布这张图片时可以附带一段“文本”，将这段文本拿到区块链上查询，可以证明我是这张图片的作者。但是单独通过链上数据，任何人都无法查到我还有哪些其他图片。其他人即使有了这段文本，也无法伪造所有权证明，也无法对图片进行售卖。

***2. 可以在链上进行数字资产的使用授权，但是隐藏授权的购买者、所有者以及数字资产信息。***

比如，我在媒体上看到一张图片，可以付费购买使用权，但是没有人知道我从谁手里买了什么。在我的博客里使用购买的图片时我也可以附带一段“文本”，通过这段文本可以在链上确认我的付费购买的有效性，但是无法查到我的其他任何购买记录，也无法查到我是从谁手里购买了这张图片。

通过上述的功能，我们实现了图片发布、购买的全流程隐私保护。同时也支持在必要时公开一些信息，用以证明所有权，并且不暴露任何其他的额外隐私信息。

需要注意的是，虽然我们用了图片来举例子，但是这个协议实现的功能可以用在任何类型的数字资产的注册和授权上。

在我们现有的代码实现中，使用了[ZoKrates](https://github.com/Zokrates/ZoKrates)工具包，具体的零知识证明算法使用了[Groth 16](https://eprint.iacr.org/2016/260.pdf)。由于零知识证明的通用性，具体使用的算法几乎不影响上层的协议设计。因此实现协议时也可以使用[Bellman](https://github.com/zkcrypto/bellman)工具包,或者将算法替换为[Bulletproofs](https://github.com/dalek-cryptography/bulletproofs)或者是[Sonic](https://eprint.iacr.org/2019/099)算法，以实现更好的性能，以及去除对可信初始化的依赖。

## 使用说明

如果你想要自己运行本项目，或者测试项目中包含的一些例子。请参考 [使用说明](docs/getting-started-cn.md).

## 协议规范

想要更进一步了解daap协议设计的详情, 请参考 [协议规范](docs/protocol-cn.md)。想要理解协议中零知识证明的应用方式，可以阅读我们的知乎专栏文章
[零知识证明应用——在区块链上生成可验证的匿名记录](https://zhuanlan.zhihu.com/p/94689517)

## 加入社区

Slack: [delta-mpc](https://join.slack.com/t/delta-mpc/shared_invite/zt-uaqm185x-52oCXcxoYvRlFwEoMUC8Tw). 请加入 #daap 频道.

Email: [hi@primas.io](mailto:hi@primas.io)

微信ID: lencyforce

## 合作

欢迎提交PR.
提交issues, 或者在你的项目中引用本协议.
