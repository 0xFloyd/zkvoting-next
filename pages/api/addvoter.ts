// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import serverPath from '../../utils/server';
import getConfig from 'next/config';
import path from 'path';
import { parseSolidityCalldata } from '@/utils/utils';

const snarkjs = require('snarkjs');
const crypto = require('crypto');

const projectRoot = getConfig().serverRuntimeConfig.PROJECT_ROOT;

const add2TreeWasm = path.join(projectRoot, '/circuits/add2Tree.wasm');
const add2TreeZkey = path.join(projectRoot, '/circuits/add2Tree.zkey');
const proveInTreeWasm = path.join(projectRoot, '/circuits/proveInTree.wasm');
const proveInTreeZkey = path.join(projectRoot, '/circuits/proveInTree.zkey');

const BIGINTKETS = {
  oldRoot: true,
  newKey: true,
};

export default async function addvoter(req: NextApiRequest, res: NextApiResponse) {
  // console.log('req: ', req);

  try {
    let hmm = req.body;
    let parsed = JSON.parse(req.body);
    // console.log('parsed: ', parsed);

    let transform = {
      oldRoot: BigInt(parsed.oldRoot),
      newKey: BigInt(parsed.newKey),
      newValue: parsed.newValue,
      oldKey: BigInt(parsed.oldKey),
      oldValue: BigInt(parsed.oldValue),
      siblings: parsed.siblings,
    };
    // let addLeafInputs = {
    //   oldRoot: BigInt(root.toString()),
    //   newKey: BigInt(memberId.toString()),
    //   newValue: poseidonHash,s
    //   oldValue: '0',
    //   siblings: new Array(nLevels).fill('0'),
    // };
    // const res = await calcedSMT.insert(BigInt(memberId.toString()), poseidonHash);
    // addLeafInputs.oldKey = res.oldKey;
    // addLeafInputs.oldValue = res.oldValue;
    // for (let i = 0; i < addLeafInputs.siblings.length; i++) {
    //   if (res.siblings[i]) {
    //     addLeafInputs.siblings[i] = res.siblings[i];
    //   }
    // }
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(transform, add2TreeWasm, add2TreeZkey);
    const calldata = parseSolidityCalldata(proof, publicSignals);

    res.status(200).json(JSON.stringify(calldata));
  } catch (e) {
    res.status(500).json(e?.message ? e?.message : e);
  }
}
