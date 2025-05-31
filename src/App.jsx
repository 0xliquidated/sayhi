import { useState, useEffect, useCallback } from "react";
import React from "react";
import "./App.css";
import { getUserInteractions, getUniqueChainsInteracted, resetUserInteractions } from "./utils/gamification";
import { WalletProvider, useWallet } from "./utils/WalletContext";
import SayHiButton from "./components/SayHiButton";
import { chains } from "./utils/chainData";

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

function ProgressSection({ interactions }) {
  const [timeRemaining, setTimeRemaining] = useState("");
  const totalChains = Object.keys(chains).length;
  const uniqueChains = getUniqueChainsInteracted(interactions);
  const progressPercentage = (uniqueChains / totalChains) * 100;

  const calculateTimeRemaining = useCallback(() => {
    const now = new Date();
    const nextMidnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const diffMs = nextMidnightUTC - now;
    const diffSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const secondsUntilMidnight = (new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)) - now) / 1000;
      setTimeRemaining(calculateTimeRemaining());
      if (secondsUntilMidnight <= 0) {
        resetUserInteractions();
      }
    };
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [calculateTimeRemaining]);

  return (
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
  );
}

function App() {
  const [interactions, setInteractions] = useState(getUserInteractions());

  const handleSuccess = (txHash, chainKey) => {
    const updatedInteractions = getUserInteractions();
    setInteractions(updatedInteractions);
  };

  return (
    <WalletProvider>
      <ErrorBoundary>
        <div className="app-container">
          <div className="header-section">
            <h1>Say Hi on Different Chains</h1>
            <WalletSection />
          </div>
          <ProgressSection interactions={interactions} />
          <div className="chains-box">
            {Object.keys(chains).map((chainKey) => (
              <SayHiButton
                key={chainKey}
                chainKey={chainKey}
                onSuccess={handleSuccess}
              />
            ))}
          </div>
        </div>
      </ErrorBoundary>
    </WalletProvider>
  );
}

export default App;