"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState } from "react";

export const OWNER_ADDRESS = "0x0f0fB75E27F3E6f497810937b5610691B907297c";

function DisconnectButton() {
  const { disconnect } = useDisconnect();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = () => {
    setIsDisconnecting(true);
    try {
      disconnect();
    } catch (error) {
      console.error("Disconnect error:", error);
    }
    setTimeout(() => setIsDisconnecting(false), 1000);
  };

  return (
    <button
      onClick={handleDisconnect}
      disabled={isDisconnecting}
      className="px-4 py-2 text-sm border rounded hover:cursor-pointer hover:bg-gray-100 disabled:opacity-50"
    >
      {isDisconnecting ? "Disconnecting..." : "Disconnect"}
    </button>
  );
}

export function CustomConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const [showWallets, setShowWallets] = useState(false);

  const isOwner = address?.toLowerCase() === OWNER_ADDRESS.toLowerCase();

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 border rounded">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <div>
            {isOwner && <span className="text-xs font-bold">👑 OWNER</span>}
            <span className="text-sm block">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </div>
        <DisconnectButton />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowWallets(!showWallets)}
        className="px-5 py-2.5 text-sm border rounded hover:cursor-pointer hover:bg-gray-100"
      >
        Connect Wallet
      </button>

      {showWallets && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowWallets(false)}
          />
          <div className="absolute right-0 z-50 w-64 mt-2 border bg-black rounded shadow-lg">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                Select Wallet
              </div>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    connect({ connector });
                    setShowWallets(false);
                  }}
                  className="w-full px-3 py-2.5 text-sm text-left hover:bg-gray-100 rounded flex items-center gap-3"
                >
                  {connector.name === "MetaMask" && (
                    <span className="text-xl">🦊</span>
                  )}
                  {connector.name === "WalletConnect" && (
                    <span className="text-xl">🔗</span>
                  )}
                  {connector.name === "Coinbase Wallet" && (
                    <span className="text-xl">🪙</span>
                  )}
                  {connector.name === "Injected" && (
                    <span className="text-xl">🔌</span>
                  )}
                  <span className="flex-1">{connector.name}</span>
                  <span className="text-gray-400">→</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="absolute left-0 right-0 mt-2 p-3 text-xs text-red-600 border border-red-200 bg-red-50 rounded">
          {error.message}
        </div>
      )}
    </div>
  );
}
