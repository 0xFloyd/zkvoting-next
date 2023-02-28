import contracts from './hardhat_contracts.json';
import { readContract } from '@wagmi/core';

const hardhatContract = contracts[31337]?.localhost?.contracts?.ZKVoting;
const goerliContract = contracts[5]?.goerli?.contracts?.ZKVoting;

interface ContractType {
  address: `0x${string}`;
  abi: any;
}

const currentContract = process.env.NEXT_PUBLIC_NETWORK === 'localhost' ? hardhatContract : goerliContract;

const contract: ContractType = {
  address: currentContract.address as `0x${string}`,
  abi: currentContract.abi,
};

export const readContractFunction = async (functionName: string, args?: any) => {
  const r = await readContract({
    ...contract,
    functionName,
    ...(args && { args: [args] }),
  });
  return r;
};

export default contract;
