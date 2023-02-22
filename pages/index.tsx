import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import { WagmiConfig, createClient } from 'wagmi';
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from 'connectkit';
import Header from '@/components/Header';
import { mainnet, goerli } from 'wagmi/chains';
import { poseidon } from 'circomlibjs';
import { useContractReader } from 'eth-hooks';
import { ethers } from 'ethers';
import Main from '@/components/Main';

const inter = Inter({ subsets: ['latin'] });

const alchemyId = 'sEmqlfcdWUUs-dU7PuO5LuSt8dF6KhZ1';

// const alchemyId = process.env.ALCHEMY_ID;

// Another alternative is to create an additional network at MetaMask, name it localhost, use the address http://127.0.0.1:8545, and chainId 31337

// const ethProvider = new JsonRpcProvider(process.env.RPC_URL, getNetwork(process.env.CHAIN_ID);
// const connector = new MetaMaskConnector({chains: [chain.hardhat]});

// const client = createClient({
//     autoConnect: true,
//     provider: ethProvider,
//     connectors: [connector],
// });

const client = createClient(
  getDefaultClient({
    appName: 'zk voting',
    alchemyId,
    chains: [mainnet, goerli],
  })
);

export default function Home() {
  return (
    <>
      <Head>
        <title>ZK Voting</title>
        <meta name="description" content="Zk voting " />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WagmiConfig client={client}>
        <ConnectKitProvider>
          <Header />
          <Main />
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
