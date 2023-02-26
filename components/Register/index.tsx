import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractEvent } from 'wagmi';
import { poseidon } from 'circomlibjs';
import contract, { readContractFunction } from '../../contracts/contractconfig';
import { parseSolidityCalldata } from '@/utils/utils';
import { prepareWriteContract, writeContract } from '@wagmi/core';
import Loading from '../Loading';
import crypto from 'crypto';
import Input from '../Input';

const Register = ({ root, nLevels, secrets, setSecrets, setPoseidonHash, calcedSMT, poseidonHash }) => {
  const [addLeafTxLoading, setAddLeafTxLoading] = useState(false);
  const [addLeafCalldata, setAddLeafCalldata] = useState(0);
  const [voterCounter, setVoterCounter] = useState<number>(Number(BigInt(0)));
  const { address } = useAccount();

  const { data: voterCount }: any = useContractRead({
    ...contract,
    functionName: 'nextKey',
    watch: true,
  });

  useEffect(() => {
    setVoterCounter(Number(voterCount));
  }, [voterCount]);

  const genAddLeafTx = async () => {
    setAddLeafTxLoading(true);
    try {
      let addLeafInputs = {
        oldRoot: BigInt(root.toString()),
        newKey: BigInt(voterCounter.toString()),
        newValue: poseidonHash,
        oldKey: '0',
        oldValue: '0',
        siblings: new Array(nLevels).fill('0'),
      };

      const res = await calcedSMT.insert(BigInt(voterCounter.toString()), poseidonHash);

      addLeafInputs.oldKey = res.oldKey;
      addLeafInputs.oldValue = res.oldValue;

      for (let i = 0; i < addLeafInputs.siblings.length; i++) {
        if (res.siblings[i]) {
          addLeafInputs.siblings[i] = res.siblings[i];
        }
      }

      // console.log('addLeafInputs:', addLeafInputs);

      let stringify = JSON.stringify(
        addLeafInputs,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
      );

      const response = await fetch('/api/addvoter', {
        method: 'POST',
        body: stringify,
      });

      // TODO only if successful 200 response
      const leafData = await response.json();

      setAddLeafCalldata(JSON.parse(leafData));

      const config = await prepareWriteContract({
        ...contract,
        functionName: 'addLeaf',
        args: JSON.parse(leafData),
      });

      const tx = await writeContract(config);
      const result = await tx.wait();
      console.log('tx confirmed! result: ', result);

      setAddLeafTxLoading(false);
      setSecrets([0, 0]);
      setPoseidonHash(undefined);
    } catch (e) {
      console.log('error in genAddLeafTx: ', e);
      setAddLeafTxLoading(false);
      setSecrets([0, 0]);
      setPoseidonHash(undefined);
    }
  };

  const handleUserInput = (value, isSecret) => {
    let newSecret = [BigInt(value), address];
    setSecrets(newSecret);
    setPoseidonHash(poseidon(newSecret));
  };

  function generateSecrets() {
    const randArr = [
      BigInt('0x' + crypto.randomBytes(8).toString('hex')),
      BigInt('0x' + crypto.randomBytes(8).toString('hex')),
    ];
    setAddLeafCalldata(0);
    setSecrets(randArr);
    setPoseidonHash(poseidon(randArr));
  }

  return (
    <div className="votingCard flex flex-col items-center p-8">
      {voterCounter ? <p className="arcade">{`${voterCounter} Registered Voters`}</p> : null}
      <div className="mt-1 flex rounded-md shadow-sm">
        <span className="arcade inline-flex items-center rounded-l-md border-r-0 px-3 sm:text-sm">Voter ID</span>
        <p className="arcade">{voterCounter ? voterCounter : 0}</p>
      </div>
      {/* <div className="mt-1 flex rounded-md shadow-sm">
        <span className="inline-flex items-center rounded-l-md   border-r-0 px-3 sm:text-sm">Secret</span>
        <input
          type="number"
          placeholder="enter secret number"
          className="input input-bordered w-full max-w-xs border-l-0 rounded-l-none focus:outline-none border-2 focus:border-red-500"
          value={Number(secrets[0]) > 0 ? Number(secrets[0]) : ''}
          onChange={(e) => handleUserInput(e.target.value, true)}
        />
      </div> */}
      <Input
        label={'Secret'}
        type={'number'}
        placeholder={'enter secret number'}
        value={Number(secrets[0]) > 0 ? Number(secrets[0]) : ''}
        onChange={(e) => handleUserInput(e.target.value, true)}
      />

      <button className="btn glass btn-sm m-2" onClick={() => generateSecrets()}>
        Generate Random
      </button>

      <p className="italic m-2 max-w-md text-xs">
        Before registering, write down your voter ID and secret. You will need them to vote using the wallet you
        registered with.
      </p>
      <button
        className={`btn glass ${addLeafTxLoading && 'loading'}`}
        disabled={!secrets[1] || !secrets[0]}
        onClick={() => genAddLeafTx()}
      >
        {addLeafTxLoading ? 'REGISTERING...' : 'REGISTER'}
      </button>
    </div>
  );
};

export default Register;
