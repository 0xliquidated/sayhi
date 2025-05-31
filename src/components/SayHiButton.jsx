import React, { useMemo } from 'react';
import { useWallet } from '../utils/WalletContext';
import { useChainInteraction } from '../hooks/useChainInteraction';
import * as mainnetData from '../utils/chainData';
import * as testnetData from '../Testnets';

function SayHiButton({ chainKey, onSuccess, isTestnet = false }) {
  const { signer } = useWallet();
  
  const chainData = useMemo(() => {
    const { chains, chainEmojis, displayNames } = isTestnet ? testnetData : mainnetData;
    const chain = chains[chainKey];
    if (!chain) {
      console.error(`Chain data not found for ${chainKey}`);
      return null;
    }
    return {
      emoji: chainEmojis[chainKey] || "🔗",
      displayName: displayNames[chainKey] || chainKey,
      chain
    };
  }, [chainKey, isTestnet]);

  if (!chainData) {
    return null;
  }

  const {
    isLoadingHi,
    isLoadingGM,
    isLoadingGN,
    errorMessage,
    handleTransaction
  } = useChainInteraction(chainKey, chainData, onSuccess);

  return (
    <div className="chain-item">
      <div className="chain-name">
        <h2>
          {chainData.emoji} {chainData.displayName} {chainData.emoji}
        </h2>
      </div>
      <div className="button-group">
        <button
          className="modern-button"
          onClick={() => handleTransaction("sayHi")}
          disabled={isLoadingHi || isLoadingGM || isLoadingGN || !signer}
        >
          {isLoadingHi ? <span className="spinner"></span> : "Say Hi"}
        </button>
        <button
          className="modern-button"
          onClick={() => handleTransaction("sayGM")}
          disabled={isLoadingHi || isLoadingGM || isLoadingGN || !signer}
        >
          {isLoadingGM ? <span className="spinner"></span> : "Say GM"}
        </button>
        <button
          className="modern-button"
          onClick={() => handleTransaction("sayGN")}
          disabled={isLoadingHi || isLoadingGM || isLoadingGN || !signer}
        >
          {isLoadingGN ? <span className="spinner"></span> : "Say GN"}
        </button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default SayHiButton; 