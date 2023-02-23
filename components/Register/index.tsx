import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractEvent } from 'wagmi';
import { poseidon } from 'circomlibjs';
import contract from '../../contracts/contractconfig';
import { parseSolidityCalldata } from '@/utils/utils';
import { prepareWriteContract, writeContract } from '@wagmi/core';
import Loading from '../Loading';

const Register = ({ root, nLevels, secrets, setSecrets, setPoseidonHash, calcedSMT, poseidonHash }) => {
  const [addLeafTxLoading, setAddLeafTxLoading] = useState(false);
  const [addLeafCalldata, setAddLeafCalldata] = useState();

  const { address } = useAccount();

  useContractEvent({
    ...contract,
    eventName: 'AddLeaf',
    listener(node, resolver) {
      console.log('AddLeaf event: ', node, resolver);
    },
  });

  const { data: voteNonceData }: any = useContractRead({
    ...contract,
    functionName: 'voteNonce',
  });
  const { data: memberData }: any = useContractRead({
    ...contract,
    functionName: 'nextKey',
  });

  const [memberCount, setMemberCount] = useState(BigInt(0));

  useEffect(() => {
    setMemberCount(memberData);
  }, [memberData]);

  const genAddLeafTx = async () => {
    setAddLeafTxLoading(true);
    try {
      let addLeafInputs = {
        oldRoot: BigInt(root.toString()),
        newKey: BigInt(memberCount.toString()),
        newValue: poseidonHash,
        oldKey: '0',
        oldValue: '0',
        siblings: new Array(nLevels).fill('0'),
      };

      const res = await calcedSMT.insert(BigInt(memberCount.toString()), poseidonHash);

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
      console.log('leaf data: ', JSON.parse(leafData));

      // TODO - use wagmi core
      // const t = await tx(writeContracts.ZKVoting.addLeaf(...calldata));

      const config = await prepareWriteContract({
        ...contract,
        functionName: 'addLeaf',
        args: JSON.parse(leafData),
      });

      const tx = await writeContract(config);

      console.log('data write result: ', tx);

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

  // function generateSecrets() {
  //   const randArr = [
  //     BigInt('0x' + crypto.randomBytes(32).toString('hex')),
  //     BigInt('0x' + crypto.randomBytes(32).toString('hex')),
  //   ];
  //   setAddLeafCalldata(0);
  //   setSecrets(randArr);
  //   setPoseidonHash(poseidon(randArr));
  // }

  return (
    <div className="votingCard flex flex-col items-center">
      {/* <button className="btn" onClick={() => callApi()}>
        call api
      </button> */}
      {memberCount && <p style={{ color: 'grey' }}>{`${Number(memberCount)} Registered Voters`}</p>}
      <input
        type="number"
        disabled
        value={memberCount ? Number(memberCount) : ''}
        placeholder="Voter ID"
        className="input input-bordered input-primary  w-full max-w-xs"
      />
      <input
        type="number"
        placeholder="enter secret number"
        className="input input-bordered input-primary w-full max-w-xs"
        value={Number(secrets[0]) > 0 ? Number(secrets[0]) : ''}
        onChange={(e) => handleUserInput(e.target.value, true)}
      />
      {/* <div>
        <button onClick={() => generateSecrets()}>Generate Random</button>
      </div> */}
      {/* {addLeafTxLoading ? (
        <Loading textInput="Joining..." />
      ) : ( */}

      <button className="btn btn-primary" disabled={!secrets[1] || !secrets[0]} onClick={() => genAddLeafTx()}>
        Register
      </button>

      {/* )} */}
    </div>
  );
};

export default Register;
