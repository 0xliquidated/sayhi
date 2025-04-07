import { useState, useEffect } from "react";
import React from "react";
import { ethers } from "ethers";
import "./App.css";
import { getUserInteractions, saveUserInteraction, getUniqueChainsInteracted, resetUserInteractions } from "./utils/gamification";
import { connectWallet, checkWalletConnected, disconnectWallet } from "./utils/wallet";

// Define matching emojis for each chain
const chainEmojis = {
  ink: "✨",
  base: "🌈",
  arbitrum: "💥",
  berachain: "🐻",
  monad: "🧪",
  energi: "⚡",
  bnb: "🌟",
  op: "🔥",
  soneium: "🎉",
  unichain: "🚀",
  mantle: "🪐",
  bob: "🛠️",
  sei: "🌊",
  telos: "🌐",
  polygon: "⬣",
  avax: "❄️",
  superposition: "⚛️",
  story: "📖",
  interop0: "🔗",
  interop1: "🔗",
};

// Block explorer URLs for each chain
const explorerUrls = {
  ink: "https://explorer.inkonchain.com/",
  base: "https://basescan.org/tx/",
  arbitrum: "https://arbiscan.io/tx/",
  berachain: "https://berascan.com/",
  monad: "https://testnet.monadexplorer.com/",
  energi: "https://explorer.energi.network/",
  bnb: "https://bscscan.com/",
  op: "https://optimistic.etherscan.io/",
  soneium: "https://soneium.blockscout.com/",
  unichain: "https://unichain.blockscout.com/",
  mantle: "https://mantlescan.xyz/tx/",
  bob: "https://explorer.gobob.xyz/tx/",
  sei: "https://seitrace.com/tx/?chain=pacific-1",
  telos: "https://www.teloscan.io/tx/",
  polygon: "https://polygonscan.com/tx/",
  avax: "https://snowtrace.io/tx/",
  superposition: "https://explorer.superposition.so/tx/",
  story: "https://explorer.story.network/tx/",
  interop0: "https://explorer.interop.network/tx/",
  interop1: "https://explorer.interop.network/tx/",
};

// Updated ABI for all chains
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

