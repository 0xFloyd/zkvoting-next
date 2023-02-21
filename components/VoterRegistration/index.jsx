import React from 'react';

const snarkjs = require('snarkjs');
const crypto = require('crypto');

const VoterRegistration = () => {
  const huh = async () => {
    const data = await readContract({
      address: '0x9b293020d3802c80b023d4b6965ab5e59bc971e2',
      abi: abi,
      functionName: 'balanceOf',
      args: [address],
    });
  };

  return <div>VoterRegistration</div>;
};

export default VoterRegistration;
