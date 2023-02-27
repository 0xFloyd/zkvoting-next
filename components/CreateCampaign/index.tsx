import contract from '@/contracts/contractconfig';
import { processErrors } from '@/utils/errors';
import { trimString } from '@/utils/utils';
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../Button';
import Etherscan from '../Etherscan';
import Input from '../Input';

const CreateCampaign = () => {
  const [campaignInput, setCampaignInput] = useState('');
  const [createNewCampaignLoading, setCreateNewCampaignLoading] = useState(false);

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

  return (
    <div>
      <div className="w-full h-full my-auto  px-8 pt-4 pb-3 mx-auto text-center flex flex-col items-center">
        <p className="mb-1 text-xl">Create a new campaign</p>

        <Input
          label={'NAME'}
          type={'string'}
          placeholder={'name of campaign'}
          value={campaignInput}
          onChange={(n) => setCampaignInput(n.target.value)} // className="input input-bordered input-primary w-full max-w-xs"
        />

        <Button
          text={'Create New Campaign'}
          className={`mt-8 ${createNewCampaignLoading && 'loading'}`}
          disabled={!campaignInput || createNewCampaignLoading}
          onClick={() => createNewVoteCampaign()}
        />
      </div>
    </div>
  );
};

export default CreateCampaign;