const chains = {
  ink: { chainId: 57073, address: "0xaAeb1abf363615E8676EAB48f5d08E3FCE70dBe0", abi: contractABI },
  base: { chainId: 8453, address: "0xc7C32Af9cE7dB3e06638761ee6691AD95419a69C", abi: contractABI },
  arbitrum: { chainId: 42161, address: "0xC738E5886706C58E73eaa28a8e9Ed631F8868331", abi: contractABI },
  berachain: { chainId: 80094, address: "0x616e666f49C2651A1028f774c9f4fF4C27524Dc5", abi: contractABI },
  monad: { chainId: 10143, address: "0xb73460E7e22D5544cbA51C7A33ecFAB46bf9de27", abi: contractABI },
  energi: { chainId: 39797, address: "0x4d4Ff1Cb8c75A69E2583D5A1183b2b23F318ed15", abi: contractABI },
  bnb: { chainId: 56, address: "0x6fbe16D026Cda317507D426Fc4C28CE3b3A8f93A", abi: contractABI },
  op: { chainId: 10, address: "0x39b1c43Da4840877c0cDfc2Afc854952c27F28B3", abi: contractABI },
  soneium: { chainId: 1868, address: "0x52301b0437E168f0af1d8b13fF578F2cbC357CdF", abi: contractABI },
  unichain: { chainId: 130, address: "0xDb028404288330CDC7641add7531ed495b5dAFab", abi: contractABI },
  mantle: { chainId: 5000, address: "0xfC2444c375499330cA99CDc54fD7866c23768299", abi: contractABI },
  bob: { chainId: 60808, address: "0x704D2431dE69f72D238B8AD1014901636eD0AF3D", abi: contractABI },
  sei: { chainId: 1329, address: "0x710593070a91C52786A111a26AD6436B846cc561", abi: contractABI },
  telos: { chainId: 40, address: "0x899C8D339CcABa7C1260453419e8a661f1df5F2C", abi: contractABI },
  polygon: { chainId: 137, address: "0x252294F81C909c90291e002e95894DdF020ca2d5", abi: contractABI },
  avax: { chainId: 43114, address: "0x901C4523CdDEb0A7EA8104Cb0454708dfb0142c5", abi: contractABI },
  superposition: { chainId: 55244, address: "0x25e86c4547C526a4D4eC04E808be561B13078013", abi: contractABI },
  story: { chainId: 1514, address: "0x8654507A3e06c41BD5eF53c9B76452949511eB41", abi: contractABI },
  interop0: { chainId: 420120000, address: "0x13c0E5c22d0a45e68Fa6583cdB4a455413B1e9F9", abi: contractABI },
  interop1: { chainId: 420120001, address: "0x13c0E5c22d0a45e68Fa6583cdB4a455413B1e9F9", abi: contractABI },
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

      const chain = chains[chainKey];
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

      // Track the interaction
      saveUserInteraction(chainKey, functionName);

      onSuccess(tx.hash, chainKey);
    } catch (err) {
      console.error(`Error on ${chainKey}:`, err);
      if (err.code === 4902 || err.message.includes("Unrecognized chain ID")) {
        setErrorMessage(
          `${
            chainKey === "ink"
              ? "Ink"
              : chainKey === "base"
              ? "Base"
              : chainKey === "arbitrum"
              ? "Arbitrum"
              : chainKey === "berachain"
              ? "Berachain"
              : chainKey === "monad"
              ? "Monad Testnet"
              : chainKey === "energi"
              ? "Energi"
              : chainKey === "bnb"
              ? "BNB"
              : chainKey === "op"
              ? "OP"
              : chainKey === "soneium"
              ? "Soneium"
              : chainKey === "unichain"
              ? "Unichain"
              : chainKey === "mantle"
              ? "Mantle"
              : chainKey === "bob"
              ? "BOB"
              : chainKey === "sei"
              ? "Sei"
              : chainKey === "telos"
              ? "Telos"
              : chainKey === "polygon"
              ? "Polygon"
              : chainKey === "avax"
              ? "AVAX"
              : chainKey === "superposition"
              ? "Superposition"
              : chainKey === "story"
              ? "Story"
              : chainKey === "interop0"
              ? "Interop0"
              : "Interop1"
          } (Chain ID: ${chains[chainKey].chainId}) is not recognized by Rabby Wallet. Please ensure Rabby Wallet is up to date and supports this chain.`
        );
      } else if (err.message.includes("insufficient funds")) {
        setErrorMessage(
          `Insufficient funds for gas on ${
            chainKey === "ink"
              ? "Ink"
              : chainKey === "base"
              ? "Base"
              : chainKey === "arbitrum"
              ? "Arbitrum"
              : chainKey === "berachain"
              ? "Berachain"
              : chainKey === "monad"
              ? "Monad Testnet"
              : chainKey === "energi"
              ? "Energi"
              : chainKey === "bnb"
              ? "BNB"
              : chainKey === "op"
              ? "OP"
              : chainKey === "soneium"
              ? "Soneium"
              : chainKey === "unichain"
              ? "Unichain"
              : chainKey === "mantle"
              ? "Mantle"
              : chainKey === "bob"
              ? "BOB"
              : chainKey === "sei"
              ? "Sei"
              : chainKey === "telos"
              ? "Telos"
              : chainKey === "polygon"
              ? "Polygon"
              : chainKey === "avax"
              ? "AVAX"
              : chainKey === "superposition"
              ? "Superposition"
              : chainKey === "story"
              ? "Story"
              : chainKey === "interop0"
              ? "Interop0"
              : "Interop1"
          }. Please add ${chainKey === "berachain" ? "BERA" : "ETH"} to your wallet.`
        );
      } else if (err.message.includes("call revert exception")) {
        setErrorMessage(
          `Contract call failed. The contract address or ABI might be incorrect for ${
            chainKey === "ink"
              ? "Ink"
              : chainKey === "base"
              ? "Base"
              : chainKey === "arbitrum"
              ? "Arbitrum"
              : chainKey === "berachain"
              ? "Berachain"
              : chainKey === "monad"
              ? "Monad Testnet"
              : chainKey === "energi"
              ? "Energi"
              : chainKey === "bnb"
              ? "BNB"
              : chainKey === "op"
              ? "OP"
              : chainKey === "soneium"
              ? "Soneium"
              : chainKey === "unichain"
              ? "Unichain"
              : chainKey === "mantle"
              ? "Mantle"
              : chainKey === "bob"
              ? "BOB"
              : chainKey === "sei"
              ? "Sei"
              : chainKey === "telos"
              ? "Telos"
              : chainKey === "polygon"
              ? "Polygon"
              : chainKey === "avax"
              ? "AVAX"
              : chainKey === "superposition"
              ? "Superposition"
              : chainKey === "story"
              ? "Story"
              : chainKey === "interop0"
              ? "Interop0"
              : "Interop1"
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
          {chainKey === "ink"
            ? "Ink"
            : chainKey === "base"
            ? "Base"
            : chainKey === "arbitrum"
            ? "Arbitrum"
            : chainKey === "berachain"
            ? "Berachain"
            : chainKey === "monad"
            ? "Monad Testnet"
            : chainKey === "energi"
            ? "Energi"
            : chainKey === "bnb"
            ? "BNB"
            : chainKey === "op"
            ? "OP"
            : chainKey === "soneium"
            ? "Soneium"
            : chainKey === "unichain"
            ? "Unichain"
            : chainKey === "mantle"
            ? "Mantle"
            : chainKey === "bob"
            ? "BOB"
            : chainKey === "sei"
            ? "Sei"
            : chainKey === "telos"
            ? "Telos"
            : chainKey === "polygon"
            ? "Polygon"
            : chainKey === "avax"
            ? "AVAX"
            : chainKey === "superposition"
            ? "Superposition"
            : chainKey === "story"
            ? "Story"
            : chainKey === "interop0"
            ? "Interop0"
            : "Interop1"
          }{" "}
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

function App() {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");
  const [interactions, setInteractions] = useState(getUserInteractions());
  const [timeRemaining, setTimeRemaining] = useState("");

  const totalChains = Object.keys(chains).length; // 20 chains
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
        const updatedInteractions = resetUserInteractions();
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
    // Update interactions state after a successful transaction
    const updatedInteractions = getUserInteractions();
    setInteractions(updatedInteractions);
  };

  const closePopup = () => {
    setShowPopup(false);
    setTransactionHash("");
    setExplorerUrl("");
  };

  useEffect(() => {
    console.log("App component mounted successfully.");
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-container">
        <div className="header-section">
          <h1>Say Hi on Different Chains</h1>
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
          <h3 className="progress-title">Chain Interaction Progress</h3>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="progress-text">
            Interacted with {uniqueChains} / {totalChains} chains ({Math.round(progressPercentage)}%)
          </p>
          <p className="timer-text">Resets in: {timeRemaining}</p>
        </div>
        <div className="chains-box">
          <div className="chains-row">
            <SayHiButton chainKey="ink" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="base" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="arbitrum" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="berachain" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="monad" signer={signer} onSuccess={handleSuccess} />
          </div>
          <div className="chains-row">
            <SayHiButton chainKey="energi" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="bnb" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="op" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="soneium" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="unichain" signer={signer} onSuccess={handleSuccess} />
          </div>
          <div className="chains-row">
            <SayHiButton chainKey="mantle" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="bob" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="sei" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="telos" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="polygon" signer={signer} onSuccess={handleSuccess} />
          </div>
          <div className="chains-row">
            <SayHiButton chainKey="avax" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="superposition" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="story" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="interop0" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="interop1" signer={signer} onSuccess={handleSuccess} />
          </div>
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

export default App;