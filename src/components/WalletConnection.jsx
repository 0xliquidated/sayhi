import React from 'react';

function WalletConnection({ address, onConnect, onDisconnect }) {
  return (
    <div className="wallet-section">
      {address ? (
        <>
          <p className="wallet-address">Connected: {address.slice(0, 6)}...{address.slice(-4)}</p>
          <button className="modern-button disconnect-button" onClick={onDisconnect}>
            Disconnect Wallet
          </button>
        </>
      ) : (
        <button className="modern-button connect-button" onClick={onConnect}>
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default WalletConnection; 