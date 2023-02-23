import contracts from './hardhat_contracts.json';

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

export default contract;
