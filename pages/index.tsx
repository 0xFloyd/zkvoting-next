import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from 'connectkit';
import Header from '@/components/Header';
import { mainnet, goerli } from 'wagmi/chains';
import { poseidon } from 'circomlibjs';
import { useContractReader } from 'eth-hooks';
import { ethers } from 'ethers';
import Main from '@/components/Main';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { hardhat } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import Loading from '@/components/Loading';
import { alchemyProvider } from 'wagmi/providers/alchemy';

const inter = Inter({ subsets: ['latin'] });

const alchemyId = 'sEmqlfcdWUUs-dU7PuO5LuSt8dF6KhZ1';

// const alchemyId = process.env.ALCHEMY_ID;

// Another alternative is to create an additional network at MetaMask, name it localhost, use the address http://127.0.0.1:8545, and chainId 31337

const address = 'http://127.0.0.1:8545/';
const chainid = 31337;

// const connector = new InjectedConnector({
//   chains: [
//     {
//       id: 31337,
//       name: 'hardhat',
//       testnet: false,
//       network: 'localhost',
//       rpcUrls: {
//         default: { http: ['http://127.0.0.1:8545'] },
//         public: { http: ['http://127.0.0.1:8545'] },
//       },
//       nativeCurrency: {
//         decimals: 18,
//         name: 'ethereum',
//         symbol: 'eth',
//       },
//     },
//   ], //[...defaultChains, ...defaultL2Chains],
// });

// const { chains, provider } = configureChains(
//   [hardhat],
//   [
//     jsonRpcProvider({
//       rpc: (chain) => ({
//         http: 'http://127.0.0.1:8545',
//       }),
//     }),
//   ]
// );

// const client = createClient({
//   autoConnect: true,
//   provider: provider,
//   connectors: [
//     new MetaMaskConnector({ chains }),
//     new InjectedConnector({
//       chains,
//       options: {
//         name: 'Injected',
//         shimDisconnect: true,
//       },
//     }),
//   ],
// });

const { chains, provider } = configureChains(
  [hardhat],
  [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

export const client = createClient({
  autoConnect: true,
  connectors,
  provider,
});

// goerli
// const client = createClient(
//   getDefaultClient({
//     appName: 'zk voting',
//     alchemyId,
//     chains: [goerli],
//   })
// );

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
        <RainbowKitProvider chains={chains}>
          <Header />
          <ConnectButton />
          <Main />
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}
