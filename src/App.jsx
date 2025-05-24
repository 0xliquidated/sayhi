import { useState, useEffect } from "react";
import React from "react";
import { ethers } from "ethers";
import "./App.css";
import { getUserInteractions, saveUserInteraction, getUniqueChainsInteracted, resetUserInteractions } from "./utils/gamification";
import { connectWallet, checkWalletConnected, disconnectWallet } from "./utils/wallet";

// Define matching emojis for each chain (mainnets only)
const chainEmojis = {
  ink: "✨",
  base: "🌈",
  arbitrum: "💥",
  berachain: "🐻",
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
  polygonzkevm: "🔒",
  cronos: "⏳",
  zora: "🎨",
  ethereum: "Ξ",
  sonic: "🎵",
  celo: "🌿",
  etherlink: "🔗",
  zircuit: "⚡️",
  expanse: "🌍",
  degen: "😈",
  hyperevm: "🌌",
  fraxtal: "💎",
  superseed: "🌱",
  swanchain: "🦢"
};

// Block explorer URLs for each chain (mainnets only)
const explorerUrls = {
  ink: "https://explorer.inkonchain.com/",
  base: "https://basescan.org/tx/",
  arbitrum: "https://arbiscan.io/tx/",
  berachain: "https://berascan.com/",
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
  polygonzkevm: "https://zkevm.polygonscan.com/tx/",
  cronos: "", // Placeholder until explorer URL is provided
  zora: "https://explorer.zora.energy/tx/",
  ethereum: "https://etherscan.io/tx/",
  sonic: "https://sonicscan.org/",
  celo: "https://celo.blockscout.com/",
  etherlink: "https://explorer.etherlink.com/tx/",
  zircuit: "https://explorer.zircuit.com/tx/",
  expanse: "https://explorer.expanse.tech/tx/",
  degen: "https://explorer.degen.tips/tx/",
  hyperevm: "https://purrsec.com/tx/",
  fraxtal: "https://fraxscan.com/tx/"
};

// Contract ABI (consistent across chains)
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

