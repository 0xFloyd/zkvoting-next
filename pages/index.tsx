import Head from 'next/head'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import Header from '@/components/Header'
import { goerli, hardhat } from 'wagmi/chains'
import Main from '@/components/Main'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { ConnectKitProvider, getDefaultClient } from 'connectkit'
import { ToastContainer, Zoom } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// import Stars from '@/components/Stars';
import contract from '@/contracts/contractconfig'

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

const CHAIN = process.env.NEXT_PUBLIC_NETWORK === 'localhost' ? hardhat : goerli

const { chains } = configureChains([CHAIN], [alchemyProvider({ apiKey: alchemyId }), publicProvider()])

const familyClient = createClient(
  getDefaultClient({
    appName: 'zk voting',
    alchemyId,
    chains
  })
)

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
        <ConnectKitProvider
          customTheme={{
            '--ck-connectbutton-background': 'var(--primary)',
            '--ck-connectbutton-hover-background': 'var(--primary)',
            '--ck-connectbutton-active-background': 'var(--primary)',
            '--ck-font-family': 'Power'
          }}
        >
          {/* background-80s */}
          <div className="min-h-screen overflow-x-hidden relative pb-12">
            {/* <Stars /> */}
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
            <div className="flex flex-col items-center md:flex-row gap-1 md:gap-4 -translate-x-1/2 left-1/2 md:left-4 md:translate-x-0 absolute bottom-4 ">
              <p className="text-xs text-secondaryGray hover:text-PINK ">built by 0xFloyd for pluto</p>
              {contract?.address && (
                <a
                  href={`https://goerli.etherscan.io/address/${contract.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-secondaryGray hover:text-PINK hover:cursor-pointer hover:underline"
                >
                  {contract.address}
                </a>
              )}
            </div>
          </div>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  )
}
