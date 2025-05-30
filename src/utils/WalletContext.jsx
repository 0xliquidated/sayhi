import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connectWallet, checkWalletConnected, disconnectWallet } from './wallet';

const WalletContext = createContext();

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const tryAutoConnect = async () => {
      if (checkWalletConnected()) {
        try {
          const { signer, address } = await connectWallet();
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setSigner(signer);
          setAddress(address);
          setProvider(provider);
          console.log("Auto-connected wallet:", address);
        } catch (err) {
          console.error("Auto-connect failed:", err);
          disconnectWallet();
        }
      }
    };
    tryAutoConnect();
  }, []);

  const handleConnectWallet = async () => {
    try {
      const { signer, address } = await connectWallet();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setSigner(signer);
      setAddress(address);
      setProvider(provider);
    } catch (err) {
      console.error("Wallet connection error:", err);
      throw err;
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setSigner(null);
    setAddress(null);
    setProvider(null);
  };

  const switchChain = async (chainId) => {
    try {
      const chainIdHex = "0x" + chainId.toString(16);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      
      // Update provider and signer after chain switch
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await newProvider.getNetwork();
      
      if (network.chainId !== chainId) {
        throw new Error(`Failed to switch chain. Expected ${chainId}, got ${network.chainId}`);
      }
      
      setProvider(newProvider);
      setSigner(newProvider.getSigner());
      
      return newProvider;
    } catch (err) {
      console.error("Chain switch failed:", err);
      throw err;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        signer,
        address,
        provider,
        connect: handleConnectWallet,
        disconnect: handleDisconnectWallet,
        switchChain,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
} 