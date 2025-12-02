import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.ethereum) return;

    const eth = window.ethereum;

    const p = new ethers.BrowserProvider(eth);
    setProvider(p);

    // handle accounts changed
    eth.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        setSigner(null);
      } else {
        setAddress(accounts[0]);
        setSigner(p.getSigner());
      }
    });

    eth.on("chainChanged", (chainHex) => {
      const id = parseInt(chainHex, 16);
      setChainId(id);
    });

    // initial attempt to read accounts if already connected
    (async () => {
      try {
        const accounts = await p.send("eth_accounts", []);
        if (accounts?.length) {
          setAddress(accounts[0]);
          setSigner(p.getSigner());
        }
        const chain = await p.getNetwork();
        setChainId(chain?.chainId || null);
      } catch (e) {
        // silent
      }
    })();

    return () => {
      try {
        eth.removeAllListeners("accountsChanged");
        eth.removeAllListeners("chainChanged");
      } catch {}
    };
  }, []);

  async function connect() {
    if (!window.ethereum) throw new Error("No injected wallet found");
    const p = new ethers.BrowserProvider(window.ethereum);
    await p.send("eth_requestAccounts", []);
    setProvider(p);
    setSigner(p.getSigner());
    const addr = await p.getSigner().getAddress();
    setAddress(addr);
    const network = await p.getNetwork();
    setChainId(network.chainId);
  }

  async function switchChain(chainParams) {
    // chainParams example: { chainId: '0x89' } or full addChain object
    if (!window.ethereum) throw new Error("No wallet");
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [chainParams] });
    } catch (err) {
      // If chain not added, try to add
      if (err?.code === 4902 && chainParams?.addChain) {
        await window.ethereum.request({ method: "wallet_addEthereumChain", params: [chainParams.addChain] });
      } else {
        throw err;
      }
    }
  }

  return (
    <WalletContext.Provider value={{ provider, signer, address, chainId, connect, switchChain }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}