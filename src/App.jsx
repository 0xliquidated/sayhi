import { useState, useEffect } from "react";
import React from "react";
import { ethers } from "ethers";
import "./App.css";

// Define matching emojis for each chain
const chainEmojis = {
  ink: "✨",
  base: "🌈",
  arbitrum: "💥",
  berachain: "🐻",
  monad: "🧪",
};

// Block explorer URLs for each chain
const explorerUrls = {
  ink: "https://inkscan.io/tx/",
  base: "https://basescan.org/tx/",
  arbitrum: "https://arbiscan.io/tx/",
  berachain: "https://bartio.berascan.io/tx/",
  monad: "https://monad-testnet-explorer.monad.xyz/tx/",
};

// ABI for all chains (updated with new functions)
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
  ink: {
    chainId: 57073,
    address: "0xf59C78F2CAB3E79Ad4E439366A4656BE653baeDA", // Replace with new address after redeployment
    abi: contractABI,
  },
  base: {
    chainId: 8453,
    address: "0x5Df1ff9aCf0Fa486c8D18188303Fc9b300DcEAfC", // Replace with new address after redeployment
    abi: contractABI,
  },
  arbitrum: {
    chainId: 42161,
    address: "0x4a86E790E31Cf11F85ac585099f46Bd7c99a1261", // Replace with new address after redeployment
    abi: contractABI,
  },
  berachain: {
    chainId: 80094,
    address: "0x442c321040060881Cb49BeEa1Dfa6c272ecd7acE", // Replace with new address after redeployment
    abi: contractABI,
  },
  monad: {
    chainId: 10143,
    address: "0x95A1F2ad3f59E81256cBE890A4BCF62a1C3B9407", // Replace with new address after redeployment
    abi: contractABI,
  },
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
      // Log the current network before switching
      const initialProvider = new ethers.providers.Web3Provider(window.ethereum);
      const initialNetwork = await initialProvider.getNetwork();
      console.log(`Current network before switch:`, initialNetwork);

      // Switch to the chain
      const chain = chains[chainKey];
      const chainIdHex = "0x" + chain.chainId.toString(16);
      console.log(`Switching to chain ${chainKey} (Chain ID: ${chain.chainId}, Hex: ${chainIdHex})`);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      console.log(`Successfully switched to ${chainKey}`);

      // Verify the current chain after switching
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      console.log(`Current network after switch:`, network);
      if (network.chainId !== chain.chainId) {
        throw new Error(`Failed to switch to ${chainKey}. Current chain ID: ${network.chainId}`);
      }

      // Proceed with the contract call
      console.log(`Calling ${functionName} at address ${chain.address} on ${chainKey}`);
      const updatedSigner = provider.getSigner();
      const contract = new ethers.Contract(chain.address, chain.abi, updatedSigner);
      const tx = await contract[functionName]();
      console.log(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`Transaction confirmed: ${tx.hash}`);

      // Trigger the pop-up with transaction details
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
              : "Monad"
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
              : "Monad"
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
              : "Monad"
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
          : "Monad"}{" "}
        {matchingEmoji}
      </h2>
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

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install a wallet like Rabby!");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setSigner(signer);
      setAddress(address);
      console.log("Wallet connected:", address);
    } catch (err) {
      console.error("Wallet connection error:", err);
      alert(`Error: ${err.message || "Failed to connect wallet"}`);
    }
  };

  const handleSuccess = (txHash, chainKey) => {
    setTransactionHash(txHash);
    setExplorerUrl(explorerUrls[chainKey]);
    setShowPopup(true);
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
              <p className="wallet-address">Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
            ) : (
              <button className="modern-button connect-button" onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        <div className="chains-box">
          <div className="chains-container">
            <SayHiButton chainKey="ink" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="base" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="arbitrum" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="berachain" signer={signer} onSuccess={handleSuccess} />
            <SayHiButton chainKey="monad" signer={signer} onSuccess={handleSuccess} />
          </div>
        </div>

        {/* Pop-up for successful transaction */}
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