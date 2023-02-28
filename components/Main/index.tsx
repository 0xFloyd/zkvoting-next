import React, { useEffect, useState } from 'react';
import { useAccount, useContractEvent, useContractRead } from 'wagmi';
import contract from '../../contracts/contractconfig';
import useSMT from '../../hooks/useSMT';
import Register from '../Register';
import Vote from '../Vote';
import Modal from '../Modal';
import Button from '../Button';
import CreateCampaign from '../CreateCampaign';
import { useModal } from 'connectkit';

const nLevels = 3;

const Main = () => {
  const [secrets, setSecrets] = useState<Array<bigint | `0x${string}`>>([BigInt(0), BigInt(0)]);
  const [poseidonHash, setPoseidonHash] = useState();

  const [leaves, setLeaves] = useState({});

  const { data: root }: any = useContractRead({
    ...contract,
    functionName: 'root',
    watch: true,
  });

  useContractEvent({
    ...contract,
    eventName: 'AddLeaf',
    async listener(key: any, value: any) {
      let temp = leaves;
      temp[key] = value?.toString();

      setLeaves(temp);
    },
  });

  // useEffect(() => {
  //   let lfv = {};
  //   for (let i = addLeafEvents.length - 1; i >= 0; i--) {
  //     lfv[addLeafEvents[i].args.key] = addLeafEvents[i].args.value.toString();
  //
  //   }
  //   setLeaves(lfv);
  // }, [addLeafEvents]);

  console.log('leaves: ', leaves);

  const calcedSMT = useSMT(leaves);

  const [open, setOpen] = useState(false);

  const [wallet, setWallet] = useState<string>('');
  const { address } = useAccount();
  const { setOpen: setWalletOpen } = useModal();

  useEffect(() => {
    setWallet(address);
  }, [address]);

  return (
    <div className="relative">
      <div className="max-w-2xl mx-auto text-center mb-4 text-xl px-4">
        <p>Create campaigns for your cause</p>
        <p className="mb-2">Use the power of zero knowledge proofs to allow for anonymous voting!</p>
        <Button
          text={wallet ? 'Create' : 'Connect'}
          className={'!bg-PINK text-white btn-sm'}
          disabled={false}
          onClick={() => (address ? setOpen(!open) : setWalletOpen(true))}
        />
      </div>
      <Modal open={open} setOpen={setOpen}>
        <CreateCampaign setOpen={setOpen} />
      </Modal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-7xl mx-auto p-4">
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
