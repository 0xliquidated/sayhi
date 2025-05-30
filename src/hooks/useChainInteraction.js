import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../utils/WalletContext';
import { saveUserInteraction } from '../utils/gamification';

export function useChainInteraction(chainKey, chainData, onSuccess) {
  const [isLoadingHi, setIsLoadingHi] = useState(false);
  const [isLoadingGM, setIsLoadingGM] = useState(false);
  const [isLoadingGN, setIsLoadingGN] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const { signer, switchChain } = useWallet();

  const handleTransaction = async (functionName, setIsLoading) => {
    if (!signer) {
      setErrorMessage("Please connect your wallet first!");
      return;
    }

    setIsLoading(true);
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

      saveUserInteraction(chainKey, functionName, false);
      onSuccess(tx.hash, chainKey);
    } catch (err) {
      console.error(`Error on ${chainKey}:`, err);
      if (err.code === 4902 || err.message.includes("Unrecognized chain ID")) {
        setErrorMessage(
          `${chainData.displayName} (Chain ID: ${chainData.chain.chainId}) is not recognized by Rabby Wallet. Please ensure Rabby Wallet is up to date and supports this chain.`
        );
      } else if (err.message.includes("insufficient funds")) {
        setErrorMessage(
          `Insufficient funds for gas on ${chainData.displayName}. Please add ${chainKey === "berachain" ? "BERA" : "ETH"} to your wallet.`
        );
      } else if (err.message.includes("call revert exception")) {
        setErrorMessage(
          `Contract call failed. The contract address or ABI might be incorrect for ${chainData.displayName}.`
        );
      } else {
        setErrorMessage(`Error: ${err.message || `Failed to ${functionName}`}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoadingHi,
    isLoadingGM,
    isLoadingGN,
    errorMessage,
    handleTransaction: (functionName) => {
      const loadingState = {
        sayHi: setIsLoadingHi,
        sayGM: setIsLoadingGM,
        sayGN: setIsLoadingGN
      }[functionName];
      
      return handleTransaction(functionName, loadingState);
    }
  };
} 