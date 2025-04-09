import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import { connectWallet, checkWalletConnected, disconnectWallet } from "./utils/wallet";

// Ponzi contract ABI (unchanged)
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

// Ponzi contract details (updated with provided info)
const ponziChains = {
  monad: {
    chainId: 10143,
    address: "0xC4caeD6426a8B741b9157213ef92F6ffE82508AE",
    abi: ponziABI,
    name: "Monad Testnet",
    emoji: "🧪",
    explorer: "https://testnet.monadexplorer.com/"
  },
  somnia: {
    chainId: 50312,
    address: "0x2fa3090ACb91f2674e1B5df2fe779468c2328295",
    abi: ponziABI,
    name: "Somnia Testnet",
    emoji: "🌌",
    explorer: "https://shannon-explorer.somnia.network/tx/"
  },
  megaeth: {
    chainId: 6342,
    address: "0x2EaBf16382d97140e3DC5ee5e02b22eaaf4018c2",
    abi: ponziABI,
    name: "MegaEth",
    emoji: "⚡",
    explorer: "https://www.megaexplorer.xyz/"
  }
};

// Chain parameters for wallet_addEthereumChain (updated with provided info)
const chainParams = {
  monad: {
    chainId: "0x27b7", // 10143 in hex
    chainName: "Monad Testnet",
    rpcUrls: ["https://testnet-rpc.monad.xyz"],
    nativeCurrency: { name: "Monad", symbol: "MONAD", decimals: 18 },
    blockExplorerUrls: ["https://testnet.monadexplorer.com/"]
  },
  somnia: {
    chainId: "0xc488", // 50312 in hex
    chainName: "Somnia Testnet",
    rpcUrls: ["https://rpc.testnet.somnia.network"],
    nativeCurrency: { name: "Somnia", symbol: "SOM", decimals: 18 },
    blockExplorerUrls: ["https://shannon-explorer.somnia.network/"]
  },
  megaeth: {
    chainId: "0x18ca", // 6342 in hex
    chainName: "MegaEth",
    rpcUrls: ["https://testnet.megaeth.systems"],
    nativeCurrency: { name: "MegaEth", symbol: "METH", decimals: 18 },
    blockExplorerUrls: ["https://www.megaexplorer.xyz/"]
  }
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

function PonziGameCard({ chainKey, signer, address }) {
  const [hasEntered, setHasEntered] = useState(false);
  const [accumulatedTokens, setAccumulatedTokens] = useState(0);
  const [emissionRate, setEmissionRate] = useState(0);
  const [balance, setBalance] = useState(0);
  const [isLoadingEnter, setIsLoadingEnter] = useState(false);
  const [isLoadingClaim, setIsLoadingClaim] = useState(false);
  const [isLoadingBurn, setIsLoadingBurn] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");

  useEffect(() => {
    if (!signer || !address) return;

    const updateUserState = async () => {
      try {
        const chain = ponziChains[chainKey];
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(chain.address, chain.abi, provider);

        const entered = await contract.hasUserEntered(address);
        setHasEntered(entered);

        if (entered) {
          const tokens = await contract.getAccumulatedTokens(address);
          setAccumulatedTokens(ethers.utils.formatEther(tokens));
          const rate = await contract.getEmissionRate(address);
          setEmissionRate(ethers.utils.formatEther(rate));
          const bal = await contract.balanceOf(address);
          setBalance(ethers.utils.formatEther(bal));
        }
      } catch (err) {
        console.error(`Error updating user state for ${chainKey}:`, err);
      }
    };

    updateUserState();
    const interval = setInterval(updateUserState, 1000);
    return () => clearInterval(interval);
  }, [signer, address, chainKey]);

  const switchNetwork = async (chain) => {
    try {
      const chainIdHex = chainParams[chainKey].chainId;
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
      if (switchError.code === 4902 || switchError.message.includes("Unrecognized chain ID")) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [chainParams[chainKey]]
          });
        } catch (addError) {
          throw new Error(`Failed to add ${chain.name} to wallet: ${addError.message}`);
        }
      } else {
        throw switchError;
      }
    }
  };

  const handleSuccess = (txHash) => {
    setTransactionHash(txHash);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setTransactionHash("");
  };

  const handleEnterPonzi = async () => {
    if (!signer) {
      setErrorMessage("Please connect your wallet first!");
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
      handleSuccess(tx.hash);
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

    setIsLoadingClaim(true);
    setErrorMessage(null);
    try {
      const chain = ponziChains[chainKey];
      await switchNetwork(chain);

      const contract = new ethers.Contract(chain.address, chain.abi, signer);
      const tx = await contract.claimTokens();
      await tx.wait();

      const tokens = await contract.getAccumulatedTokens(address);
      setAccumulatedTokens(ethers.utils.formatEther(tokens));
      const bal = await contract.balanceOf(address);
      setBalance(ethers.utils.formatEther(bal));
      handleSuccess(tx.hash);
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

    setIsLoadingBurn(true);
    setErrorMessage(null);
    try {
      const chain = ponziChains[chainKey];
      await switchNetwork(chain);

      const contract = new ethers.Contract(chain.address, chain.abi, signer);
      const tx = await contract.burnAndDouble();
      await tx.wait();

      const rate = await contract.getEmissionRate(address);
      setEmissionRate(ethers.utils.formatEther(rate));
      const bal = await contract.balanceOf(address);
      setBalance(ethers.utils.formatEther(bal));
      handleSuccess(tx.hash);
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
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Success!</h2>
            <p>
              Transaction Link:{" "}
              <a
                href={`${ponziChains[chainKey].explorer}${transactionHash}`}
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
  );
}

function PonziGame() {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

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
            <PonziGameCard chainKey="somnia" signer={signer} address={address} />
            <PonziGameCard chainKey="megaeth" signer={signer} address={address} />
          </div>
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </ErrorBoundary>
  );
}

export default PonziGame;