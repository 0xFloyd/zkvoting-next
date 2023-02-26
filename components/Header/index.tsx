import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConnectKitButton } from 'connectkit';
import { toast } from 'react-toastify';
import React, { useEffect, useState } from 'react';
import ConnectWallet from '../ConnectWallet';
import { useContractRead } from 'wagmi';
import contract from '@/contracts/contractconfig';

const Header = () => {
  const [voterCount, setVoterCount] = useState(0);
  const title = ['Z', 'K', ` `, 'V', 'o', 'T', 'I', 'N', 'g'];
  const { data: voters }: any = useContractRead({
    ...contract,
    functionName: 'nextKey',
    watch: true,
  });

  useEffect(() => {
    setVoterCount(voters);
  }, [voters]);

  return (
    <div className="w-full flex flex-row place-content-center items-center overflow-hidden mb-2 md:mb-8">
      <div className="text-center text-6xl xl:text-9xl italic double-layer mt-16 md:mt-8">
        {title.map((letter, i) => (
          <span key={`${letter}${i}`} className="font-LaserCorps glow" data-title={letter}>
            {letter}
          </span>
        ))}
      </div>
      <div className="absolute top-2 right-2 flex flex-row items-center">
        {/* <ConnectWallet /> */}
        <p className="mr-4 text-lg">{`${voterCount} Registered Voter${voterCount == 1 ? '' : 's'}`}</p>
        <ConnectKitButton />
      </div>
    </div>
  );
};

export default Header;
