import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../utils/WalletContext';
import { saveUserInteraction } from '../utils/gamification';

export function useChainInteraction(chainKey, chainData, onSuccess) {
  const [isLoadingHi, setIsLoadingHi] = useState(false);
  const [isLoadingGM, setIsLoadingGM] = useState(false);
  const [isLoadingGN, setIsLoadingGN] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const { signer, switchChain } = useWallet();

  const handleTransaction = useCallback(async (functionName) => {
    if (!signer) {
      setErrorMessage("Please connect your wallet first!");
      return;
    }

    const loadingState = {
      sayHi: setIsLoadingHi,
      sayGM: setIsLoadingGM,
      sayGN: setIsLoadingGN
    }[functionName];

    loadingState(true);
    setErrorMessage(null);
    
    try {
      const provider = await switchChain(chainData.chain.chainId);
      const contract = new ethers.Contract(
        chainData.chain.address,
        chainData.chain.abi,
        provider.getSigner()
      );
      
      const tx = await contract[functionName]();
      console.log(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`Transaction confirmed: ${tx.hash}`);

      saveUserInteraction(chainKey, functionName);
      if (onSuccess) {
        onSuccess(tx.hash, chainKey);
      }
    } catch (err) {
      console.error(`Error on ${chainKey}:`, err);
      if (err.code === 4902 || err.message.includes("Unrecognized chain ID")) {
        setErrorMessage(
          `${chainData.displayName} (Chain ID: ${chainData.chain.chainId}) is not recognized by your wallet. Please ensure your wallet is up to date and supports this chain.`
        );
      } else if (err.message.includes("insufficient funds")) {
        setErrorMessage(
          `Insufficient funds for gas on ${chainData.displayName}. Please add ETH to your wallet.`
        );
      } else if (err.message.includes("call revert exception")) {
        setErrorMessage(
          `Contract call failed. The contract address or ABI might be incorrect for ${chainData.displayName}.`
        );
      } else {
        setErrorMessage(`Error: ${err.message || `Failed to ${functionName}`}`);
      }
    } finally {
      loadingState(false);
    }
  }, [chainKey, chainData, signer, switchChain, onSuccess]);

  return {
    isLoadingHi,
    isLoadingGM,
    isLoadingGN,
    errorMessage,
    handleTransaction
  };
} 