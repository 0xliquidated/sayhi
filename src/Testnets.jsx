import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import { getUserInteractions, saveUserInteraction, getTotalInteractions, handleDailyReset } from "./utils/gamification";
import { WalletProvider, useWallet } from "./utils/WalletContext";
import { SAYHI_CONTRACT_ABI } from './constants/contracts';
import SayHiButton from "./components/SayHiButton";

// Define matching emojis for each chain (testnets only)
export const chainEmojis = {
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
  seismic: "🌍",
  saharaai: "🏜️",
  camp: "🏕️",
  pharos: "🔦"
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
  seismic: "", // No explorer provided, leaving empty
  saharaai: "https://testnet-explorer.saharalabs.ai/",
  camp: "", // No explorer provided, leaving empty
  pharos: "" // No explorer provided yet
};

// Custom RPC URLs for chains (optional, for fallback)
const customRpcUrls = {
  sepolia: "https://rpc.sepolia.dev" // Fallback RPC for Sepolia
};

const testnetChains = {
  monad: { chainId: 10143, address: "0xb73460E7e22D5544cbA51C7A33ecFAB46bf9de27", abi: SAYHI_CONTRACT_ABI },
  interop0: { chainId: 420120000, address: "0x13c0E5c22d0a45e68Fa6583cdB4a455413B1e9F9", abi: SAYHI_CONTRACT_ABI },
  interop1: { chainId: 420120001, address: "0x13c0E5c22d0a45e68Fa6583cdB4a455413B1e9F9", abi: SAYHI_CONTRACT_ABI },
  chainbase: { chainId: 2233, address: "0xfD1754535A8c917Fa6Ef45ec90618a039dB08a09", abi: SAYHI_CONTRACT_ABI },
  megaeth: { chainId: 6342, address: "0x2fa3090ACb91f2674e1B5df2fe779468c2328295", abi: SAYHI_CONTRACT_ABI },
  basesepolia: { chainId: 84532, address: "0xB6E29973B0FEc75dbFD4ED577649a52593174AF8", abi: SAYHI_CONTRACT_ABI },
  sepolia: { chainId: 11155111, address: "0x942cAAE6A6e60f2fa80569D3CA78f20028Aa5ccC", abi: SAYHI_CONTRACT_ABI },
  opsepolia: { chainId: 11155420, address: "0x02FEDfe33f8dd8234e37130864f12E108884773F", abi: SAYHI_CONTRACT_ABI },
  holesky: { chainId: 17000, address: "0xeC29a0F21C3a5F1A21EFb851B139F01Ad7e0252c", abi: SAYHI_CONTRACT_ABI },
  somnia: { chainId: 50312, address: "0xDB9AdD5caf633b26cE940830c6FEFF2AC9A1163e", abi: SAYHI_CONTRACT_ABI },
  rise: { chainId: 11155931, address: "0x6dACdE183936F5B86029823538759D81148BaA4b", abi: SAYHI_CONTRACT_ABI },
  seismic: { chainId: 5124, address: "0x6dACdE183936F5B86029823538759D81148BaA4b", abi: SAYHI_CONTRACT_ABI },
  saharaai: { chainId: 313313, address: "0xD34418c860ADdBB614Ccfe836D889B5C93817891", abi: SAYHI_CONTRACT_ABI },
  camp: { chainId: 123420001114, address: "0x6dACdE183936F5B86029823538759D81148BaA4b", abi: SAYHI_CONTRACT_ABI },
  pharos: { chainId: 688688, address: "0xd34418c860addbb614ccfe836d889b5c93817891", abi: SAYHI_CONTRACT_ABI }
};

// Export testnetChains as chains
export const chains = testnetChains;

export const displayNames = {
  monad: "Monad Testnet",
  interop0: "Interop0",
  interop1: "Interop1",
  chainbase: "Chainbase Testnet",
  megaeth: "MegaEth",
  basesepolia: "Base Sepolia",
  sepolia: "Sepolia",
  opsepolia: "OP Sepolia",
  holesky: "Holesky",
  somnia: "Somnia Testnet",
  rise: "RISE Testnet",
  seismic: "Seismic Devnet",
  saharaai: "Sahara AI Testnet",
  camp: "Camp Testnet",
  pharos: "Pharos Testnet"
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

function WalletSection() {
  const { address, connect, disconnect } = useWallet();
  
  return (
    <div className="wallet-section">
      {address ? (
        <>
          <p className="wallet-address">Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
          <button className="modern-button disconnect-button" onClick={disconnect}>
            Disconnect Wallet
          </button>
        </>
      ) : (
        <button className="modern-button connect-button" onClick={connect}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}

function Testnets() {
  const [interactions, setInteractions] = useState(getUserInteractions());
  const [timeRemaining, setTimeRemaining] = useState("");

  const totalChains = Object.keys(testnetChains).length;
  const totalPossibleInteractions = totalChains * 3;
  const totalInteractions = getTotalInteractions(interactions);
  const progressPercentage = Math.min((totalInteractions / totalPossibleInteractions) * 100, 100);

  const handleSuccess = (txHash, chainKey) => {
    const updatedInteractions = getUserInteractions();
    setInteractions(updatedInteractions);
  };

  useEffect(() => {
    const updateTimer = () => {
      const timeRemainingStr = handleDailyReset("lastResetTimeTestnets", (newInteractions) => {
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

  return (
    <WalletProvider>
      <ErrorBoundary>
        <div className="app-container">
          <div className="header-section">
            <h1>Testnets</h1>
            <WalletSection />
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
            {Object.keys(testnetChains).map((chainKey) => (
              <SayHiButton
                key={chainKey}
                chainKey={chainKey}
                onSuccess={handleSuccess}
                isTestnet={true}
              />
            ))}
          </div>
        </div>
      </ErrorBoundary>
    </WalletProvider>
  );
}

export default Testnets;