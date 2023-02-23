import contract from '@/contracts/contractconfig';
import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractEvent } from 'wagmi';
import { readContract, writeContract, prepareWriteContract } from '@wagmi/core';

const Vote = ({ root, nLevels, calcedSMT }) => {
  const [voteCampaigns, setVoteCampaigns] = useState([]);
  const [activeVoteId, setActiveVoteId] = useState<string | number>('');
  const [campaignInput, setCampaignInput] = useState('');

  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);

  const [vote, setVote] = useState(null);
  const [proveMembershipLoading, setProveMembershipLoading] = useState(false);
  const [proveMemCalldata, setProveMemCalldata] = useState();

  const [memberKey, setMemberKey] = useState('');
  const [memberSecret, setMemberSecret] = useState('');

  const { data: voteNonce }: any = useContractRead({
    ...contract,
    functionName: 'voteNonce',
  });

  const { address } = useAccount();

  const genProveMemberTx = async () => {
    setProveMembershipLoading(true);

    try {
      let proveMemberInputs = {
        root: BigInt(root.toString()),
        voteId: activeVoteId,
        key: memberKey,
        secret: memberSecret,
        nullifier: address, // memberNullifier
        siblings: new Array(nLevels + 1).fill(BigInt(0)),
      };

      const res = await calcedSMT.find(memberKey);

      for (let i = 0; i < proveMemberInputs.siblings.length; i++) {
        if (res.siblings[i]) {
          proveMemberInputs.siblings[i] = res.siblings[i];
        }
      }

      let stringify = JSON.stringify(proveMemberInputs, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );

      const response = await fetch('/api/provevoter', {
        method: 'POST',
        body: stringify,
      });

      // TODO only if successful 200 response
      const data = await response.json();
      console.log('provevoter response json: ', JSON.parse(data));
      setProveMemCalldata(JSON.parse(data));

      const config = await prepareWriteContract({
        ...contract,
        functionName: 'proveMembership',
        args: [...JSON.parse(data), vote],
      });

      const tx = await writeContract(config);

      // get new vote counts
      const positive = await readContract({
        ...contract,
        functionName: 'positiveVoteResult',
        args: [activeVoteId],
      });

      const negative = await readContract({
        ...contract,
        functionName: 'negativeVoteResult',
        args: [activeVoteId],
      });

      setPositiveCount(positive ? Number(positive.toString()) : 0);
      setNegativeCount(negative ? Number(negative.toString()) : 0);

      setMemberKey(undefined);
      setMemberSecret(undefined);

      setProveMembershipLoading(false);
      setVote(null);
    } catch (e) {
      console.log('error voting: ', e);
      setProveMembershipLoading(false);
    }
  };

  const createNewVoteCampaign = async () => {
    try {
      const config = await prepareWriteContract({
        ...contract,
        functionName: 'createVote',
        args: [Math.floor(Date.now() / 1000) + 10000, campaignInput],
      });

      const tx = await writeContract(config);
      console.log('tx result: ', tx);
      setCampaignInput('');
    } catch (e) {
      console.log('e: ', e);
    }
  };

  const fetchCampaigns = async () => {
    let campaigns = [];
    for (let i = 0; i < voteNonce; i++) {
      const campaignName = await readContract({
        ...contract,
        functionName: 'voteName',
        args: [i],
      });

      campaigns.push({ id: i, name: campaignName });
    }
    setVoteCampaigns(campaigns);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [voteNonce]);

  useEffect(() => {
    const fetchVoteCounts = async () => {
      if (activeVoteId || activeVoteId === 0) {
        const positive = await readContract({
          ...contract,
          functionName: 'positiveVoteResult',
          args: [activeVoteId],
        });

        const negative = await readContract({
          ...contract,
          functionName: 'negativeVoteResult',
          args: [activeVoteId],
        });

        setPositiveCount(positive ? Number(positive.toString()) : 0);
        setNegativeCount(negative ? Number(negative.toString()) : 0);
        setVote(null);
      }
    };

    fetchVoteCounts();
  }, [activeVoteId]);

  useContractEvent({
    ...contract,
    eventName: 'CreateVote',
    listener(node, resolver) {
      fetchCampaigns();
      console.log('CreateVote event: ', node, resolver);
    },
  });

  console.log('voteCampaigns: ', voteCampaigns);
  console.log('activeVoteId: ', activeVoteId);

  let camp = activeVoteId && voteCampaigns.find((campaign) => campaign.id === activeVoteId);
  console.log('camp: ', camp);

  return (
    <div className="votingCard flex flex-col items-center">
      {activeVoteId ? (
        <div>
          <p>{`${camp ? camp?.label : ''} Campaign`}</p>
          <div className="grid grid-cols-2">
            <p>{positiveCount}</p>
            <p>{negativeCount}</p>
          </div>
          <div>
            <input
              className="input input-bordered input-primary w-full max-w-xs"
              placeholder="enter member ID # "
              value={memberKey}
              onChange={(n) => setMemberKey(n.target.value)}
            />
            <input
              className="input input-bordered input-primary w-full max-w-xs"
              placeholder="enter secret"
              value={memberSecret}
              onChange={(n) => setMemberSecret(n.target.value)}
            />
          </div>

          <div className="flex flex-row items-center gap-12 place-content-center">
            <div className="">
              <input
                onChange={() => setVote(true)}
                checked={vote === true}
                style={{ width: '1rem', height: '1rem' }}
                type="checkbox"
                name="yes"
              />
              <label
                htmlFor="yes"
                style={{
                  marginLeft: '0.5rem',
                  padding: 'auto',
                  verticalAlign: 'center',
                  fontSize: '1.25rem',
                  marginBottom: '0px',
                }}
              >
                YES
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', placeContent: 'center' }}>
              <input
                checked={vote === false}
                style={{ width: '1rem', height: '1rem' }}
                type="checkbox"
                name="no"
                onChange={() => setVote(false)}
              />
              <label
                htmlFor="no"
                style={{
                  marginLeft: '0.5rem',
                  padding: 'auto',
                  verticalAlign: 'center',
                  fontSize: '1.25rem',
                  marginBottom: '0px',
                }}
              >
                NO
              </label>
            </div>
          </div>
          <button
            className="btn btn-primary"
            disabled={vote === null}
            onClick={() => {
              genProveMemberTx();
            }}
          >
            Vote
          </button>
        </div>
      ) : (
        <div>
          {voteCampaigns?.length > 0 && (
            <div>
              <p>Select a campaign to cast a vote</p>
              <select
                value={activeVoteId}
                onChange={(e) => {
                  console.log('new active vote id: ', e.target.value);
                  setActiveVoteId(e.target.value);
                }}
                className="select select-bordered w-full max-w-xs"
              >
                <option value={''} disabled>
                  select campaign
                </option>
                {formatCampaigns(voteCampaigns).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <p>Create a new campaign</p>
            <input
              className="input input-primary w-full max-w-xs"
              placeholder="name of campaign to create"
              value={campaignInput}
              onChange={(n) => setCampaignInput(n.target.value)}
            />
            <button className="btn btn-primary" disabled={!campaignInput} onClick={() => createNewVoteCampaign()}>
              Create New Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vote;

const formatCampaigns = (campaigns) => {
  return campaigns.map((campaign) => ({ value: campaign.id, label: campaign.name }));
};
