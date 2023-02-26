import React from 'react';
import { useNetwork } from 'wagmi';

const Etherscan = ({ hash }) => {
  const { chain } = useNetwork();
  return (
    <p>
      <a className="underline" href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`}>
        View tx on Etherscan
      </a>
    </p>
  );
};

export default Etherscan;
