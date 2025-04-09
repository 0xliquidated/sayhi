import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import { connectWallet, checkWalletConnected, disconnectWallet } from "./utils/wallet";

// Ponzi contract ABI (same as before)
const ponziABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "BurnedAndDoubled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Claimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "EnteredPonzi",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BASE_EMISSION_RATE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "burnAndDouble",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "calculateAccumulatedTokens",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "subtractedValue",
        "type": "uint256"
      }
    ],
    "name": "decreaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "enterPonzi",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "getAccumulatedTokens",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "getEmissionRate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "hasUserEntered",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "addedValue",
        "type": "uint256"
      }
    ],
    "name": "increaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "bool",
        "name": "hasEntered",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "lastUpdate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "accumulatedTokens",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "emissionRate",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Ponzi contract details (starting with Monad Testnet, placeholders for others)
const ponziChains = {
  monad: {
    chainId: 10143,
    address: "0xC4caeD6426a8B741b9157213ef92F6ffE82508AE",
    abi: ponziABI,
    name: "Monad Testnet",
    emoji: "🧪"
  },
  placeholder1: {
    chainId: 0, // Placeholder
    address: "0x0000000000000000000000000000000000000000",
    abi: ponziABI,
    name: "Coming Soon",
    emoji: "⏳"
  },
  placeholder2: {
    chainId: 0, // Placeholder
    address: "0x0000000000000000000000000000000000000000",
    abi: ponziABI,
    name: "Coming Soon",
    emoji: "⏳"
  }
};

// Error Boundary Component (defined locally to avoid import issues)
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

