import React, { useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import contract from '../../contracts/contractconfig';
import useSMT from '../../hooks/useSMT';
import { poseidon } from 'circomlibjs';
import Register from '../Register';
import Vote from '../Vote';

const nLevels = 3;

const Main = () => {
  const [secrets, setSecrets] = useState<Array<bigint | `0x${string}`>>([BigInt(0), BigInt(0)]);
  const [poseidonHash, setPoseidonHash] = useState();

  const [leaves, setLeaves] = useState({});

  const calcedSMT = useSMT(leaves);

  const { address } = useAccount();

  const { data: root }: any = useContractRead({
    ...contract,
    functionName: 'root',
  });

  // const [leaves, setLeaves] = useState({});
  // useEffect(() => {
  //   let lfv = {};
  //   for (let i = addLeafEvents.length - 1; i >= 0; i--) {
  //     lfv[addLeafEvents[i].args.key] = addLeafEvents[i].args.value.toString();
  //     // lfv.push(addLeafEvents[i].args.value);
  //   }
  //   setLeaves(lfv);
  // }, [addLeafEvents]);

  // const calcedSMT = useSMT(leaves);

  return (
    <div className="h-screen">
      <div className="grid grid-cols-2 gap-12 max-w-7xl mx-auto">
        <Register
          root={root}
          nLevels={nLevels}
          secrets={secrets}
          setSecrets={setSecrets}
          setPoseidonHash={setPoseidonHash}
          calcedSMT={calcedSMT}
          poseidonHash={poseidonHash}
        />
        <Vote root={root} nLevels={nLevels} calcedSMT={calcedSMT} />
      </div>
    </div>
  );
};

export default Main;
