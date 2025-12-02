import { useState } from "react";
import { useWallet } from "../WalletProvider";
import ERC20_ABI from "../../utils/erc20Abi";
import { ethers } from "ethers";

export default function Tokens(){
  const { provider, address } = useWallet();
  const [tokenAddr, setTokenAddr] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);

  async function fetchToken(){
    if (!provider) return alert("Connect wallet");
    if (!ethers.isAddress(tokenAddr)) return alert("Invalid address");
    try {
      const c = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
      const [symbol, decimals, raw] = await Promise.all([
        c.symbol().catch(()=>null),
        c.decimals().catch(()=>18),
        c.balanceOf(address)
      ]);
      const bal = Number(ethers.formatUnits(raw, decimals));
      setTokenInfo({ symbol: symbol || "??", balance: bal });
    } catch (err) {
      console.error(err);
      alert("Failed to fetch token");
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Token Lookup</h3>
      <div className="flex gap-2">
        <input className="flex-1 px-3 py-2 rounded bg-white/4" placeholder="ERC-20 address" value={tokenAddr} onChange={(e)=>setTokenAddr(e.target.value)} />
        <button onClick={fetchToken} className="px-3 py-2 rounded bg-indigo-500">Get</button>
      </div>

      {tokenInfo && (
        <div className="mt-3 p-3 bg-white/5 rounded">
          <div className="small-muted">Symbol</div>
          <div className="font-medium">{tokenInfo.symbol}</div>
          <div className="small-muted mt-2">Balance</div>
          <div className="font-medium">{tokenInfo.balance}</div>
        </div>
      )}
    </div>
  );
}