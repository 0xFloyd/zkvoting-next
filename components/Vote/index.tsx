import contract, { readContractFunction } from '@/contracts/contractconfig';
import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { waitForTransaction, writeContract, prepareWriteContract } from '@wagmi/core';
import VoteCard from '../VoteCard';
import Input from '../Input';
import { toast } from 'react-toastify';
import Etherscan from '../Etherscan';
import Button from '../Button';
import { convertDate, trimString } from '@/utils/utils';
import { processErrors } from '@/utils/errors';
import styles from './Vote.module.css';
import { useModal } from 'connectkit';

const Vote = ({ root, nLevels, calcedSMT }) => {
  const [voteCampaigns, setVoteCampaigns] = useState([]);
  const [activeVoteId, setActiveVoteId] = useState<string | number>('');

  const [positiveCount, setPositiveCount] = useState(0);
  const [negativeCount, setNegativeCount] = useState(0);

  const [vote, setVote] = useState(null);
  const [proveMembershipLoading, setProveMembershipLoading] = useState(false);
  const [proveMemCalldata, setProveMemCalldata] = useState();

  const [memberKey, setMemberKey] = useState('');
  const [memberSecret, setMemberSecret] = useState('');

  const { data: proposalCounter }: any = useContractRead({
    ...contract,
    functionName: 'proposalCounter',
    watch: true,
  });

  const { address } = useAccount();
  const { setOpen: setWalletOpen } = useModal();

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
      const data = await response
        .json()
        .then(async (res) => {
          if (response.status === 200) {
            setProveMemCalldata(JSON.parse(res));

            const config = await prepareWriteContract({
              ...contract,
              functionName: 'proveMembership',
              args: [...JSON.parse(res), vote],
            });

            const { hash, wait } = await writeContract(config);
            toast(<Etherscan hash={hash} />);
            const txResult = await waitForTransaction({ hash });
            toast('TX Confirmed');
            // get new vote counts
            const positive = await readContractFunction('positiveVoteResult', activeVoteId);
            const negative = await readContractFunction('negativeVoteResult', activeVoteId);

            setPositiveCount(positive ? Number(positive.toString()) : 0);
            setNegativeCount(negative ? Number(negative.toString()) : 0);

            setMemberKey('');
            setMemberSecret('');
            setVote(null);

            setProveMembershipLoading(false);
          } else {
            throw new Error(JSON.stringify(res));
          }
        })
        .catch((e) => {
          toast(`TX Error: ${trimString(e?.message ? processErrors(e.message) : e)}`);
          console.log('error voting: ', e?.message ? e.message : e);
          setMemberKey('');
          setMemberSecret('');
          setVote(null);

          setProveMembershipLoading(false);
        });
    } catch (e) {
      toast(`TX Error: ${trimString(e?.message ? processErrors(e.message) : e)}`);
      console.log('error voting: ', e?.message ? e.message : e);
      setProveMembershipLoading(false);
      setMemberKey('');
      setMemberSecret('');
      setVote(null);
    }
  };

  const fetchCampaigns = async () => {
    let campaigns = [];
    const count = await readContractFunction('proposalCounter');
    for (let i = 1; i < Number(count); i++) {
      const name = await readContractFunction('campaignName', i);
      const timestamp = await readContractFunction('voteDeadline', i);

      const deadline = convertDate(timestamp);

      campaigns.push({ id: i, name, deadline });
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
          <div className="p-4 m-auto">
            <p className="capitalize text-center text-2xl mb-2">{`${campaign ? campaign?.name : ''} Campaign`}</p>
            <div className="flex flex-row w-full place-content-center gap-6  mb-4">
              <div className="glass rounded-md p-2 items-center text-center select-none">
                <p className="text-xs">YES</p>
                <span className="text-lg">{positiveCount}</span>
              </div>
              <div className="glass rounded-md p-2 flex flex-col items-center text-center select-none">
                <p className="text-xs">NO</p>
                <span className="text-lg">{negativeCount}</span>
              </div>
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

            <div className="flex flex-row items-center gap-12 place-content-center mt-4 mb-3">
              <div className="flex flex-row ">
                <input
                  onChange={() => setVote(true)}
                  checked={vote === true}
                  type="checkbox"
                  name="yes"
                  className="checkbox checkbox-sm border-opacity-40"
                />
                <label className="text-lg ml-2 leading-snug" htmlFor="yes">
                  YES
                </label>
              </div>
              <div className="flex flex-row">
                <input
                  checked={vote === false}
                  className="checkbox checkbox-sm  border-opacity-40"
                  type="checkbox"
                  name="no"
                  onChange={() => setVote(false)}
                />
                <label className="text-lg ml-2 leading-snug" htmlFor="no">
                  NO
                </label>
              </div>
            </div>
            <p className="text-xs italic">
              Each Member ID will only be able to vote once per campaign. A cast vote cannot be changed.
            </p>
            <div className="flex flex-row gap-5 place-content-center mt-2">
              <button
                className="text-gray btn btn-outline"
                onClick={() => {
                  setActiveVoteId('');
                  setMemberKey('');
                  setMemberSecret('');
                  setVote(null);
                }}
              >
                BACK
              </button>
              <Button
                text={'VOTE'}
                className={`${proveMembershipLoading && 'loading'}`}
                disabled={vote === null || !memberKey || !memberSecret || proveMembershipLoading}
                onClick={() => {
                  genProveMemberTx();
                }}
              />
            </div>
          </div>
        ) : (
          <div className={`w-full flex flex-col max-h-[60vh] md:max-h-[40vh] relative`}>
            {voteCampaigns?.length > 0 ? (
              <>
                <div className="mt-6 mx-8 flex flex-row place-content-between">
                  <p className="text-xs">NAME</p>
                  <p className="text-xs">DEADLINE</p>
                </div>
                <div className={`mt-2 mx-4 mb-6 overflow-y-scroll ${styles.listBlur}`}>
                  {voteCampaigns.map((option, i) => (
                    <div
                      className="my-3 rounded-lg border-secondaryGray border-opacity-20 border-2 flex flex-row place-content-between items-center px-4 py-3  w-full hover:bg-PINK hover:cursor-pointer hover:-translate-y-0.5  transition-all"
                      key={`${option.id}${i}`}
                      onClick={(e) => {
                        address ? setActiveVoteId(option.id) : setWalletOpen(true);
                      }}
                    >
                      <p className="text-md capitalize">{option?.name}</p>
                      <p className="text-xs">{option?.deadline}</p>
                    </div>
                  ))}
                </div>
                <div className={`${styles.bottomBlur}`} />
              </>
            ) : (
              <p className="text-xl m-12 text-center">No campaigns exist</p>
            )}
          </div>
        )}
      </div>
    </VoteCard>
  );
};

export default Vote;
