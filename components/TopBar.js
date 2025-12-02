import { useWallet } from "./WalletProvider";

export default function TopBar() {
  const { address, connect, chainId } = useWallet();

  const short = address ? `${address.slice(0,6)}...${address.slice(-4)}` : null;

  return (
    <div className="flex items-center justify-between glass p-4 rounded-xl">
      <div>
        <h1 className="text-2xl font-semibold">My Crypto Super App</h1>
        <div className="small-muted">Premium dashboard • glass UI • multi-chain</div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm small-muted text-right">
          <div>{short || "Not connected"}</div>
          <div>Network: {chainId || "—"}</div>
        </div>

        {!address ? (
          <button
            onClick={() => connect().catch(e=>alert(e.message))}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-400 shadow"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="px-3 py-1 rounded-md bg-white/6 font-mono text-sm">{short}</div>
        )}
      </div>
    </div>
  );
}