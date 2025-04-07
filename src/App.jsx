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
  energi: "⚡",
  bnb: "🌟",
  op: "🔥",
  soneium: "🎉",
  unichain: "🚀",
  mantle: "🪐",
  bob: "🛠️",      // Emoji for BOB (tools, since it’s "Build on Bitcoin")
  sei: "🌊",      // Emoji for Sei (wave, for its fast "Pacific" chain)
  telos: "🌐",    // Emoji for Telos (globe, for its network focus)
  polygon: "⬣",   // Emoji for Polygon (geometric shape)
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
  bob: "https://explorer.gobob.xyz/tx/",         // Added /tx/ for consistency
  sei: "https://seitrace.com/tx/?chain=pacific-1", // Added /tx/ for consistency
  telos: "https://www.teloscan.io/tx/",          // Added /tx/ for consistency
  polygon: "https://polygonscan.com/tx/",        // Added /tx/ for consistency
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
      const network = await provider.getNetwork(); // Fixed typo
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
              : "Polygon"
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
              : "Polygon"
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
              : "Polygon"
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
            : "Polygon"
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