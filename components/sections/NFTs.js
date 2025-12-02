import { useState } from "react";
import { useWallet } from "../WalletProvider";
import { ethers } from "ethers";

export default function NFTs(){
  const { address } = useWallet();
  const [contractAddr, setContractAddr] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchAlchemy() {
    if (!address) return alert("Connect wallet");
    const key = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!key) return alert("Set NEXT_PUBLIC_ALCHEMY_API_KEY in env for Alchemy support");
    setLoading(true);
    try {
      const url = `https://eth-mainnet.g.alchemy.com/v2/${key}/getNFTs?owner=${address}`;
      const res = await fetch(url);
      const j = await res.json();
      const mapped = (j.ownedNfts || []).map(n => ({
        title: n.contract.metadata?.name || n.title || `${n.contract.address}#${n.id.tokenId}`,
        img: n.media?.[0]?.gateway || n.metadata?.image || null,
        contract: n.contract.address,
        tokenId: n.id.tokenId
      }));
      setItems(mapped);
    } catch (err) { console.error(err); alert("Alchemy fetch failed"); }
    setLoading(false);
  }

  async function fetchContract() {
    if (!address) return alert("Connect wallet");
    if (!ethers.isAddress(contractAddr)) return alert("Invalid contract");
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const abi = [
        "function balanceOf(address) view returns (uint256)",
        "function tokenOfOwnerByIndex(address,uint256) view returns (uint256)",
        "function tokenURI(uint256) view returns (string)"
      ];
      const c = new ethers.Contract(contractAddr, abi, provider);
      const bal = await c.balanceOf(address);
      const out = [];
      for (let i=0;i<Number(bal);i++){
        try {
          const tid = await c.tokenOfOwnerByIndex(address, i);
          let uri = "";
          try { uri = await c.tokenURI(tid); } catch {}
          out.push({ tokenId: tid.toString(), tokenURI: uri, contract: contractAddr });
        } catch(e){ /* best effort */ }
      }
      setItems(out);
    } catch (err) { console.error(err); alert("On-chain fetch failed"); }
    setLoading(false);
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">NFT Gallery</h3>

      <div className="flex gap-2 mb-3">
        <button onClick={fetchAlchemy} className="px-3 py-2 rounded bg-violet-500">Fetch (Alchemy)</button>
        <input className="flex-1 px-3 py-2 rounded bg-white/4" placeholder="Optional: ERC-721 contract" value={contractAddr} onChange={(e)=>setContractAddr(e.target.value)} />
        <button onClick={fetchContract} className="px-3 py-2 rounded bg-indigo-500">Scan Contract</button>
      </div>

      {loading && <div className="small-muted">Loading...</div>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {items.length === 0 && <div className="small-muted">No NFTs found.</div>}
        {items.map((n,i)=>(
          <div key={i} className="bg-white/5 p-2 rounded">
            {n.img ? <img src={n.img} alt="" className="w-full h-40 object-cover rounded" /> : <div className="h-40 bg-white/6 rounded flex items-center justify-center small-muted">No image</div>}
            <div className="mt-2 font-medium text-sm">{n.title || `#${n.tokenId}`}</div>
            <div className="text-xs small-muted">{n.contract}</div>
          </div>
        ))}
      </div>
    </div>
  );
}