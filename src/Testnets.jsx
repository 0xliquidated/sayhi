import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import { getUserInteractions, saveUserInteraction, getTotalInteractions, handleDailyReset } from "./utils/gamification";
import { connectWallet, checkWalletConnected, disconnectWallet } from "./utils/wallet";

// Define matching emojis for each chain (testnets only)
const chainEmojis = {
  monad: "🧪",
  interop0: "🔗",
  interop1: "🔗",
  chainbase: "🌉",
  megaeth: "⚡",
  basesepolia: "🌐",
  sepolia: "🛡️",
  opsepolia: "🔴",
  holesky: "🕳️",
  somnia: "🌌",
  rise: "🌅",
  seismic: "🌍" // Emoji for Seismic Devnet
};

// Block explorer URLs for each chain (testnets only)
const explorerUrls = {
  monad: "https://testnet.monadexplorer.com/",
  interop0: "https://explorer.interop.network/tx/",
  interop1: "https://explorer.interop.network/tx/",
  chainbase: "https://testnet.explorer.chainbase.com/",
  megaeth: "https://www.megaexplorer.xyz/",
  basesepolia: "https://base-sepolia.blockscout.com/",
  sepolia: "", // No explorer provided, leaving empty
  opsepolia: "", // No explorer provided, leaving empty
  holesky: "", // No explorer provided, leaving empty
  somnia: "https://shannon-explorer.somnia.network/tx/",
  rise: "https://explorer.testnet.riselabs.xyz/tx/",
  seismic: "" // No explorer provided, leaving empty
};

// Contract ABI (original version without fees)
const contractABI = [
  {
    inputs: [{ internalType: "string", name: "_uniqueSignature", type: "string" }],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "string", name: "message", type: "string" }],
    name: "GMSaid",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "string", name: "message", type: "string" }],
    name: "GNSaid",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: "string", name: "message", type: "string" }],
    name: "HiSaid",
    type: "event"
  },
  { inputs: [], name: "getUniqueSignature", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "sayGM", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "sayGN", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "sayHi", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "uniqueSignature", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" }
];

// Custom RPC URLs for chains (optional, for fallback)
const customRpcUrls = {
  sepolia: "https://rpc.sepolia.dev" // Fallback RPC for Sepolia
};

