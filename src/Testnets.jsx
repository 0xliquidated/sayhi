import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import { getUserInteractions, saveUserInteraction, getUniqueChainsInteracted, resetUserInteractions } from "./utils/gamification";
import { connectWallet, checkWalletConnected, disconnectWallet } from "./utils/wallet";

// Define matching emojis for each chain (only testnets)
const chainEmojis = {
  monad: "🧪",
  interop0: "🔗",
  interop1: "🔗",
  chainbase: "🌉", // Emoji for Chainbase Testnet
  megaeth: "⚡",   // Emoji for MegaEth
  basesepolia: "🌐" // Emoji for Base Sepolia
};

// Block explorer URLs for each chain (only testnets)
const explorerUrls = {
  monad: "https://testnet.monadexplorer.com/",
  interop0: "https://explorer.interop.network/tx/",
  interop1: "https://explorer.interop.network/tx/",
  chainbase: "https://testnet.explorer.chainbase.com/",
  megaeth: "https://www.megaexplorer.xyz/",
  basesepolia: "https://base-sepolia.blockscout.com/"
};

// Updated ABI for all chains (same as before)
const contractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_uniqueSignature",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "GMSaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "GNSaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "HiSaid",
    type: "event",
  },
  {
    inputs: [],
    name: "getUniqueSignature",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "sayGM",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "sayGN",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "sayHi",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "uniqueSignature",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const testnetChains = {
  monad: { chainId: 10143, address: "0xb73460E7e22D5544cbA51C7A33ecFAB46bf9de27", abi: contractABI },
  interop0: { chainId: 420120000, address: "0x13c0E5c22d0a45e68Fa6583cdB4a455413B1e9F9", abi: contractABI },
  interop1: { chainId: 420120001, address: "0x13c0E5c22d0a45e68Fa6583cdB4a455413B1e9F9", abi: contractABI },
  chainbase: { chainId: 2233, address: "0xfD1754535A8c917Fa6Ef45ec90618a039dB08a09", abi: contractABI },
  megaeth: { chainId: 6342, address: "0x2fa3090ACb91f2674e1B5df2fe779468c2328295", abi: contractABI },
  basesepolia: { chainId: 84532, address: "0xB6E29973B0FEc75dbFD4ED577649a52593174AF8", abi: contractABI }
};

// Error Boundary Component to catch rendering errors
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "white", textAlign: "center", padding: "20px" }}>
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message || "Unknown error"}</p>
          <p>Please check the console for more details and refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function SayHiButton({ chainKey, signer, onSuccess }) {
  const [isLoadingHi, setIsLoadingHi] = useState(false);
  const [isLoadingGM, setIsLoadingGM] = useState(false);
  const [isLoadingGN, setIsLoadingGN] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const matchingEmoji = chainEmojis[chainKey];

  const handleTransaction = async (functionName, setIsLoading) => {
    if (!signer) {
      setErrorMessage("Please connect your wallet first!");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const initialProvider = new ethers.providers.Web3Provider(window.ethereum);
      const initialNetwork = await initialProvider.getNetwork();
      console.log(`Current network before switch:`, initialNetwork);

      const chain = testnetChains[chainKey];
      const chainIdHex = "0x" + chain.chainId.toString(16);
      console.log(`Switching to chain ${chainKey} (Chain ID: ${chain.chainId}, Hex: ${chainIdHex})`);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      console.log(`Successfully switched to ${chainKey}`);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      console.log(`Current network after switch:`, network);
      if (network.chainId !== chain.chainId) {
        throw new Error(`Failed to switch to ${chainKey}. Current chain ID: ${network.chainId}`);
      }

      console.log(`Calling ${functionName} at address ${chain.address} on ${chainKey}`);
      const updatedSigner = provider.getSigner();
      const contract = new ethers.Contract(chain.address, chain.abi, updatedSigner);
      const tx = await contract[functionName]();
      console.log(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`Transaction confirmed: ${tx.hash}`);

      // Track the interaction (testnets)
      saveUserInteraction(chainKey, functionName, true);

      onSuccess(tx.hash, chainKey);
    } catch (err) {
      console.error(`Error on ${chainKey}:`, err);
      if (err.code === 4902 || err.message.includes("Unrecognized chain ID")) {
        setErrorMessage(
          `${
            chainKey === "monad"
              ? "Monad Testnet"
              : chainKey === "interop0"
              ? "Interop0"
              : chainKey === "interop1"
              ? "Interop1"
              : chainKey === "chainbase"
              ? "Chainbase Testnet"
              : chainKey === "megaeth"
              ? "MegaEth"
              : chainKey === "basesepolia"
              ? "Base Sepolia"
              : ""
          } (Chain ID: ${testnetChains[chainKey].chainId}) is not recognized by Rabby Wallet. Please ensure Rabby Wallet is up to date and supports this chain.`
        );
      } else if (err.message.includes("insufficient funds")) {
        setErrorMessage(
          `Insufficient funds for gas on ${
            chainKey === "monad"
              ? "Monad Testnet"
              : chainKey === "interop0"
              ? "Interop0"
              : chainKey === "interop1"
              ? "Interop1"
              : chainKey === "chainbase"
              ? "Chainbase Testnet"
              : chainKey === "megaeth"
              ? "MegaEth"
              : chainKey === "basesepolia"
              ? "Base Sepolia"
              : ""
          }. Please add ETH to your wallet.`
        );
      } else if (err.message.includes("call revert exception")) {
        setErrorMessage(
          `Contract call failed. The contract address or ABI might be incorrect for ${
            chainKey === "monad"
              ? "Monad Testnet"
              : chainKey === "interop0"
              ? "Interop0"
              : chainKey === "interop1"
              ? "Interop1"
              : chainKey === "chainbase"
              ? "Chainbase Testnet"
              : chainKey === "megaeth"
              ? "MegaEth"
              : chainKey === "basesepolia"
              ? "Base Sepolia"
              : ""
          }.`
        );
      } else {
        setErrorMessage(`Error: ${err.message || `Failed to ${functionName}`}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chain-item">
      <div className="chain-name">
        <h2>
          {matchingEmoji}{" "}
          {chainKey === "monad"
            ? "Monad Testnet"
            : chainKey === "interop0"
            ? "Interop0"
            : chainKey === "interop1"
            ? "Interop1"
            : chainKey === "chainbase"
            ? "Chainbase Testnet"
            : chainKey === "megaeth"
            ? "MegaEth"
            : chainKey === "basesepolia"
            ? "Base Sepolia"
            : ""}{" "}
          {matchingEmoji}
        </h2>
      </div>
      <div className="button-group">
        <button
          className="modern-button"
          onClick={() => handleTransaction("sayHi", setIsLoadingHi)}
          disabled={isLoadingHi || isLoadingGM || isLoadingGN || !signer}
        >
          {isLoadingHi ? "Saying Hi..." : "Say Hi"}
        </button>
        <button
          className="modern-button"
          onClick={() => handleTransaction("sayGM", setIsLoadingGM)}
          disabled={isLoadingHi || isLoadingGM || isLoadingGN || !signer}
        >
          {isLoadingGM ? "Saying GM..." : "Say GM"}
        </button>
        <button
          className="modern-button"
          onClick={() => handleTransaction("sayGN", setIsLoadingGN)}
          disabled={isLoadingHi || isLoadingGM || isLoadingGN || !signer}
        >
          {isLoadingGN ? "Saying GN..." : "Say GN"}
        </button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

function Testnets() {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");
  const [interactions, setInteractions] = useState(getUserInteractions(true));
  const [timeRemaining, setTimeRemaining] = useState("");

  const totalChains = Object.keys(testnetChains).length; // Now 6 chains
  const uniqueChains = getUniqueChainsInteracted(interactions);
  const progressPercentage = (uniqueChains / totalChains) * 100;

  // Function to calculate time remaining until next midnight UTC
  const calculateTimeRemaining = () => {
    const now = new Date();
    const nextMidnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const diffMs = nextMidnightUTC - now;
    const diffSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Update timer every second and reset progress bar at midnight UTC
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const secondsUntilMidnight = (new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)) - now) / 1000;

      // Update time remaining
      setTimeRemaining(calculateTimeRemaining());

      // Reset progress bar at midnight UTC
      if (secondsUntilMidnight <= 0) {
        const updatedInteractions = resetUserInteractions(true);
        setInteractions(updatedInteractions);
      }
    };

    // Initial update
    updateTimer();

    // Update every second
    const timerInterval = setInterval(updateTimer, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timerInterval);
  }, []);

  // Auto-connect wallet on page load if previously connected
  useEffect(() => {
    const tryAutoConnect = async () => {
      if (checkWalletConnected()) {
        try {
          const { signer, address } = await connectWallet();
          setSigner(signer);
          setAddress(address);
          console.log("Auto-connected wallet:", address);
        } catch (err) {
          console.error("Auto-connect failed:", err);
          setWalletConnected(false);
        }
      }
    };

    tryAutoConnect();
  }, []);

  const handleConnectWallet = async () => {
    try {
      const { signer, address } = await connectWallet();
      setSigner(signer);
      setAddress(address);
    } catch ( 이름을) {
      console.error("Wallet connection error:", err);
      alert(`Error: ${err.message || "Failed to connect wallet"}`);
    }
  };

  const handleDisconnectWallet = () => {
    const { signer, address } = disconnectWallet();
    setSigner(signer);
    setAddress(address);
    console.log("Wallet disconnected");
  };

  const handleSuccess = (txHash, chainKey) => {
    setTransactionHash(txHash);
    setExplorerUrl(explorerUrls[chainKey]);
    setShowPopup(true);
    // Update interactions state after a successful transaction
    const updatedInteractions = getUserInteractions(true);
    setInteractions(updatedInteractions);
  };

  const closePopup = () => {
    setShowPopup(false);
    setTransactionHash("");
    setExplorerUrl("");
  };

  useEffect(() => {
    console.log("Testnets component mounted successfully.");
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <div className="header-section">
          <h1>Testnets</h1>
          <div className="wallet-section">
            {address ? (
              <>
                <p className="wallet-address">Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
                <button className="modern-button disconnect-button" onClick={handleDisconnectWallet}>
                  Disconnect Wallet
                </button>
              </>
            ) : (
              <button className="modern-button connect-button" onClick={handleConnectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        <div className="progress-section">
          <h3 className="progress-title">Testnet Interaction Progress</h3>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="progress-text">
            Interacted with {uniqueChains} / {totalChains} testnet chains ({Math.round(progressPercentage)}%)
          </p>
          <p className="timer-text">Resets in: {timeRemaining}</p>
        </div>
        <div className="chains-box">
          <div className="chains-row">
            <SayHiButton chainKey="monad" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="interop0" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="interop1" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="chainbase" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="megaeth" signer={signer} onSuccess={handleSuccess} />
          </div>
          <div className="chains-row">
            <SayHiButton chainKey="basesepolia" signer={signer} onSuccess={handleSuccess} />
          </div>
          <div className="chains-row"></div>
          <div className="chains-row"></div>
          <div className="chains-row"></div>
        </div>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>Success! You said Hi!</h2>
              <p>
                Transaction Link:{" "}
                <a
                  href={`${explorerUrl}${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transaction-link"
                >
                  View on Explorer
                </a>
              </p>
              <button className="modern-button close-button" onClick={closePopup}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default Testnets;