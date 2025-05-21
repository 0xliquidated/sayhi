import { useState, useEffect } from "react";
import React from "react";
import { ethers } from "ethers";
import "./App.css";
import { getUserInteractions, saveUserInteraction, getTotalInteractions, handleDailyReset } from "./utils/gamification";
import { connectWallet, checkWalletConnected, disconnectWallet } from "./utils/wallet";
import WalletConnection from "./components/WalletConnection";
import ProgressBar from "./components/ProgressBar";
import ChainInteraction from "./components/ChainInteraction";
import ErrorBoundary from "./components/ErrorBoundary";

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
  canto: "🎶",
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
  canto: "https://tuber.build/tx/",
  degen: "https://explorer.degen.tips/tx/",
  hyperevm: "https://purrsec.com/tx/",
  fraxtal: "https://fraxscan.com/tx/",
  superseed: "", // Placeholder until explorer URL is provided
  swanchain: "" // Placeholder until explorer URL is provided
};

// Contract ABI (consistent across chains)
const contractABI = [
  "function sayHi() public",
  "function sayGM() public",
  "function sayGN() public"
];

// Chain configurations
const chains = {
  ink: { chainId: 57073, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  base: { chainId: 8453, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  arbitrum: { chainId: 42161, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  berachain: { chainId: 80085, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  energi: { chainId: 39797, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  bnb: { chainId: 56, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  op: { chainId: 10, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  soneium: { chainId: 12345, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  unichain: { chainId: 1234567, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  mantle: { chainId: 5000, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  bob: { chainId: 111188, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  sei: { chainId: 713715, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  telos: { chainId: 40, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  polygon: { chainId: 137, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  avax: { chainId: 43114, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  superposition: { chainId: 1234567890, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  story: { chainId: 443, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  polygonzkevm: { chainId: 1101, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  cronos: { chainId: 25, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  zora: { chainId: 7777777, address: "0x8aF5126D8a31352E7AE30713Fc1E7fE608D0c94E", abi: contractABI },
  ethereum: { chainId: 1, address: "0x1C658890D050C4d0159CBc8C30e804Bf0807D443", abi: contractABI },
  sonic: { chainId: 146, address: "0x68659df332eca683b9a64cef777f9ec799f2d9bf", abi: contractABI },
  celo: { chainId: 42220, address: "0x5D4b404ad61A5d66c389d46781Ae407824536b90", abi: contractABI },
  etherlink: { chainId: 42793, address: "0x85bF0e5C33b6927266fDDe48c56DE358d7f6b3Fa", abi: contractABI },
  zircuit: { chainId: 48900, address: "0x49351058EB55f54B1ed1Dd4855c2Cf274EED484c", abi: contractABI },
  expanse: { chainId: 2, address: "0xfcd96b0033ce5433a7550e59e8ab628f2564f01d", abi: contractABI },
  canto: { chainId: 7700, address: "0xD34418c860ADdBB614Ccfe836D889B5C93817891", abi: contractABI },
  degen: { chainId: 666666666, address: "0x2D2f709A6a4A808Bc379e27C6e17F8C1700A6821", abi: contractABI },
  hyperevm: { chainId: 999, address: "0x49351058eb55f54b1ed1dd4855c2cf274eed484c", abi: contractABI },
  fraxtal: { chainId: 252, address: "0x6a1a98510a2eb1181cc9759bE96495118c1790F1", abi: contractABI },
  superseed: { chainId: 53302, address: "0x3eeBF0A07e3833B4dF5042aF0E12854921938Bc1", abi: contractABI },
  swanchain: { chainId: 254, address: "0x2D2f709A6a4A808Bc379e27C6e17F8C1700A6821", abi: contractABI }
};

// Custom RPC URLs for chains (optional, for fallback)
const customRpcUrls = {
  sepolia: "https://rpc.sepolia.dev" // Fallback RPC for Sepolia
};

function App() {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");
  const [interactions, setInteractions] = useState(getUserInteractions());
  const [timeRemaining, setTimeRemaining] = useState("");

  const totalChains = Object.keys(chains).length;
  const totalPossibleInteractions = totalChains * 3;
  const totalInteractions = getTotalInteractions(interactions);

  useEffect(() => {
    const updateTimer = () => {
      const timeRemainingStr = handleDailyReset("lastResetTimeMainnets", (newInteractions) => {
        setInteractions(newInteractions);
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
          disconnectWallet();
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

  const handleTransaction = async (chainKey, functionName) => {
    try {
      const initialProvider = new ethers.providers.Web3Provider(window.ethereum);
      const initialNetwork = await initialProvider.getNetwork();
      console.log(`Current network before switch:`, initialNetwork);

      const chain = chains[chainKey];
      const chainIdHex = chain.chainId.toString();
      console.log(`Switching to chain ${chainKey} (Chain ID: ${chain.chainId})`);
      
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      console.log(`Successfully switched to ${chainKey}`);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(chain.address, chain.abi, signer);

      console.log(`Calling ${functionName} on chain ${chainKey}`);
      const tx = await contract[functionName]();
      console.log(`Transaction sent:`, tx.hash);

      const receipt = await tx.wait();
      console.log(`Transaction confirmed:`, receipt);

      saveUserInteraction(chainKey, functionName);
      handleSuccess(tx.hash, chainKey);

      return { success: true };
    } catch (error) {
      console.error(`Error in ${functionName} on chain ${chainKey}:`, error);
      return { error: error.message };
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <div className="header-section">
          <h1>Say Hi on Different Chains</h1>
          <WalletConnection
            address={address}
            onConnect={handleConnectWallet}
            onDisconnect={handleDisconnectWallet}
          />
        </div>
        <ProgressBar
          title="Chain Interaction Progress"
          totalInteractions={totalInteractions}
          totalPossibleInteractions={totalPossibleInteractions}
          timeRemaining={timeRemaining}
        />
        <div className="chains-box">
          {Object.entries(chains).map(([chainKey], index) => (
            <ChainInteraction
              key={chainKey}
              chainKey={chainKey}
              chainEmoji={chainEmojis[chainKey]}
              signer={signer}
              onSuccess={handleTransaction}
            />
          ))}
        </div>
        {showPopup && (
          <div className="popup-overlay" onClick={closePopup}>
            <div className="popup-content" onClick={e => e.stopPropagation()}>
              <h2>Transaction Sent!</h2>
              <p>
                Transaction Hash: {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
              </p>
              {explorerUrl && (
                <p>
                  <a
                    href={`${explorerUrl}${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transaction-link"
                  >
                    View on Explorer
                  </a>
                </p>
              )}
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