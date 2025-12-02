import Head from "next/head";
import ConnectWallet from "../components/ConnectWallet";
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Head>
        <title>My Crypto Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-8">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Crypto Dashboard</h1>
            <p className="text-sm text-gray-500">Balances • Tokens • NFTs • Transactions</p>
          </div>
          <ConnectWallet />
        </header>

        <main>
          <Dashboard />
        </main>

        <footer className="mt-8 text-xs text-gray-400">
          Built with ethers.js • Optional Alchemy NFT support (set ALCHEMY_API_KEY for thumbnails)
        </footer>
      </div>
    </div>
  );
    }
