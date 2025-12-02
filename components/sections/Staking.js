import { useState } from "react";
import { useWallet } from "../WalletProvider";
import { ethers } from "ethers";

const STAKING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT || "";

const STAKING_ABI = [
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function earned(address account) view returns (uint256)"
];

export default function Staking(){
  const { signer, address } = useWallet();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [rewards, setRewards] = useState(null);

  async function stake(){
    if (!signer) return alert("Connect wallet");
    if (!STAKING_CONTRACT_ADDRESS) return alert("Set NEXT_PUBLIC_STAKING_CONTRACT env var");
    try {
      const c = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
      const tx = await c.stake(ethers.parseEther(amount));
      setStatus("Pending: " + tx.hash);
      await tx.wait();
      setStatus("Staked");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err?.message || err));
    }
  }

  async function withdraw(){
    if (!signer) return alert("Connect wallet");
    if (!STAKING_CONTRACT_ADDRESS) return alert("Set NEXT_PUBLIC_STAKING_CONTRACT env var");
    try {
      const c = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
      const tx = await c.withdraw(ethers.parseEther(amount));
      setStatus("Pending: " + tx.hash);
      await tx.wait();
      setStatus("Withdrawn");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err?.message || err));
    }
  }

  async function fetchRewards(){
    if (!address) return alert("Connect wallet");
    if (!STAKING_CONTRACT_ADDRESS) return alert("Set NEXT_PUBLIC_STAKING_CONTRACT env var");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const c = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider);
      const r = await c.earned(address);
      setRewards(ethers.formatEther(r));
    } catch (err) {
      console.error(err);
      alert("Failed");
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Staking (prototype)</h3>
      <div className="small-muted mb-2">Set NEXT_PUBLIC_STAKING_CONTRACT to enable.</div>

      <input className="w-full px-3 py-2 rounded bg-white/4 mb-2" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={stake} className="px-3 py-2 bg-emerald-500 rounded">Stake</button>
        <button onClick={withdraw} className="px-3 py-2 bg-amber-500 rounded">Unstake</button>
        <button onClick={fetchRewards} className="px-3 py-2 bg-indigo-500 rounded">Check Rewards</button>
      </div>

      <div className="mt-3 small-muted">{status}</div>
      {rewards && <div className="mt-2">Rewards: {rewards}</div>}
    </div>
  );
}