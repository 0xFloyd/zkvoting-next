import { ConnectKitButton } from 'connectkit';
import React, { useEffect, useState } from 'react';
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
      <div className="text-center text-6xl xl:text-9xl italic double-layer mt-20 md:mt-16">
        {title.map((letter, i) => (
          <span key={`${letter}${i}`} className="font-LaserCorps glow" data-title={letter}>
            {letter}
          </span>
        ))}
      </div>
      <div className="w-full absolute top-2 right-2 flex flex-row place-content-between md:place-content-end items-center">
        {voterCount || voterCount === 0 ? (
          <p className="text-white ml-4 md:ml-0 md:mr-4 text-xs md:text-base bg-slate-900 border-PINK border-2 rounded-xl px-3 py-1.5">{`${voterCount} Registered Voter${
            voterCount == 1 ? '' : 's'
          }`}</p>
        ) : null}

        <ConnectKitButton />
      </div>
    </div>
  );
};

export default Header;
