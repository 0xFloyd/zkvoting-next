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

export default async function provevoter(req: NextApiRequest, res: NextApiResponse) {
  // console.log('req: ', req);
  try {
    let hmm = req.body;
    let parsed = JSON.parse(req.body);
    console.log('provevoter parsed: ', parsed);

    let transform = {
      root: BigInt(parsed.root),
      voteId: BigInt(parsed.voteId),
      key: parsed.key,
      secret: BigInt(parsed.secret),
      nullifier: parsed.nullifier,
      siblings: parsed.siblings,
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(transform, proveInTreeWasm, proveInTreeZkey);
    const calldata = parseSolidityCalldata(proof, publicSignals);

    const vkey = await snarkjs.zKey.exportVerificationKey(proveInTreeZkey);
    const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);

    res.status(200).json(JSON.stringify(calldata));
  } catch (e) {
    res.status(500).json({ name: 'John Doe' });
  }
}