function PonziGameCard({ chainKey, signer, address }) {
  const [hasEntered, setHasEntered] = useState(false);
  const [accumulatedTokens, setAccumulatedTokens] = useState(0);
  const [emissionRate, setEmissionRate] = useState(0);
  const [balance, setBalance] = useState(0);
  const [isLoadingEnter, setIsLoadingEnter] = useState(false);
  const [isLoadingClaim, setIsLoadingClaim] = useState(false);
  const [isLoadingBurn, setIsLoadingBurn] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Update accumulated tokens and user state every second
  useEffect(() => {
    if (!signer || !address || chainKey === "placeholder1" || chainKey === "placeholder2") return;

    const updateUserState = async () => {
      try {
        const chain = ponziChains[chainKey];
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(chain.address, chain.abi, provider);

        // Check if user has entered
        const entered = await contract.hasUserEntered(address);
        setHasEntered(entered);

        if (entered) {
          // Get accumulated tokens
          const tokens = await contract.getAccumulatedTokens(address);
          setAccumulatedTokens(ethers.utils.formatEther(tokens));

          // Get emission rate
          const rate = await contract.getEmissionRate(address);
          setEmissionRate(ethers.utils.formatEther(rate));

          // Get user's balance
          const bal = await contract.balanceOf(address);
          setBalance(ethers.utils.formatEther(bal));
        }
      } catch (err) {
        console.error(`Error updating user state for ${chainKey}:`, err);
      }
    };

    updateUserState();
    const interval = setInterval(updateUserState, 1000); // Update every second
    return () => clearInterval(interval);
  }, [signer, address, chainKey]);

  const switchNetwork = async (chain) => {
    try {
      const chainIdHex = "0x" + chain.chainId.toString(16);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== chain.chainId) {
        throw new Error(`Failed to switch to ${chain.name}. Current chain ID: ${network.chainId}`);
      }
    } catch (switchError) {
      // If the chain is not added to the wallet, add it
      if (switchError.code === 4902 || switchError.message.includes("Unrecognized chain ID")) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x" + chain.chainId.toString(16),
                chainName: chain.name,
                rpcUrls: ["https://testnet-rpc.monad.xyz"], // Replace with actual Monad Testnet RPC URL
                nativeCurrency: {
                  name: "Monad",
                  symbol: "MONAD",
                  decimals: 18
                },
                blockExplorerUrls: ["https://testnet.monadexplorer.com/"]
              }
            ]
          });
        } catch (addError) {
          throw new Error(`Failed to add ${chain.name} to wallet: ${addError.message}`);
        }
      } else {
        throw switchError;
      }
    }
  };

  const handleEnterPonzi = async () => {
    if (!signer) {
      setErrorMessage("Please connect your wallet first!");
      return;
    }

    if (chainKey === "placeholder1" || chainKey === "placeholder2") {
      setErrorMessage("This chain is coming soon!");
      return;
    }

    setIsLoadingEnter(true);
    setErrorMessage(null);
    try {
      const chain = ponziChains[chainKey];
      await switchNetwork(chain);

      const contract = new ethers.Contract(chain.address, chain.abi, signer);
      const tx = await contract.enterPonzi();
      await tx.wait();

      setHasEntered(true);
    } catch (err) {
      console.error(`Error entering Ponzi on ${chainKey}:`, err);
      setErrorMessage(`Error: ${err.message || "Failed to enter Ponzi"}`);
    } finally {
      setIsLoadingEnter(false);
    }
  };

  const handleClaimTokens = async () => {
    if (!signer) {
      setErrorMessage("Please connect your wallet first!");
      return;
    }

    if (chainKey === "placeholder1" || chainKey === "placeholder2") {
      setErrorMessage("This chain is coming soon!");
      return;
    }

    setIsLoadingClaim(true);
    setErrorMessage(null);
    try {
      const chain = ponziChains[chainKey];
      await switchNetwork(chain);

      const contract = new ethers.Contract(chain.address, chain.abi, signer);
      const tx = await contract.claimTokens();
      await tx.wait();

      // Update state after claiming
      const tokens = await contract.getAccumulatedTokens(address);
      setAccumulatedTokens(ethers.utils.formatEther(tokens));
      const bal = await contract.balanceOf(address);
      setBalance(ethers.utils.formatEther(bal));
    } catch (err) {
      console.error(`Error claiming tokens on ${chainKey}:`, err);
      setErrorMessage(`Error: ${err.message || "Failed to claim tokens"}`);
    } finally {
      setIsLoadingClaim(false);
    }
  };

  const handleBurnAndDouble = async () => {
    if (!signer) {
      setErrorMessage("Please connect your wallet first!");
      return;
    }

    if (chainKey === "placeholder1" || chainKey === "placeholder2") {
      setErrorMessage("This chain is coming soon!");
      return;
    }

    setIsLoadingBurn(true);
    setErrorMessage(null);
    try {
      const chain = ponziChains[chainKey];
      await switchNetwork(chain);

      const contract = new ethers.Contract(chain.address, chain.abi, signer);
      const tx = await contract.burnAndDouble();
      await tx.wait();

      // Update state after burning
      const rate = await contract.getEmissionRate(address);
      setEmissionRate(ethers.utils.formatEther(rate));
      const bal = await contract.balanceOf(address);
      setBalance(ethers.utils.formatEther(bal));
    } catch (err) {
      console.error(`Error burning tokens on ${chainKey}:`, err);
      setErrorMessage(`Error: ${err.message || "Failed to burn and double"}`);
    } finally {
      setIsLoadingBurn(false);
    }
  };

  return (
    <div className="ponzi-item">
      <div className="chain-name">
        <h2>
          {ponziChains[chainKey].emoji} {ponziChains[chainKey].name} {ponziChains[chainKey].emoji}
        </h2>
      </div>
      <p className="progress-text">
        Accumulated: {parseFloat(accumulatedTokens).toFixed(2)} PONZI
      </p>
      <p className="progress-text">
        Rate: {parseFloat(emissionRate).toFixed(2)} PONZI/s
      </p>
      <p className="progress-text">
        Balance: {parseFloat(balance).toFixed(2)} PONZI
      </p>
      <div className="button-group">
        {!hasEntered ? (
          <button
            className="modern-button"
            onClick={handleEnterPonzi}
            disabled={isLoadingEnter || !signer}
          >
            {isLoadingEnter ? <span className="spinner"></span> : "Enter Ponzi"}
          </button>
        ) : (
          <>
            <button
              className="modern-button"
              onClick={handleClaimTokens}
              disabled={isLoadingClaim || !signer || accumulatedTokens <= 0}
            >
              {isLoadingClaim ? <span className="spinner"></span> : "Claim Tokens"}
            </button>
            {balance > 0 && (
              <button
                className="modern-button"
                onClick={handleBurnAndDouble}
                disabled={isLoadingBurn || !signer}
              >
                {isLoadingBurn ? <span className="spinner"></span> : "Burn to Double"}
              </button>
            )}
          </>
        )}
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

function PonziGame() {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check wallet connection on mount
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
          setErrorMessage(`Error: ${err.message || "Failed to auto-connect wallet"}`);
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
      setErrorMessage(`Error: ${err.message || "Failed to connect wallet"}`);
    }
  };

  const handleDisconnectWallet = () => {
    const { signer, address } = disconnectWallet();
    setSigner(signer);
    setAddress(address);
    console.log("Wallet disconnected");
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <div className="header-section">
          <h1>Ponzi Game</h1>
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
        <div className="ponzi-box">
          <div className="ponzi-row">
            <PonziGameCard chainKey="monad" signer={signer} address={address} />
            <PonziGameCard chainKey="placeholder1" signer={signer} address={address} />
            <PonziGameCard chainKey="placeholder2" signer={signer} address={address} />
          </div>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </ErrorBoundary>
  );
}

export default PonziGame;