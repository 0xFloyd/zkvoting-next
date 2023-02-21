import Head from 'next/head';
import Image from 'next/image';
import { Inter } from '@next/font/google';
import styles from '@/styles/Home.module.css';

import { WagmiConfig, createClient } from 'wagmi';
import { ConnectKitProvider, ConnectKitButton, getDefaultClient } from 'connectkit';
import Header from '@/components/Header';
import { mainnet, goerli } from 'wagmi/chains';
import { poseidon } from 'circomlibjs';
import { useContractReader } from 'eth-hooks';
import { ethers } from 'ethers';
const inter = Inter({ subsets: ['latin'] });

const alchemyId = 'sEmqlfcdWUUs-dU7PuO5LuSt8dF6KhZ1';

// const alchemyId = process.env.ALCHEMY_ID;

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
          <main className={styles.main}>
            <div className={styles.center}></div>
          </main>
          <ConnectKitButton />
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
