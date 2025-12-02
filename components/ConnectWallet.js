import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function ConnectWallet() {
  const [account, setAccount] = useState(null);
  const [short, setShort] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
        setShort(accounts[0] ? `${accounts[0].slice(0,6)}...${accounts[0].slice(-4)}` : null);
      });
    }
  }, []);

  async function connect() {
    try {
      if (!window.ethereum) {
        alert("MetaMask (or any injected wallet) not detected. Install MetaMask or use a Web3-enabled browser.");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setShort(`${address.slice(0,6)}...${address.slice(-4)}`);
    } catch (err) {
      console.error(err);
    }
  }

  if (account) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">Connected</div>
        <div className="px-3 py-1 bg-gray-100 rounded-lg font-mono text-sm">{short}</div>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:opacity-95"
    >
      Connect Wallet
    </button>
  );
  }
