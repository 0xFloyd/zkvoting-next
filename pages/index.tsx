import Head from 'next/head';
import { Inter } from '@next/font/google';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import Header from '@/components/Header';
import { goerli, hardhat } from 'wagmi/chains';
import Main from '@/components/Main';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { ConnectKitProvider, getDefaultClient } from 'connectkit';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Stars from '@/components/Stars';
import contract from '@/contracts/contractconfig';

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

const CHAIN = process.env.NEXT_PUBLIC_NETWORK === 'localhost' ? hardhat : goerli;

const { chains, provider } = configureChains(
  [CHAIN],
  [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

// export const client = createClient({
//   autoConnect: true,
//   connectors,
//   provider,
// });

const familyClient = createClient(
  getDefaultClient({
    appName: 'Your App Name',
    alchemyId,
    chains,
  })
);

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
      <WagmiConfig client={familyClient}>
        {/* <RainbowKitProvider chains={chains} modalSize="compact"> */}
        <ConnectKitProvider
          customTheme={{
            '--ck-connectbutton-background': 'var(--primary)',
            '--ck-connectbutton-hover-background': 'var(--primary)',
            '--ck-connectbutton-active-background': 'var(--primary)',
            '--ck-font-family': 'Power',
          }}
        >
          {/* background-80s stars */}

          <div className="min-h-screen overflow-x-hidden relative pb-12">
            <Stars />
            <div className="overlay" />
            <Header />
            <Main />
            <ToastContainer
              position="bottom-right"
              autoClose={3000}
              hideProgressBar={true}
              newestOnTop={false}
              rtl={false}
              theme="dark"
              limit={3}
              transition={Zoom}
            />
          </div>
          {contract?.address && (
            <a
              href={`https://goerli.etherscan.io/address/${contract.address}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-secondaryGray absolute bottom-4 right-4 hover:text-PINK hover:cursor-pointer hover:underline"
            >
              {contract.address}
            </a>
          )}
          {/* </RainbowKitProvider> */}
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
