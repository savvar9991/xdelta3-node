# XDelta3-Node

A minimal [xdelta3](https://github.com/jmacd/xdelta/tree/release3_1_apl/xdelta3) native binding for NodeJs.

## Getting started

It's an esm module and have minimum interface with sensible defaults set in the binding itself. 

```ts
import {encodeSync, decodeSync} from "@chainsafe/xdelta3-node";

const state1 = Buffer.from("initial state", "utf8");
const state2 = Buffer.from("initial state + updates", "utf8");

// Get a Uint8Array binary patch
const patch = encodeSync(state1, state2);


// Apply the patch to reproduce the state2
const reproducedState = decodeSync(state1, patch);
```

## Prerequisites

- :gear: [NodeJS](https://nodejs.org/) (LTS)
- :toolbox: [Npm](https://docs.npmjs.com/)

## Contributors

Read our [contributors document](/CONTRIBUTING.md), [submit an issue](https://github.com/ChainSafe/xdelta3-node/issues/new/choose) or talk to us on our [Discord](https://discord.gg/yjyvFRP)!

## Donations

We are a local group of Toronto open-source developers. As such, all of our open-source work is funded by grants. We all take the time out of our hectic lives to contribute to the Ethereum ecosystem. If you want to donate, you can send us ETH at the following address: `lodestar.chainsafe.eth`
