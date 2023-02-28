import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { parseSolidityCalldata } from '@/utils/utils';

const snarkjs = require('snarkjs');

const directory = path.join(process.cwd(), 'circuits');

const proveInTreeWasm = path.join(directory, '/proveInTree.wasm');
const proveInTreeZkey = path.join(directory, '/proveInTree.zkey');

export default async function provevoter(req: NextApiRequest, res: NextApiResponse) {
  try {
    let parsed = JSON.parse(req.body);

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
    if (verified === true) {
      res.status(200).json(JSON.stringify(calldata));
    } else {
      res.status(400).json('Invalid Proof');
    }
  } catch (e) {
    res.status(500).json('Internal Server Error');
  }
}
