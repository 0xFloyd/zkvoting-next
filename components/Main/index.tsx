import React, { useState } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import contract from '../../contracts/contractconfig';
import useSMT from '../../hooks/useSMT';
import { poseidon } from 'circomlibjs';
import Register from '../Register';

const nLevels = 3;

const Main = () => {
  const [secrets, setSecrets] = useState<Array<bigint | `0x${string}`>>([BigInt(0), BigInt(0)]);
  const [poseidonHash, setPoseidonHash] = useState();

  const [memberKey, setMemberKey] = useState();
  const [memberSecret, setMemberSecret] = useState();

  const [vote, setVote] = useState(null);

  const [activeVoteId, setActiveVoteId] = useState(null);
  const [campaignInput, setCampaignInput] = useState('');

  const [proveMembershipLoading, setProveMembershipLoading] = useState(false);
  const [addLeafTxLoading, setAddLeafTxLoading] = useState(false);
  const [voteCampaigns, setVoteCampaigns] = useState([]);

  const [addLeafCalldata, setAddLeafCalldata] = useState(0);
  const [leaves, setLeaves] = useState({});

  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);

  const calcedSMT = useSMT(leaves);

  const { address } = useAccount();

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

  const handleUserInput = (value, isSecret) => {
    let newSecret = [BigInt(value), address];

    setSecrets(newSecret);

    setPoseidonHash(poseidon(newSecret));
  };

  return (
    <div className="h-screen">
      <div className="grid grid-cols-2 gap-12 max-w-7xl mx-auto">
        <Register
          nLevels={nLevels}
          secrets={secrets}
          setSecrets={setSecrets}
          setPoseidonHash={setPoseidonHash}
          calcedSMT={calcedSMT}
          poseidonHash={poseidonHash}
        />
        <div className="votingCard flex flex-col items-center">
          <input type="text" placeholder="Type here" className="input input-bordered input-primary  w-full max-w-xs" />
          <input type="text" placeholder="Type here" className="input input-bordered input-primary w-full max-w-xs" />
        </div>
      </div>
    </div>
  );
};

export default Main;
