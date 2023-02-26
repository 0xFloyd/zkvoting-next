import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ConnectKitButton } from 'connectkit';
import { toast } from 'react-toastify';
import React from 'react';
import ConnectWallet from '../ConnectWallet';

const Header = () => {
  const title = ['Z', 'K', ` `, 'V', 'o', 'T', 'I', 'N', 'g'];

  return (
    <div className="w-full flex flex-row place-content-center items-center overflow-hidden mb-2 md:mb-8">
      <div className="text-center text-6xl xl:text-9xl italic double-layer mt-16 md:mt-8">
        {title.map((letter, i) => (
          <span key={`${letter}${i}`} className="font-LaserCorps glow" data-title={letter}>
            {letter}
          </span>
        ))}
      </div>
      <div className="absolute top-2 right-2">
        {/* <ConnectWallet /> */}

        <ConnectKitButton />
      </div>
    </div>
  );
};

export default Header;
