import React, { useState } from 'react';

function ChainInteraction({ chainKey, chainEmoji, signer, onSuccess }) {
  const [isLoadingHi, setIsLoadingHi] = useState(false);
  const [isLoadingGM, setIsLoadingGM] = useState(false);
  const [isLoadingGN, setIsLoadingGN] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleTransaction = async (functionName, setIsLoading) => {
    if (!signer) {
      setErrorMessage("Please connect your wallet first!");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await onSuccess(chainKey, functionName);
      if (result?.error) {
        setErrorMessage(result.error);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chain-item">
      <div className="chain-name">
        <h2 className={chainKey}>{chainEmoji} {
          chainKey === "ink" ? "INK" :
          chainKey === "base" ? "Base" :
          chainKey === "arbitrum" ? "Arbitrum" :
          chainKey === "berachain" ? "Berachain" :
          chainKey === "energi" ? "Energi" :
          chainKey === "bnb" ? "BNB" :
          chainKey === "op" ? "Optimism" :
          chainKey === "soneium" ? "Soneium" :
          chainKey === "unichain" ? "Unichain" :
          chainKey === "mantle" ? "Mantle" :
          chainKey === "bob" ? "BOB" :
          chainKey === "sei" ? "SEI" :
          chainKey === "telos" ? "Telos" :
          chainKey === "polygon" ? "Polygon" :
          chainKey === "avax" ? "Avalanche" :
          chainKey === "superposition" ? "Superposition" :
          chainKey === "story" ? "Story" :
          chainKey === "polygonzkevm" ? "Polygon zkEVM" :
          chainKey === "cronos" ? "Cronos" :
          chainKey === "zora" ? "Zora" :
          chainKey === "ethereum" ? "Ethereum" :
          chainKey === "sonic" ? "Sonic" :
          chainKey === "celo" ? "Celo" :
          chainKey === "etherlink" ? "Etherlink" :
          chainKey === "zircuit" ? "Zircuit" :
          chainKey === "expanse" ? "Expanse" :
          chainKey === "canto" ? "Canto" :
          chainKey === "degen" ? "Degen" :
          chainKey === "hyperevm" ? "HyperEVM" :
          chainKey === "fraxtal" ? "Fraxtal" :
          chainKey === "superseed" ? "SuperSeed" :
          chainKey === "swanchain" ? "SwanChain" :
          chainKey.charAt(0).toUpperCase() + chainKey.slice(1)} {chainEmoji}</h2>
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

export default ChainInteraction; 