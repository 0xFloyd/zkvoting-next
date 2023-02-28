import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { parseSolidityCalldata } from '@/utils/utils';

const snarkjs = require('snarkjs');

const directory = path.join(process.cwd(), 'circuits');

const add2TreeWasm = path.join(directory, '/add2Tree.wasm');
const add2TreeZkey = path.join(directory, '/add2Tree.zkey');

export default async function addvoter(req: NextApiRequest, res: NextApiResponse) {
  try {
    let parsed = JSON.parse(req.body);

    let transform = {
      oldRoot: BigInt(parsed.oldRoot),
      newKey: BigInt(parsed.newKey),
      newValue: parsed.newValue,
      oldKey: BigInt(parsed.oldKey),
      oldValue: BigInt(parsed.oldValue),
      siblings: parsed.siblings,
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(transform, add2TreeWasm, add2TreeZkey);
    const calldata = parseSolidityCalldata(proof, publicSignals);

    res.status(200).json(JSON.stringify(calldata));
  } catch (e) {
    res.status(500).json(e?.message ? e?.message : e);
  }
}
