import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { poseidon } from 'circomlibjs';
import contract from '../../contracts/contractconfig';
import { trimString } from '@/utils/utils';
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
import crypto from 'crypto';
import Input from '../Input';
import Button from '../Button';
import VoteCard from '../VoteCard';
import { toast } from 'react-toastify';
import Etherscan from '../Etherscan';
import { processErrors } from '@/utils/errors';
import { useModal } from 'connectkit';

const Register = ({ root, nLevels, secrets, setSecrets, setPoseidonHash, calcedSMT, poseidonHash }) => {
  const [addLeafTxLoading, setAddLeafTxLoading] = useState(false);
  const [addLeafCalldata, setAddLeafCalldata] = useState(0);
  const [voterCounter, setVoterCounter] = useState<number>(Number(BigInt(0)));
  const { address } = useAccount();
  const { setOpen: setWalletOpen } = useModal();

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

      let stringify = JSON.stringify(
        addLeafInputs,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value) // return everything else unchanged
      );

      const response = await fetch('/api/addvoter', {
        method: 'POST',
        body: stringify,
      });

      const leafData = await response
        .json()
        .then(async (res) => {
          if (response.status === 200) {
            setAddLeafCalldata(JSON.parse(res));

            const config = await prepareWriteContract({
              ...contract,
              functionName: 'addLeaf',
              args: JSON.parse(res),
            });

            const { hash, wait } = await writeContract(config);
            toast(<Etherscan hash={hash} />);

            const data = await waitForTransaction({
              hash,
            });

            toast('TX Confirmed');
            setAddLeafTxLoading(false);
            setSecrets([0, 0]);
            setPoseidonHash(undefined);
          } else {
            throw new Error(JSON.stringify(res));
          }
        })
        .catch(async (e) => {
          toast(`TX Error: ${trimString(e?.message ? processErrors(e.message) : e)}`);
          console.log(e);
          setAddLeafTxLoading(false);
          setSecrets([0, 0]);
          setPoseidonHash(undefined);
          // delete the leaf node, as transaction failed
          const res = await calcedSMT.delete(BigInt(voterCounter.toString()));
        });
    } catch (e) {
      toast(`TX Error: ${trimString(e?.message ? processErrors(e.message) : e)}`);
      // console.log('error in genAddLeafTx: ', e);
      setAddLeafTxLoading(false);
      setSecrets([0, 0]);
      setPoseidonHash(undefined);
      // delete the leaf node, as transaction failed
      const res = await calcedSMT.delete(BigInt(voterCounter.toString()));
    }
  };

  const handleUserInput = (value, isSecret) => {
    if (!address) {
      setWalletOpen(true);
      return;
    }
    let newSecret = [BigInt(value), address];
    setSecrets(newSecret);
    setPoseidonHash(poseidon(newSecret));
  };

  function generateSecrets() {
    if (!address) {
      setWalletOpen(true);
      return;
    }
    const randArr = [BigInt('0x' + crypto.randomBytes(8).toString('hex')), address];
    setAddLeafCalldata(0);
    setSecrets(randArr);
    setPoseidonHash(poseidon(randArr));
  }

  return (
    <>
      <VoteCard title={'register'}>
        <div className="flex flex-col items-center px-8 pt-4 pb-8 h-full">
          <div className="flex flex-col items-center flex-grow place-content-center">
            <Input
              label={'Voter ID'}
              type={'number'}
              disabled
              placeholder={''}
              value={voterCounter ? voterCounter : 0}
            />

            <Input
              label={'SECRET'}
              type={'number'}
              placeholder={'enter secret number'}
              value={Number(secrets[0]) > 0 ? Number(secrets[0]) : ''}
              onChange={(e) => handleUserInput(e.target.value, true)}
            />

            <button className="btn glass btn-xs m-2 mb-4 text-xs" onClick={() => generateSecrets()}>
              Generate Random
            </button>
          </div>

          <div className="mt-auto place-content-center items-center text-center">
            <p className="italic m-2 max-w-md text-xs max-w-xs pb-2">
              Before registering, write down your voter ID and secret. You will need them to vote using the wallet you
              registered with.
            </p>
            <Button
              text={addLeafTxLoading ? 'REGISTERING...' : 'REGISTER'}
              className={`mt-auto ${addLeafTxLoading && 'loading'}`}
              disabled={!secrets[1] || !secrets[0]}
              onClick={() => (address ? genAddLeafTx() : setWalletOpen(true))}
            />
          </div>
        </div>
      </VoteCard>
    </>
  );
};

export default Register;
