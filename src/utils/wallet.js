import { ethers } from "ethers";

// Key for localStorage
const WALLET_CONNECTED_KEY = "walletConnected";

// Check if wallet was previously connected
export const checkWalletConnected = () => {
  return localStorage.getItem(WALLET_CONNECTED_KEY) === "true";
};

// Set wallet connection state in localStorage
export const setWalletConnected = (connected) => {
  localStorage.setItem(WALLET_CONNECTED_KEY, connected ? "true" : "false");
};

// Connect wallet and return signer and address
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("Please install a wallet like Rabby!");
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setWalletConnected(true);
    return { signer, address };
  } catch (err) {
    setWalletConnected(false);
    throw err;
  }
};

// Disconnect wallet
export const disconnectWallet = () => {
  setWalletConnected(false);
  return { signer: null, address: null };
};