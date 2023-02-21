import React, { useState } from 'react';

const Main = () => {
  const [secrets, setSecrets] = useState([BigInt(0), BigInt(0)]);
  const [poseidonHash, setPoseidonHash] = useState();

  const [memberKey, setMemberKey] = useState();
  const [memberSecret, setMemberSecret] = useState();

  const [vote, setVote] = useState(null);

  const [activeVoteId, setActiveVoteId] = useState(null);
  const [campaignInput, setCampaignInput] = useState('');

  const [proveMembershipLoading, setProveMembershipLoading] = useState(false);
  const [addLeafTxLoading, setAddLeafTxLoading] = useState(false);
  const [voteCampaigns, setVoteCampaigns] = useState([]);

  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);

  return (
    <div className="h-screen">
      <div className="grid grid-cols-2 gap-12 max-w-7xl mx-auto">
        <div className="votingCard flex flex-col items-center">
          <input
            type="number"
            disabled
            placeholder="Voter ID"
            className="input input-bordered input-primary  w-full max-w-xs"
          />
          <input
            type="number"
            placeholder="enter secret number"
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div className="votingCard flex flex-col items-center">
          <input type="text" placeholder="Type here" className="input input-bordered input-primary  w-full max-w-xs" />
          <input type="text" placeholder="Type here" className="input input-bordered input-primary w-full max-w-xs" />
        </div>
      </div>
    </div>
  );
};

export default Main;