const testnetChains = {
  monad: { chainId: 10143, address: "0xb73460E7e22D5544cbA51C7A33ecFAB46bf9de27", abi: contractABI },
  interop0: { chainId: 420120000, address: "0x13c0E5c22d0a45e68Fa6583cdB4a455413B1e9F9", abi: contractABI },
  interop1: { chainId: 420120001, address: "0x13c0E5c22d0a45e68Fa6583cdB4a455413B1e9F9", abi: contractABI },
  chainbase: { chainId: 2233, address: "0xfD1754535A8c917Fa6Ef45ec90618a039dB08a09", abi: contractABI },
  megaeth: { chainId: 6342, address: "0x2fa3090ACb91f2674e1B5df2fe779468c2328295", abi: contractABI },
  basesepolia: { chainId: 84532, address: "0xB6E29973B0FEc75dbFD4ED577649a52593174AF8", abi: contractABI },
  sepolia: { chainId: 11155111, address: "0x942cAAE6A6e60f2fa80569D3CA78f20028Aa5ccC", abi: contractABI },
  opsepolia: { chainId: 11155420, address: "0x02FEDfe33f8dd8234e37130864f12E108884773F", abi: contractABI },
  holesky: { chainId: 17000, address: "0xeC29a0F21C3a5F1A21EFb851B139F01Ad7e0252c", abi: contractABI },
  somnia: { chainId: 50312, address: "0xDB9AdD5caf633b26cE940830c6FEFF2AC9A1163e", abi: contractABI },
  rise: { chainId: 11155931, address: "0x6dACdE183936F5B86029823538759D81148BaA4b", abi: contractABI },
  seismic: { chainId: 5124, address: "0x6dACdE183936F5B86029823538759D81148BaA4b", abi: contractABI }
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
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

      let provider = initialProvider;
      if (chainKey === "sepolia" && customRpcUrls.sepolia) {
        provider = new ethers.providers.JsonRpcProvider(customRpcUrls.sepolia);
      }

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

      saveUserInteraction(chainKey, functionName);
      onSuccess(tx.hash, chainKey);
    } catch (err) {
      console.error(`Error on ${chainKey}:`, err);
      if (err.code === 4902 || err.message.includes("Unrecognized chain ID")) {
        setErrorMessage(
          `${
            chainKey === "monad" ? "Monad Testnet" :
            chainKey === "interop0" ? "Interop0" :
            chainKey === "interop1" ? "Interop1" :
            chainKey === "chainbase" ? "Chainbase Testnet" :
            chainKey === "megaeth" ? "MegaEth" :
            chainKey === "basesepolia" ? "Base Sepolia" :
            chainKey === "sepolia" ? "Sepolia" :
            chainKey === "opsepolia" ? "Op Sepolia" :
            chainKey === "holesky" ? "Holesky" :
            chainKey === "somnia" ? "Somnia Testnet" :
            chainKey === "rise" ? "RISE Testnet" :
            chainKey === "seismic" ? "Seismic Devnet" : ""
          } (Chain ID: ${testnetChains[chainKey].chainId}) is not recognized by Rabby Wallet. Please ensure Rabby Wallet is up to date and supports this chain.`
        );
      } else if (err.message.includes("insufficient funds")) {
        setErrorMessage(
          `Insufficient funds for gas on ${
            chainKey === "monad" ? "Monad Testnet" :
            chainKey === "interop0" ? "Interop0" :
            chainKey === "interop1" ? "Interop1" :
            chainKey === "chainbase" ? "Chainbase Testnet" :
            chainKey === "megaeth" ? "MegaEth" :
            chainKey === "basesepolia" ? "Base Sepolia" :
            chainKey === "sepolia" ? "Sepolia" :
            chainKey === "opsepolia" ? "Op Sepolia" :
            chainKey === "holesky" ? "Holesky" :
            chainKey === "somnia" ? "Somnia Testnet" :
            chainKey === "rise" ? "RISE Testnet" :
            chainKey === "seismic" ? "Seismic Devnet" : ""
          }. Please add ETH to your wallet.`
        );
      } else if (err.message.includes("call revert exception")) {
        setErrorMessage(
          `Contract call failed. The contract address or ABI might be incorrect for ${
            chainKey === "monad" ? "Monad Testnet" :
            chainKey === "interop0" ? "Interop0" :
            chainKey === "interop1" ? "Interop1" :
            chainKey === "chainbase" ? "Chainbase Testnet" :
            chainKey === "megaeth" ? "MegaEth" :
            chainKey === "basesepolia" ? "Base Sepolia" :
            chainKey === "sepolia" ? "Sepolia" :
            chainKey === "opsepolia" ? "Op Sepolia" :
            chainKey === "holesky" ? "Holesky" :
            chainKey === "somnia" ? "Somnia Testnet" :
            chainKey === "rise" ? "RISE Testnet" :
            chainKey === "seismic" ? "Seismic Devnet" : ""
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
        <h2 className={chainKey === "monad" ? "monad-testnet" : ""}>
          {matchingEmoji}{" "}
          {chainKey === "monad" ? "Monad Testnet" :
           chainKey === "interop0" ? "Interop0" :
           chainKey === "interop1" ? "Interop1" :
           chainKey === "chainbase" ? "Chainbase Testnet" :
           chainKey === "megaeth" ? "MegaEth" :
           chainKey === "basesepolia" ? "Base Sepolia" :
           chainKey === "sepolia" ? "Sepolia" :
           chainKey === "opsepolia" ? "Op Sepolia" :
           chainKey === "holesky" ? "Holesky" :
           chainKey === "somnia" ? "Somnia Testnet" :
           chainKey === "rise" ? "RISE Testnet" :
           chainKey === "seismic" ? "Seismic Devnet" : ""}{" "}
          {matchingEmoji}
        </h2>
      </div>
      <div className="button-group">
        <button
          className="modern-button"
          onClick={() => handleTransaction("sayHi", setIsLoadingHi)}
          disabled={isLoadingHi || isLoadingGM || isLoadingGN || !signer}
        >
          {isLoadingHi ? <span className="spinner"></span> : "Say Hi"}
        </button>
        <button
          className="modern-button"
          onClick={() => handleTransaction("sayGM", setIsLoadingGM)}
          disabled={isLoadingHi || isLoadingGM || isLoadingGN || !signer}
        >
          {isLoadingGM ? <span className="spinner"></span> : "Say GM"}
        </button>
        <button
          className="modern-button"
          onClick={() => handleTransaction("sayGN", setIsLoadingGN)}
          disabled={isLoadingHi || isLoadingGM || isLoadingGN || !signer}
        >
          {isLoadingGN ? <span className="spinner"></span> : "Say GN"}
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
  const [interactions, setInteractions] = useState(getUserInteractions());
  const [timeRemaining, setTimeRemaining] = useState("");

  const totalChains = Object.keys(testnetChains).length; // 12 chains
  const totalPossibleInteractions = totalChains * 3; // 3 interactions per chain (Say Hi, Say GM, Say GN)
  const totalInteractions = getTotalInteractions(interactions);
  const progressPercentage = Math.min((totalInteractions / totalPossibleInteractions) * 100, 100);

  useEffect(() => {
    const updateTimer = () => {
      const timeRemainingStr = handleDailyReset("lastResetTimeTestnets", (newInteractions) => {
        setInteractions(newInteractions);
        // Force a re-fetch of interactions to ensure state is updated
        const updatedInteractions = getUserInteractions();
        setInteractions(updatedInteractions);
      });
      setTimeRemaining(timeRemainingStr);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, []);

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
          disconnectWallet(); // Reset wallet connection state
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
    } catch (err) {
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
    const updatedInteractions = getUserInteractions();
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
            Interacted {totalInteractions} / {totalPossibleInteractions} times ({Math.round(progressPercentage)}%)
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
            <SayHiButton chainKey="sepolia" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="opsepolia" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="holesky" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="somnia" signer={signer} onSuccess={handleSuccess} />
          </div>
          <div className="chains-row">
            <SayHiButton chainKey="rise" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="seismic" signer={signer} onSuccess={handleSuccess} />
          </div>
        </div>
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>Success! You said Hi!</h2>
              <p>
                Transaction Link:{" "}
                <a href={`${explorerUrl}${transactionHash}`} target="_blank" rel="noopener noreferrer" className="transaction-link">
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