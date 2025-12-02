import { useState } from "react";
import { useWallet } from "../WalletProvider";
import { ethers } from "ethers";

export default function Swap(){
  const { signer, address } = useWallet();
  const [fromToken, setFromToken] = useState("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"); // ETH pseudo
  const [toToken, setToToken] = useState(""); // example: DAI address
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState(null);
  const [status, setStatus] = useState("");

  async function fetchQuote(){
    if (!toToken || !amount) return alert("Set to token and amount");
    // 0x uses amounts in base units for sellAmount
    const sellAmount = ethers.parseEther(amount).toString();
    const url = `https://api.0x.org/swap/v1/quote?sellToken=${fromToken}&buyToken=${toToken}&sellAmount=${sellAmount}`;
    try {
      setStatus("Fetching quote...");
      const res = await fetch(url);
      const j = await res.json();
      if (j?.price || j?.to) {
        setQuote(j);
        setStatus("Quote ready");
      } else {
        setStatus("Quote failed");
      }
    } catch (err) {
      console.error(err);
      setStatus("Quote error");
    }
  }

  async function doSwap(){
    if (!quote) return alert("Fetch quote first");
    if (!signer) return alert("Connect wallet");
    try {
      setStatus("Sending tx...");
      const txParams = {
        to: quote.to,
        data: quote.data,
        value: quote.value ? ethers.BigInt(quote.value) : undefined,
        // gasPrice/gasLimit usually returned in quote but modern wallets use EIP-1559 - leave to provider
      };
      const tx = await signer.sendTransaction(txParams);
      setStatus(`Sent: ${tx.hash}`);
      await tx.wait();
      setStatus(`Confirmed: ${tx.hash}`);
    } catch (err) {
      console.error(err);
      setStatus("Swap failed: " + (err?.message || err));
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Swap (0x prototype)</h3>
      <div className="small-muted mb-2">This is a prototype: always double-check quotes before sending.</div>

      <div className="space-y-2">
        <input className="w-full px-3 py-2 rounded bg-white/4" placeholder="To token address (example: DAI)" value={toToken} onChange={(e)=>setToToken(e.target.value)} />
        <input className="w-full px-3 py-2 rounded bg-white/4" placeholder="Amount (ETH)" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={fetchQuote} className="px-3 py-2 bg-violet-500 rounded">Get quote</button>
          <button onClick={doSwap} className="px-3 py-2 bg-rose-500 rounded">Execute</button>
        </div>
        <div className="mt-3 small-muted">{status}</div>
        {quote && (
          <div className="mt-2 p-2 bg-white/5 rounded text-sm small-muted">
            Price: {quote?.price?.toString?.() || quote?.estimatedPrice} • Buy amount: {quote?.buyAmount}
          </div>
        )}
      </div>
    </div>
  );
}