import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ERC20_ABI from "../utils/erc20Abi";

export default function Dashboard() {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);

  const [tokenAddr, setTokenAddr] = useState("");
  const [tokenBalance, setTokenBalance] = useState(null);
  const [tokenSymbol, setTokenSymbol] = useState("");

  const [nftContract, setNftContract] = useState("");
  const [nftList, setNftList] = useState([]);
  const [loadingNfts, setLoadingNfts] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const p = new ethers.BrowserProvider(window.ethereum);
      setProvider(p);

      p.send("eth_accounts", []).then((accounts) => {
        if (accounts?.length) {
          setAddress(accounts[0]);
        }
      }).catch(()=>{});
    }
  }, []);

  useEffect(() => {
    if (!provider || !address) return;
    (async ()=>{
      try {
        const bal = await provider.getBalance(address);
        setEthBalance(ethers.formatEther(bal));
      } catch (err) { console.error(err); }
    })();
  }, [provider, address]);

  async function fetchToken() {
    if (!provider) return alert("Connect your wallet first");
    if (!ethers.isAddress(tokenAddr)) return alert("Invalid token address");
    try {
      const contract = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
      const [symbol, decimals, raw] = await Promise.all([
        contract.symbol().catch(()=>null),
        contract.decimals().catch(()=>18),
        contract.balanceOf(address)
      ]);
      setTokenSymbol(symbol || "");
      const formatted = Number(ethers.formatUnits(raw, decimals));
      setTokenBalance(formatted);
    } catch (err) {
      console.error(err);
      alert("Failed reading token. Not a standard ERC-20 or network issue.");
    }
  }

  async function fetchNFTs() {
    if (!address) return alert("Connect wallet first");
    setLoadingNfts(true);
    setNftList([]);
    // Option A: If user set ALCHEMY_API_KEY in .env, use Alchemy NFT endpoint (serverless fetch)
    // Option B: Without Alchemy, we try a minimal on-chain scan for ERC-721 using balanceOf + tokenOfOwnerByIndex (works only for enumerable contracts)
    const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    const network = "eth-mainnet";
    if (ALCHEMY_KEY) {
      try {
        const url = `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}/getNFTs/?owner=${address}`;
        const res = await fetch(url);
        const j = await res.json();
        if (j && j.ownedNfts) {
          const mapped = j.ownedNfts.map(n => ({
            title: n.title || `${n.contract.address}#${n.id?.tokenId || ""}`,
            img: n.media?.[0]?.gateway || n.metadata?.image || null,
            contract: n.contract.address,
            tokenId: n.id?.tokenId
          }));
          setNftList(mapped);
          setLoadingNfts(false);
          return;
        }
      } catch (err) {
        console.error("Alchemy NFT fetch error:", err);
      }
    }

    // Fallback minimal scan (best-effort): try querying provided nftContract (if set)
    if (!nftContract) {
      setLoadingNfts(false);
      return alert("No Alchemy key provided. Provide a contract address in the NFT Contract field to attempt on-chain lookup for enumerable contracts.");
    }
    if (!ethers.isAddress(nftContract)) {
      setLoadingNfts(false);
      return alert("Invalid NFT contract address.");
    }

    try {
      const abi = [
        "function balanceOf(address) view returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
        "function tokenURI(uint256 tokenId) view returns (string)"
      ];
      const c = new ethers.Contract(nftContract, abi, provider);
      const balance = await c.balanceOf(address);
      const bnum = Number(balance.toString());
      const out = [];
      for (let i = 0; i < bnum; i++) {
        try {
          const tokenId = await c.tokenOfOwnerByIndex(address, i);
          const tid = tokenId.toString();
          let uri = "";
          try { uri = await c.tokenURI(tokenId); } catch {}
          out.push({ tokenId: tid, tokenURI: uri });
        } catch (err) {
          console.error("tokenOfOwnerByIndex failed", err);
        }
      }
      setNftList(out);
    } catch (err) {
      console.error(err);
      alert("Failed on-chain NFT fetch. Contract might not support enumeration.");
    } finally {
      setLoadingNfts(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Connected address</div>
          <div className="font-mono mt-2">{address || "Not connected"}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">ETH Balance</div>
          <div className="text-xl font-semibold mt-2">{ethBalance ? `${ethBalance} ETH` : "—"}</div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Network</div>
          <div className="mt-2 text-sm text-gray-700">Detected by provider</div>
        </div>
      </section>

      <section className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="font-semibold mb-2">Check ERC-20 token balance</h3>
        <div className="flex gap-2">
          <input
            className="flex-1 border px-3 py-2 rounded"
            placeholder="Token contract address (ERC-20)"
            value={tokenAddr}
            onChange={(e)=>setTokenAddr(e.target.value)}
          />
          <button onClick={fetchToken} className="px-3 py-2 bg-indigo-600 text-white rounded">Get balance</button>
        </div>
        <div className="mt-3 text-sm text-gray-700">
          {tokenSymbol && <div><strong>{tokenSymbol}</strong>: {tokenBalance}</div>}
        </div>
      </section>

      <section className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="font-semibold mb-2">NFTs (Alchemy optional) </h3>
        <div className="text-sm text-gray-500 mb-3">
          If you set <code>NEXT_PUBLIC_ALCHEMY_API_KEY</code> in deployment, the dashboard will fetch NFT metadata from Alchemy automatically.
        </div>

        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 border px-3 py-2 rounded"
            placeholder="Optional: NFT contract to attempt on-chain scan (ERC-721 enumerable)"
            value={nftContract}
            onChange={(e)=>setNftContract(e.target.value)}
          />
          <button onClick={fetchNFTs} className="px-3 py-2 bg-indigo-600 text-white rounded">
            {loadingNfts ? "Loading..." : "Fetch NFTs"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nftList.length === 0 && <div className="text-sm text-gray-500">No NFTs found yet.</div>}
          {nftList.map((n,i)=>(
            <div key={i} className="bg-gray-50 p-3 rounded">
              {n.img ? <img src={n.img} alt="" className="w-full h-40 object-cover rounded" /> : <div className="h-40 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No image</div>}
              <div className="mt-2 text-sm font-semibold">{n.title || `#${n.tokenId || "?"}`}</div>
              <div className="text-xs text-gray-500 mt-1">{n.contract || ""} {n.tokenId ? `#${n.tokenId}` : ""}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
                                           }
