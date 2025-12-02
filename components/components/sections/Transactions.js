import { useState } from "react";
import { useWallet } from "../WalletProvider";

export default function Transactions(){
  const { address, chainId } = useWallet();
  const [history, setHistory] = useState([]);

  // This is a minimal local tx list for txs created via this UI.
  // For full history you'd query a block explorer API (Etherscan/Alchemy).
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Transactions</h3>
      <div className="small-muted mb-2">Local recent actions. For full history, link your Etherscan/Alchemy API.</div>

      {history.length === 0 ? (
        <div className="small-muted">No local transactions yet.</div>
      ) : (
        history.map((t,i)=>(
          <div key={i} className="p-3 bg-white/5 rounded mb-2">
            <div className="font-medium">{t.title}</div>
            <div className="small-muted text-xs">{t.txHash}</div>
          </div>
        ))
      )}

      <div className="mt-3 text-xs small-muted">
        Network: {chainId || "—"} • Address: {address || "—"}
      </div>
    </div>
  );
}