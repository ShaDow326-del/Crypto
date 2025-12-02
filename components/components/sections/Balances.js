import { useEffect, useState } from "react";
import { useWallet } from "../WalletProvider";
import { ethers } from "ethers";

export default function Balances(){
  const { provider, address } = useWallet();
  const [eth, setEth] = useState(null);

  useEffect(()=>{
    if (!provider || !address) return;
    (async ()=>{
      try {
        const b = await provider.getBalance(address);
        setEth(ethers.formatEther(b));
      } catch (err){ console.error(err) }
    })();
  }, [provider, address]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white/3 rounded-lg">
          <div className="small-muted">ETH Balance</div>
          <div className="text-2xl font-medium mt-2">{eth ? `${Number(eth).toFixed(5)} ETH` : "—"}</div>
        </div>

        <div className="p-4 bg-white/3 rounded-lg">
          <div className="small-muted">Portfolio (USD est.)</div>
          <div className="text-2xl font-medium mt-2">—</div>
        </div>

        <div className="p-4 bg-white/3 rounded-lg">
          <div className="small-muted">Active NFTs</div>
          <div className="text-2xl font-medium mt-2">—</div>
        </div>
      </div>
    </div>
  );
}
