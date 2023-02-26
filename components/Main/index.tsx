import React, { useEffect, useState } from 'react';
import { useAccount, useContractEvent, useContractRead } from 'wagmi';
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

  const { address } = useAccount();

  const { data: root }: any = useContractRead({
    ...contract,
    functionName: 'root',
    watch: true,
  });

  useContractEvent({
    ...contract,
    eventName: 'AddLeaf',
    async listener(node, resolver) {
      console.log('add leaf event: ', node);
    },
  });

  // useEffect(() => {
  //   let lfv = {};
  //   for (let i = addLeafEvents.length - 1; i >= 0; i--) {
  //     lfv[addLeafEvents[i].args.key] = addLeafEvents[i].args.value.toString();
  //     // lfv.push(addLeafEvents[i].args.value);
  //   }
  //   setLeaves(lfv);
  // }, [addLeafEvents]);

  const calcedSMT = useSMT(leaves);

  const title = ['Z', 'K', ` `, 'V', 'o', 'T', 'I', 'N', 'g'];

  return (
    <div className="h-screen overflow-hidden background-80s stars">
      <div className="overlay" />
      <div>
        <div className="text-center text-9xl italic double-layer ">
          {title.map((letter, i) => (
            <span key={`${letter}${i}`} className="font-arcade glow" data-title={letter}>
              {letter}
            </span>
          ))}
        </div>
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

      {/* <div className="sun"></div> */}
      {/* 
      <div className="graph-container">
        <div className="graph"></div>
      </div> */}
    </div>
  );
};

export default Main;
