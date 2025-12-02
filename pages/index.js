import Head from "next/head";
import TopBar from "../components/TopBar";
import Dashboard from "../components/Dashboard";

export default function Home() {
  return (
    <>
      <Head>
        <title>My Crypto Super App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <TopBar />
          <main className="mt-8">
            <Dashboard />
          </main>
        </div>
      </div>
    </>
  );
}