"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../app/constants/contract";
import Image from "next/image";

const OWNER_ADDRESS = "0x8C3B3a31689a76Ae1cCf730A7B39Fe49D190FaC3";

export default function SydneyFun() {
  const { address, isConnected } = useAccount();
  const [mintAddress, setMintAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [approveAddress, setApproveAddress] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [checkBalanceAddress, setCheckBalanceAddress] = useState("");

  const isOwner =
    isConnected && address?.toLowerCase() === OWNER_ADDRESS.toLowerCase();

  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "name",
  });

  const { data: tokenSymbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "symbol",
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "totalSupply",
  });

  const { data: ownerBalance, refetch: refetchOwnerBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: contractOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "owner",
  });

  const { data: checkedBalance, refetch: refetchCheckedBalance } =
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "balanceOf",
      args: checkBalanceAddress
        ? [checkBalanceAddress as `0x${string}`]
        : undefined,
    });

  const {
    writeContract: mint,
    data: mintHash,
    error: mintError,
    isPending: mintIsPending,
  } = useWriteContract();
  const {
    writeContract: burn,
    data: burnHash,
    error: burnError,
    isPending: burnIsPending,
  } = useWriteContract();
  const {
    writeContract: transfer,
    data: transferHash,
    error: transferError,
    isPending: transferIsPending,
  } = useWriteContract();
  const {
    writeContract: approve,
    data: approveHash,
    error: approveError,
    isPending: approveIsPending,
  } = useWriteContract();

  const { isLoading: mintIsConfirming, isSuccess: mintIsConfirmed } =
    useWaitForTransactionReceipt({ hash: mintHash });
  const { isLoading: burnIsConfirming, isSuccess: burnIsConfirmed } =
    useWaitForTransactionReceipt({ hash: burnHash });
  const { isLoading: transferIsConfirming, isSuccess: transferIsConfirmed } =
    useWaitForTransactionReceipt({ hash: transferHash });
  const { isLoading: approveIsConfirming, isSuccess: approveIsConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });

  useEffect(() => {
    if (mintIsConfirmed || burnIsConfirmed || transferIsConfirmed) {
      refetchTotalSupply();
      refetchOwnerBalance();
      if (checkBalanceAddress) refetchCheckedBalance();
    }
  }, [
    mintIsConfirmed,
    burnIsConfirmed,
    transferIsConfirmed,
    refetchTotalSupply,
    refetchOwnerBalance,
    refetchCheckedBalance,
    checkBalanceAddress,
  ]);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintAddress || !mintAmount) return;

    mint({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "mint",
      args: [mintAddress as `0x${string}`, parseEther(mintAmount)],
    });
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!burnAmount) return;

    burn({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "burn",
      args: [parseEther(burnAmount)],
    });
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAddress || !transferAmount) return;

    transfer({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "transfer",
      args: [transferAddress as `0x${string}`, parseEther(transferAmount)],
    });
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approveAddress || !approveAmount) return;

    approve({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "approve",
      args: [approveAddress as `0x${string}`, parseEther(approveAmount)],
    });
  };

  const handleCheckBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkBalanceAddress) {
      refetchCheckedBalance();
    }
  };

  const formatAmount = (amount: bigint | undefined) => {
    if (!amount) return "0";
    return Number(formatEther(amount)).toLocaleString(undefined, {
      maximumFractionDigits: 4,
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {(tokenName as string) || "SydneyToken"}
            {/* <Image
              src="/syd.jpeg"
              alt="Sydney Token"
              width={400}
              height={300}
              className="rounded-lg mb-4"
            /> */}
          </h1>

          <div className="border p-4 rounded">
            <p className="mb-2">
              Total Supply:{" "}
              <span className="font-mono">
                {formatAmount(totalSupply as bigint)} SYD
              </span>
            </p>
            {isConnected && (
              <div>
                <p className="mb-1">
                  Your Balance:{" "}
                  <span className="font-mono">
                    {formatAmount(ownerBalance as bigint)} SYD
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                {isOwner && (
                  <p className="text-sm mt-1">
                    👑 You are the contract owner (mint access granted)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {!isConnected ? (
          <div className="py-8">
            <p className="text-gray-600">
              Please connect your wallet to interact with the contract
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {isOwner && (
              <div className="border p-4 rounded">
                <h2 className="text-xl font-bold mb-4">👑 Owner Mint</h2>
                <form onSubmit={handleMint} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm">Recipient Address</label>
                    <input
                      type="text"
                      value={mintAddress}
                      onChange={(e) => setMintAddress(e.target.value)}
                      placeholder="0x..."
                      className="border p-2 rounded font-mono text-sm"
                      disabled={mintIsPending || mintIsConfirming}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm">Amount (SYD)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={mintAmount}
                      onChange={(e) => setMintAmount(e.target.value)}
                      placeholder="100"
                      className="border p-2 rounded"
                      disabled={mintIsPending || mintIsConfirming}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      mintIsPending ||
                      mintIsConfirming ||
                      !mintAddress ||
                      !mintAmount
                    }
                    className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50 self-start"
                  >
                    {mintIsPending
                      ? "Check Wallet..."
                      : mintIsConfirming
                        ? "Confirming..."
                        : "Mint Tokens"}
                  </button>
                  {mintHash && (
                    <p className="text-xs">
                      Tx: {mintHash.slice(0, 10)}...{mintHash.slice(-8)}
                    </p>
                  )}
                  {mintIsConfirmed && (
                    <p className="text-green-600 text-sm">
                      ✅ Mint successful!
                    </p>
                  )}
                  {mintError && (
                    <p className="text-red-600 text-sm">
                      ❌ {mintError.message}
                    </p>
                  )}
                </form>
              </div>
            )}

            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-4">Check Balance</h2>
              <form
                onSubmit={handleCheckBalance}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    value={checkBalanceAddress}
                    onChange={(e) => setCheckBalanceAddress(e.target.value)}
                    placeholder="Enter address to check balance"
                    className="border p-2 rounded font-mono text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gray-200 px-4 py-2 rounded self-start"
                >
                  Check Balance
                </button>
              </form>
              {checkedBalance !== undefined && checkBalanceAddress && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-600">Balance for:</p>
                  <p className="font-mono text-sm">
                    {checkBalanceAddress.slice(0, 6)}...
                    {checkBalanceAddress.slice(-4)}
                  </p>
                  <p className="text-xl font-bold mt-2">
                    {formatAmount(checkedBalance as bigint)} SYD
                  </p>
                </div>
              )}
            </div>

            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-4">Burn Tokens</h2>
              <form onSubmit={handleBurn} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Amount to Burn (SYD)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={burnAmount}
                    onChange={(e) => setBurnAmount(e.target.value)}
                    placeholder="50"
                    className="border p-2 rounded"
                    disabled={burnIsPending || burnIsConfirming}
                  />
                </div>
                <button
                  type="submit"
                  disabled={burnIsPending || burnIsConfirming || !burnAmount}
                  className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50 self-start"
                >
                  {burnIsPending
                    ? "Check Wallet..."
                    : burnIsConfirming
                      ? "Confirming..."
                      : "Burn Tokens"}
                </button>
                {burnHash && (
                  <p className="text-xs">Tx: {burnHash.slice(0, 10)}...</p>
                )}
                {burnIsConfirmed && (
                  <p className="text-green-600 text-sm">✅ Burn successful!</p>
                )}
                {burnError && (
                  <p className="text-red-600 text-sm">❌ {burnError.message}</p>
                )}
              </form>
            </div>

            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-4">Transfer</h2>
              <form onSubmit={handleTransfer} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Recipient Address</label>
                  <input
                    type="text"
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                    placeholder="0x..."
                    className="border p-2 rounded font-mono text-sm"
                    disabled={transferIsPending || transferIsConfirming}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Amount (SYD)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="25"
                    className="border p-2 rounded"
                    disabled={transferIsPending || transferIsConfirming}
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    transferIsPending ||
                    transferIsConfirming ||
                    !transferAddress ||
                    !transferAmount
                  }
                  className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50 self-start"
                >
                  {transferIsPending
                    ? "Check Wallet..."
                    : transferIsConfirming
                      ? "Confirming..."
                      : "Transfer"}
                </button>
                {transferHash && (
                  <p className="text-xs">Tx: {transferHash.slice(0, 10)}...</p>
                )}
                {transferIsConfirmed && (
                  <p className="text-green-600 text-sm">
                    ✅ Transfer successful!
                  </p>
                )}
                {transferError && (
                  <p className="text-red-600 text-sm">
                    ❌ {transferError.message}
                  </p>
                )}
              </form>
            </div>

            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-4">Approve</h2>
              <form onSubmit={handleApprove} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Spender Address</label>
                  <input
                    type="text"
                    value={approveAddress}
                    onChange={(e) => setApproveAddress(e.target.value)}
                    placeholder="0x..."
                    className="border p-2 rounded font-mono text-sm"
                    disabled={approveIsPending || approveIsConfirming}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Amount (SYD)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={approveAmount}
                    onChange={(e) => setApproveAmount(e.target.value)}
                    placeholder="100"
                    className="border p-2 rounded"
                    disabled={approveIsPending || approveIsConfirming}
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    approveIsPending ||
                    approveIsConfirming ||
                    !approveAddress ||
                    !approveAmount
                  }
                  className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50 self-start"
                >
                  {approveIsPending
                    ? "Check Wallet..."
                    : approveIsConfirming
                      ? "Confirming..."
                      : "Approve"}
                </button>
                {approveHash && (
                  <p className="text-xs">Tx: {approveHash.slice(0, 10)}...</p>
                )}
                {approveIsConfirmed && (
                  <p className="text-green-600 text-sm">
                    ✅ Approval successful!
                  </p>
                )}
                {approveError && (
                  <p className="text-red-600 text-sm">
                    ❌ {approveError.message}
                  </p>
                )}
              </form>
            </div>

            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-4">Contract Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Contract Address:</p>
                  <p className="font-mono break-all">{CONTRACT_ADDRESS}</p>
                </div>
                <div>
                  <p className="text-gray-600">Contract Owner:</p>
                  <p className="font-mono break-all">
                    {(contractOwner as string) || "Loading..."}
                    {contractOwner === OWNER_ADDRESS && " 👑"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Token Name:</p>
                  <p>{(tokenName as string) || "SydneyToken"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Token Symbol:</p>
                  <p>{(tokenSymbol as string) || "SYD"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Decimals:</p>
                  <p>18</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Supply:</p>
                  <p>{formatAmount(totalSupply as bigint)} SYD</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