const chains = {
  ink: { chainId: 57073, address: "0xaAeb1abf363615E8676EAB48f5d08E3FCE70dBe0", abi: contractABI },
  base: { chainId: 8453, address: "0xc7C32Af9cE7dB3e06638761ee6691AD95419a69C", abi: contractABI },
  arbitrum: { chainId: 42161, address: "0xC738E5886706C58E73eaa28a8e9Ed631F8868331", abi: contractABI },
  berachain: { chainId: 80094, address: "0x616e666f49C2651A1028f774c9f4fF4C27524Dc5", abi: contractABI },
  energi: { chainId: 39797, address: "0x4d4Ff1Cb8c75A69E2583D5A1183b2b23F318ed15", abi: contractABI },
  bnb: { chainId: 56, address: "0x6fbe16D026Cda317507D426Fc4C28CE3b3A8f93A", abi: contractABI },
  op: { chainId: 10, address: "0x39b1c43Da4840877c0cDfc2Afc854952c27F28B3", abi: contractABI },
  soneium: { chainId: 1868, address: "0x52301b0437E168f0af1d8b13fF578F2cbC357CdF", abi: contractABI },
  unichain: { chainId: 130, address: "0xDb028404288330CDC7641add7531ed495b5dAFab", abi: contractABI },
  mantle: { chainId: 5000, address: "0xfC2444c375499330cA99CDc54fD7866c23768299", abi: contractABI },
  bob: { chainId: 60808, address: "0x704D2431dE69f72D238B8AD1014901636eD0AF3D", abi: contractABI },
  sei: { chainId: 713715, address: "0x710593070a91C52786A111a26AD6436B846cc561", abi: contractABI },
  telos: { chainId: 40, address: "0x899C8D339CcABa7C1260453419e8a661f1df5F2C", abi: contractABI },
  polygon: { chainId: 137, address: "0x252294F81C909c90291e002e95894DdF020ca2d5", abi: contractABI },
  avax: { chainId: 43114, address: "0x901C4523CdDEb0A7EA8104Cb0454708dfb0142c5", abi: contractABI },
  superposition: { chainId: 55244, address: "0x25e86c4547C526a4D4eC04E808be561B13078013", abi: contractABI },
  story: { chainId: 1514, address: "0x8654507A3e06c41BD5eF53c9B76452949511eB41", abi: contractABI },
  polygonzkevm: { chainId: 1101, address: "0xf2Ab98c7EE971f9B9eb612e1501fefA2fB087F82", abi: contractABI },
  cronos: { chainId: 25, address: "0xD34418c860ADdBB614Ccfe836D889B5C93817891", abi: contractABI },
  zora: { chainId: 7777777, address: "0x8aF5126D8a31352E7AE30713Fc1E7fE608D0c94E", abi: contractABI },
  ethereum: { chainId: 1, address: "0x1C658890D050C4d0159CBc8C30e804Bf0807D443", abi: contractABI },
  sonic: { chainId: 146, address: "0x68659df332eca683b9a64cef777f9ec799f2d9bf", abi: contractABI },
  celo: { chainId: 42220, address: "0x5D4b404ad61A5d66c389d46781Ae407824536b90", abi: contractABI },
  etherlink: { chainId: 42793, address: "0x85bF0e5C33b6927266fDDe48c56DE358d7f6b3Fa", abi: contractABI },
  zircuit: { chainId: 48900, address: "0x49351058EB55f54B1ed1Dd4855c2Cf274EED484c", abi: contractABI },
  expanse: { chainId: 2, address: "0xfcd96b0033ce5433a7550e59e8ab628f2564f01d", abi: contractABI },
  degen: { chainId: 666666666, address: "0x2D2f709A6a4A808Bc379e27C6e17F8C1700A6821", abi: contractABI },
  hyperevm: { chainId: 999, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  fraxtal: { chainId: 252, address: "0x6a1a98510a2eb1181cc9759bE96495118c1790F1", abi: contractABI },
  superseed: { chainId: 5330, address: "0x3eeBF0A07e3833B4dF5042aF0E12854921938Bc1", abi: contractABI },
  swanchain: { chainId: 254, address: "0x2D2f709A6a4A808Bc379e27C6e17F8C1700A6821", abi: contractABI }
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

      saveUserInteraction(chainKey, functionName, false);
      onSuccess(tx.hash, chainKey);
    } catch (err) {
      console.error(`Error on ${chainKey}:`, err);
      if (err.code === 4902 || err.message.includes("Unrecognized chain ID")) {
        setErrorMessage(
          `${
            chainKey === "ink" ? "Ink" :
            chainKey === "base" ? "Base" :
            chainKey === "arbitrum" ? "Arbitrum" :
            chainKey === "berachain" ? "Berachain" :
            chainKey === "energi" ? "Energi" :
            chainKey === "bnb" ? "BNB" :
            chainKey === "op" ? "OP" :
            chainKey === "soneium" ? "Soneium" :
            chainKey === "unichain" ? "Unichain" :
            chainKey === "mantle" ? "Mantle" :
            chainKey === "bob" ? "BOB" :
            chainKey === "sei" ? "Sei" :
            chainKey === "telos" ? "Telos" :
            chainKey === "polygon" ? "Polygon" :
            chainKey === "avax" ? "AVAX" :
            chainKey === "superposition" ? "Superposition" :
            chainKey === "story" ? "Story" :
            chainKey === "polygonzkevm" ? "PolygonZK" :
            chainKey === "cronos" ? "Cronos" :
            chainKey === "zora" ? "Zora" :
            chainKey === "ethereum" ? "Ethereum" :
            chainKey === "sonic" ? "Sonic" :
            chainKey === "celo" ? "Celo" :
            chainKey === "etherlink" ? "Etherlink" :
            chainKey === "zircuit" ? "Zircuit" :
            chainKey === "expanse" ? "Expanse" :
            chainKey === "degen" ? "Degen" :
            chainKey === "hyperevm" ? "HyperEVM" :
            chainKey === "fraxtal" ? "Fraxtal" : ""
          } (Chain ID: ${chains[chainKey].chainId}) is not recognized by Rabby Wallet. Please ensure Rabby Wallet is up to date and supports this chain.`
        );
      } else if (err.message.includes("insufficient funds")) {
        setErrorMessage(
          `Insufficient funds for gas on ${
            chainKey === "ink" ? "Ink" :
            chainKey === "base" ? "Base" :
            chainKey === "arbitrum" ? "Arbitrum" :
            chainKey === "berachain" ? "Berachain" :
            chainKey === "energi" ? "Energi" :
            chainKey === "bnb" ? "BNB" :
            chainKey === "op" ? "OP" :
            chainKey === "soneium" ? "Soneium" :
            chainKey === "unichain" ? "Unichain" :
            chainKey === "mantle" ? "Mantle" :
            chainKey === "bob" ? "BOB" :
            chainKey === "sei" ? "Sei" :
            chainKey === "telos" ? "Telos" :
            chainKey === "polygon" ? "Polygon" :
            chainKey === "avax" ? "AVAX" :
            chainKey === "superposition" ? "Superposition" :
            chainKey === "story" ? "Story" :
            chainKey === "polygonzkevm" ? "PolygonZK" :
            chainKey === "cronos" ? "Cronos" :
            chainKey === "zora" ? "Zora" :
            chainKey === "ethereum" ? "Ethereum" :
            chainKey === "sonic" ? "Sonic" :
            chainKey === "celo" ? "Celo" :
            chainKey === "etherlink" ? "Etherlink" :
            chainKey === "zircuit" ? "Zircuit" :
            chainKey === "expanse" ? "Expanse" :
            chainKey === "degen" ? "Degen" :
            chainKey === "hyperevm" ? "HyperEVM" :
            chainKey === "fraxtal" ? "Fraxtal" : ""
          }. Please add ${chainKey === "berachain" ? "BERA" : "ETH"} to your wallet.`
        );
      } else if (err.message.includes("call revert exception")) {
        setErrorMessage(
          `Contract call failed. The contract address or ABI might be incorrect for ${
            chainKey === "ink" ? "Ink" :
            chainKey === "base" ? "Base" :
            chainKey === "arbitrum" ? "Arbitrum" :
            chainKey === "berachain" ? "Berachain" :
            chainKey === "energi" ? "Energi" :
            chainKey === "bnb" ? "BNB" :
            chainKey === "op" ? "OP" :
            chainKey === "soneium" ? "Soneium" :
            chainKey === "unichain" ? "Unichain" :
            chainKey === "mantle" ? "Mantle" :
            chainKey === "bob" ? "BOB" :
            chainKey === "sei" ? "Sei" :
            chainKey === "telos" ? "Telos" :
            chainKey === "polygon" ? "Polygon" :
            chainKey === "avax" ? "AVAX" :
            chainKey === "superposition" ? "Superposition" :
            chainKey === "story" ? "Story" :
            chainKey === "polygonzkevm" ? "PolygonZK" :
            chainKey === "cronos" ? "Cronos" :
            chainKey === "zora" ? "Zora" :
            chainKey === "ethereum" ? "Ethereum" :
            chainKey === "sonic" ? "Sonic" :
            chainKey === "celo" ? "Celo" :
            chainKey === "etherlink" ? "Etherlink" :
            chainKey === "zircuit" ? "Zircuit" :
            chainKey === "expanse" ? "Expanse" :
            chainKey === "degen" ? "Degen" :
            chainKey === "hyperevm" ? "HyperEVM" :
            chainKey === "fraxtal" ? "Fraxtal" : ""
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
        <h2 className={chainKey === "superposition" ? "superposition" : ""}>
          {matchingEmoji}{" "}
          {chainKey === "ink" ? "Ink" :
           chainKey === "base" ? "Base" :
           chainKey === "arbitrum" ? "Arbitrum" :
           chainKey === "berachain" ? "Berachain" :
           chainKey === "energi" ? "Energi" :
           chainKey === "bnb" ? "BNB" :
           chainKey === "op" ? "OP" :
           chainKey === "soneium" ? "Soneium" :
           chainKey === "unichain" ? "Unichain" :
           chainKey === "mantle" ? "Mantle" :
           chainKey === "bob" ? "BOB" :
           chainKey === "sei" ? "Sei" :
           chainKey === "telos" ? "Telos" :
           chainKey === "polygon" ? "Polygon" :
           chainKey === "avax" ? "AVAX" :
           chainKey === "superposition" ? "Superposition" :
           chainKey === "story" ? "Story" :
           chainKey === "polygonzkevm" ? "PolygonZK" :
           chainKey === "cronos" ? "Cronos" :
           chainKey === "zora" ? "Zora" :
           chainKey === "ethereum" ? "Ethereum" :
           chainKey === "sonic" ? "Sonic" :
           chainKey === "celo" ? "Celo" :
           chainKey === "etherlink" ? "Etherlink" :
           chainKey === "zircuit" ? "Zircuit" :
           chainKey === "expanse" ? "Expanse" :
           chainKey === "degen" ? "Degen" :
           chainKey === "hyperevm" ? "HyperEVM" :
           chainKey === "fraxtal" ? "Fraxtal" :
           chainKey === "superseed" ? "Superseed" :
           chainKey === "swanchain" ? "Swanchain" : ""}{" "}
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

function App() {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [interactions, setInteractions] = useState(getUserInteractions());
  const [timeRemaining, setTimeRemaining] = useState("");

  const totalChains = Object.keys(chains).length;
  const uniqueChains = getUniqueChainsInteracted(interactions);
  const progressPercentage = (uniqueChains / totalChains) * 100;

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

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const secondsUntilMidnight = (new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)) - now) / 1000;
      setTimeRemaining(calculateTimeRemaining());
      if (secondsUntilMidnight <= 0) {
        resetUserInteractions(); // Clear localStorage
        setInteractions({}); // Reset state to empty object
      }
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
    const updatedInteractions = getUserInteractions();
    setInteractions(updatedInteractions);
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
          <SayHiButton chainKey="ink" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="base" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="arbitrum" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="berachain" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="energi" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="bnb" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="op" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="soneium" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="unichain" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="mantle" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="bob" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="sei" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="telos" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="polygon" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="avax" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="superposition" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="story" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="polygonzkevm" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="cronos" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="zora" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="ethereum" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="sonic" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="celo" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="etherlink" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="zircuit" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="expanse" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="degen" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="hyperevm" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="fraxtal" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="superseed" signer={signer} onSuccess={handleSuccess} />
          <SayHiButton chainKey="swanchain" signer={signer} onSuccess={handleSuccess} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;