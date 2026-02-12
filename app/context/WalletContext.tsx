"use client";

import { createContext, useContext } from "react";
import { useAccount } from "wagmi";

interface WalletContextType {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  chainId: number | undefined;
}

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  isConnected: false,
  chainId: undefined,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, chainId } = useAccount();

  return (
    <WalletContext.Provider value={{ address, isConnected, chainId }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
