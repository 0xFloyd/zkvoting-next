import contract, { readContractFunction } from '@/contracts/contractconfig';
import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractEvent } from 'wagmi';
import { waitForTransaction, writeContract, prepareWriteContract } from '@wagmi/core';
import VoteCard from '../VoteCard';
import Input from '../Input';
import Button from '../Button';
import { toast } from 'react-toastify';
import Etherscan from '../Etherscan';
import { processErrors } from '@/utils/errors';
import { trimString } from '@/utils/utils';

const Vote = ({ root, nLevels, calcedSMT }) => {
  const [voteCampaigns, setVoteCampaigns] = useState([]);
  const [activeVoteId, setActiveVoteId] = useState<string | number>('');
  const [campaignInput, setCampaignInput] = useState('');

  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);

  const [vote, setVote] = useState(null);
  const [proveMembershipLoading, setProveMembershipLoading] = useState(false);
  const [createNewCampaignLoading, setCreateNewCampaignLoading] = useState(false);
  const [proveMemCalldata, setProveMemCalldata] = useState();

  const [memberKey, setMemberKey] = useState('');
  const [memberSecret, setMemberSecret] = useState('');

  const { data: proposalCounter }: any = useContractRead({
    ...contract,
    functionName: 'proposalCounter',
    watch: true,
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

      const { hash, wait } = await writeContract(config);
      toast.promise(wait, {
        pending: <Etherscan hash={hash} />,
        success: 'Tx confirmed!',
      });
      const txResult = await waitForTransaction({ hash });

      // get new vote counts
      const positive = await readContractFunction('positiveVoteResult', activeVoteId);
      const negative = await readContractFunction('negativeVoteResult', activeVoteId);

      setPositiveCount(positive ? Number(positive.toString()) : 0);
      setNegativeCount(negative ? Number(negative.toString()) : 0);

      setMemberKey('');
      setMemberSecret('');
      setVote(null);

      setProveMembershipLoading(false);
    } catch (e) {
      // toast.error('TX error: ', JSON.stringify(e));
      console.log('error voting: ', e);
      setProveMembershipLoading(false);
      setMemberKey('');
      setMemberSecret('');
      setVote(null);
    }
  };

  const createNewVoteCampaign = async () => {
    setCreateNewCampaignLoading(true);
    try {
      const config = await prepareWriteContract({
        ...contract,
        functionName: 'createProposal',
        args: [Math.floor(Date.now() / 1000) + 10000, campaignInput],
      });

      const { hash } = await writeContract(config);
      toast(<Etherscan hash={hash} />);
      const data = await waitForTransaction({
        hash,
      });
      toast('TX Confirmed');
      setCampaignInput('');
      setCreateNewCampaignLoading(false);
    } catch (e) {
      toast(`TX Error: ${trimString(e?.message ? processErrors(e.message) : e)}`);
      console.log(e);
      setCampaignInput('');
      setCreateNewCampaignLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    let campaigns = [];
    const count = await readContractFunction('proposalCounter');
    for (let i = 1; i < Number(count); i++) {
      const campaignName = await readContractFunction('campaignName', i);

      campaigns.push({ id: i, name: campaignName });
    }

    setVoteCampaigns(campaigns);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [proposalCounter]);

  useEffect(() => {
    const fetchVoteCounts = async () => {
      if (activeVoteId || activeVoteId === 0) {
        const positive = await readContractFunction('positiveVoteResult', activeVoteId);
        const negative = await readContractFunction('negativeVoteResult', activeVoteId);

        setPositiveCount(positive ? Number(positive.toString()) : 0);
        setNegativeCount(negative ? Number(negative.toString()) : 0);
        setVote(null);
      }
    };

    fetchVoteCounts();
  }, [activeVoteId]);

  let campaign = voteCampaigns?.find((campaign) => campaign.id == activeVoteId);

  return (
    <VoteCard title={'Vote'}>
      <div className="flex flex-col items-center h-full">
        {activeVoteId ? (
          <div>
            <p>{`${campaign ? campaign?.name : ''} Campaign`}</p>
            <div className="grid grid-cols-2">
              <p>{positiveCount}</p>
              <p>{negativeCount}</p>
            </div>
            <div>
              <Input
                label={'VOTER ID'}
                type={'string'}
                placeholder={'enter voter ID #'}
                value={memberKey}
                onChange={(n) => setMemberKey(n.target.value)} // className="input input-bordered input-primary w-full max-w-xs"
              />
              <Input
                label={'SECRET'}
                type={'string'}
                placeholder={'enter secret'}
                value={memberSecret}
                onChange={(n) => setMemberSecret(n.target.value)} // className="input input-bordered input-primary w-full max-w-xs"
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
            <p style={{ fontStyle: 'italic', fontSize: '0.75rem', lineHeight: '1rem' }}>
              Each Member ID will only be able to vote once per campaign. A cast vote cannot be changed.
            </p>
            <div className="flex flex-row gap-5">
              <button
                className="btn"
                onClick={() => {
                  setActiveVoteId('');
                  setMemberKey('');
                  setMemberSecret('');
                  setVote(null);
                }}
              >
                BACK
              </button>
              <button
                className={`btn glass ${proveMembershipLoading && 'loading'}`}
                disabled={vote === null || proveMembershipLoading}
                onClick={() => {
                  genProveMemberTx();
                }}
              >
                VOTE
              </button>
            </div>
          </div>
        ) : (
          <div className="px-8 py-4">
            {voteCampaigns?.length > 0 ? (
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
                  {voteCampaigns.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p>No campaigns exist</p>
            )}
          </div>
        )}

        <div className="border-PINK border-t-4 w-full h-full my-auto  px-8 pt-4 pb-8 mx-auto text-center flex flex-col items-center">
          <p>Create a new campaign</p>

          <Input
            label={'NAME'}
            type={'string'}
            placeholder={'name of campaign'}
            value={campaignInput}
            onChange={(n) => setCampaignInput(n.target.value)} // className="input input-bordered input-primary w-full max-w-xs"
          />

          <Button
            text={'Create New Campaign'}
            className={`mt-auto ${createNewCampaignLoading && 'loading'}`}
            disabled={!campaignInput || createNewCampaignLoading}
            onClick={() => createNewVoteCampaign()}
          />
        </div>
      </div>
    </VoteCard>
  );
};

export default Vote;

const formatCampaigns = (campaigns) => {
  return campaigns.map((campaign) => ({ value: campaign.id, label: campaign.name }));
};
