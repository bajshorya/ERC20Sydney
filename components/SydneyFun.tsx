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
import { FAUCET_ADDRESS, FAUCET_ABI } from "../app/constants/faucetContract";
import Image from "next/image";

const OWNER_ADDRESS = "0x0f0fB75E27F3E6f497810937b5610691B907297c";

export default function SydneyFun() {
  const { address, isConnected } = useAccount();
  const [mintAddress, setMintAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const [transferAddress, setTransferAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [approveAddress, setApproveAddress] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [transferFromSender, setTransferFromSender] = useState("");
  const [transferFromRecipient, setTransferFromRecipient] = useState("");
  const [transferFromAmount, setTransferFromAmount] = useState("");
  const [checkBalanceAddress, setCheckBalanceAddress] = useState("");
  const [fundFaucetAmount, setFundFaucetAmount] = useState("");

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

  const { data: currentAllowance, refetch: refetchAllowance } = useReadContract(
    {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "allowance",
      args:
        transferFromSender && address
          ? [transferFromSender as `0x${string}`, address as `0x${string}`]
          : undefined,
    },
  );

  const { data: faucetBalance, refetch: refetchFaucetBalance } =
    useReadContract({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "faucetBalance",
    });

  const { data: claimAmount } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "claimAmount",
  });

  const { data: cooldown } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "cooldown",
  });

  const { data: canUserClaim, refetch: refetchCanClaim } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "canClaim",
    args: address ? [address] : undefined,
  });

  const { data: timeUntilNextClaim, refetch: refetchTimeUntilNextClaim } =
    useReadContract({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "timeUntilNextClaim",
      args: address ? [address] : undefined,
    });

  const { data: faucetOwner } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "owner",
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
    writeContract: transferFrom,
    data: transferFromHash,
    error: transferFromError,
    isPending: transferFromIsPending,
  } = useWriteContract();

  const {
    writeContract: approve,
    data: approveHash,
    error: approveError,
    isPending: approveIsPending,
  } = useWriteContract();

  const {
    writeContract: renounceOwnership,
    data: renounceHash,
    error: renounceError,
    isPending: renounceIsPending,
  } = useWriteContract();

  const {
    writeContract: claimFromFaucet,
    data: claimHash,
    error: claimError,
    isPending: claimIsPending,
  } = useWriteContract();

  const {
    writeContract: fundFaucet,
    data: fundHash,
    error: fundError,
    isPending: fundIsPending,
  } = useWriteContract();

  const { isLoading: mintIsConfirming, isSuccess: mintIsConfirmed } =
    useWaitForTransactionReceipt({ hash: mintHash });

  const { isLoading: burnIsConfirming, isSuccess: burnIsConfirmed } =
    useWaitForTransactionReceipt({ hash: burnHash });

  const { isLoading: transferIsConfirming, isSuccess: transferIsConfirmed } =
    useWaitForTransactionReceipt({ hash: transferHash });

  const {
    isLoading: transferFromIsConfirming,
    isSuccess: transferFromIsConfirmed,
  } = useWaitForTransactionReceipt({ hash: transferFromHash });

  const { isLoading: approveIsConfirming, isSuccess: approveIsConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });

  const { isLoading: renounceIsConfirming, isSuccess: renounceIsConfirmed } =
    useWaitForTransactionReceipt({ hash: renounceHash });

  const { isLoading: claimIsConfirming, isSuccess: claimIsConfirmed } =
    useWaitForTransactionReceipt({ hash: claimHash });

  const { isLoading: fundIsConfirming, isSuccess: fundIsConfirmed } =
    useWaitForTransactionReceipt({ hash: fundHash });

  useEffect(() => {
    if (
      mintIsConfirmed ||
      burnIsConfirmed ||
      transferIsConfirmed ||
      transferFromIsConfirmed ||
      claimIsConfirmed ||
      fundIsConfirmed
    ) {
      refetchTotalSupply();
      refetchOwnerBalance();
      refetchFaucetBalance();
      refetchCanClaim();
      refetchTimeUntilNextClaim();
      refetchAllowance();
      if (checkBalanceAddress) refetchCheckedBalance();
    }
  }, [
    mintIsConfirmed,
    burnIsConfirmed,
    transferIsConfirmed,
    transferFromIsConfirmed,
    claimIsConfirmed,
    fundIsConfirmed,
    refetchTotalSupply,
    refetchOwnerBalance,
    refetchFaucetBalance,
    refetchCanClaim,
    refetchTimeUntilNextClaim,
    refetchAllowance,
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

  const handleTransferFrom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFromSender || !transferFromRecipient || !transferFromAmount)
      return;

    transferFrom({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "transferFrom",
      args: [
        transferFromSender as `0x${string}`,
        transferFromRecipient as `0x${string}`,
        parseEther(transferFromAmount),
      ],
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

  const handleRenounceOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !window.confirm(
        "Are you sure you want to renounce ownership? This action is irreversible.",
      )
    ) {
      return;
    }

    renounceOwnership({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "renounceOwnership",
    });
  };

  const handleCheckBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkBalanceAddress) {
      refetchCheckedBalance();
    }
  };

  const handleClaimFromFaucet = async (e: React.FormEvent) => {
    e.preventDefault();

    claimFromFaucet({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "claim",
    });
  };

  const handleFundFaucet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundFaucetAmount) return;

    approve({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "approve",
      args: [FAUCET_ADDRESS, parseEther(fundFaucetAmount)],
    });

    fundFaucet({
      address: FAUCET_ADDRESS,
      abi: FAUCET_ABI,
      functionName: "fundFaucet",
      args: [parseEther(fundFaucetAmount)],
    });
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
          <div className="text-3xl font-bold mb-4 flex gap-5">
            <div>
              <div>{(tokenName as string) || "SydneyToken"}</div>

              <div className="w-40 h-40 rounded-full overflow-hidden mt-10 border-4 border-gray-300">
                <Image
                  src="/syd.jpeg"
                  alt="Sydney Token"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover scale-120 shadow-lg transition-transform duration-300 hover:scale-125"
                />
              </div>
            </div>
            <div className="w-full ">
              <Image
                src="/want.jpeg"
                alt="Sydney Token"
                width={400}
                height={300}
                className="rounded-lg w-full h-[36vh] object-cover object-center shadow-md shadow-gray-400"
              />
            </div>
          </div>

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
                    className="bg-gray-200 px-4 py-2 text-black hover:cursor-pointer rounded disabled:opacity-50 self-start"
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
                  className="bg-gray-200 text-black hover:cursor-pointer px-4 py-2 rounded self-start"
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
                  className="bg-gray-200 text-black hover:cursor-pointer px-4 py-2 rounded disabled:opacity-50 self-start"
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
                  className="bg-gray-200 text-black hover:cursor-pointer px-4 py-2 rounded disabled:opacity-50 self-start"
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
                  className="bg-gray-200 px-4 py-2 text-black hover:cursor-pointer rounded disabled:opacity-50 self-start"
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

            <div className="border p-4 rounded border-gray-300">
              <h2 className="text-xl font-bold mb-4 text-blue-700">
                🔄 Transfer From (Use Allowance)
              </h2>
              <form
                onSubmit={handleTransferFrom}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-sm">From Address (Sender)</label>
                  <input
                    type="text"
                    value={transferFromSender}
                    onChange={(e) => setTransferFromSender(e.target.value)}
                    placeholder="0x..."
                    className="border p-2 rounded font-mono text-sm"
                    disabled={transferFromIsPending || transferFromIsConfirming}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">To Address (Recipient)</label>
                  <input
                    type="text"
                    value={transferFromRecipient}
                    onChange={(e) => setTransferFromRecipient(e.target.value)}
                    placeholder="0x..."
                    className="border p-2 rounded font-mono text-sm"
                    disabled={transferFromIsPending || transferFromIsConfirming}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm">Amount (SYD)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={transferFromAmount}
                    onChange={(e) => setTransferFromAmount(e.target.value)}
                    placeholder="25"
                    className="border p-2 rounded"
                    disabled={transferFromIsPending || transferFromIsConfirming}
                  />
                </div>

                {transferFromSender && address && (
                  <div className="text-sm p-2 bg-gray-600 rounded">
                    <p>
                      Current Allowance:{" "}
                      <span className="font-bold">
                        {formatAmount(currentAllowance as bigint)} SYD
                      </span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    transferFromIsPending ||
                    transferFromIsConfirming ||
                    !transferFromSender ||
                    !transferFromRecipient ||
                    !transferFromAmount
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 self-start"
                >
                  {transferFromIsPending
                    ? "Check Wallet..."
                    : transferFromIsConfirming
                      ? "Confirming..."
                      : "Transfer From"}
                </button>
                {transferFromHash && (
                  <p className="text-xs">
                    Tx: {transferFromHash.slice(0, 10)}...
                  </p>
                )}
                {transferFromIsConfirmed && (
                  <p className="text-green-600 text-sm">
                    ✅ TransferFrom successful!
                  </p>
                )}
                {transferFromError && (
                  <p className="text-red-600 text-sm">
                    ❌ {transferFromError.message}
                  </p>
                )}
              </form>
              <p className="text-xs text-gray-500 mt-2">
                ⓘ Use this after approving tokens. You must have allowance from
                the sender.
              </p>
            </div>

            <div className="border p-4 rounded border-y-gray-100 bg-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-blue-700">
                🚰 Sydney Faucet
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Faucet Balance</p>
                  <p className="text-xl font-bold text-blue-600">
                    {faucetBalance
                      ? formatAmount(faucetBalance as bigint)
                      : "0"}{" "}
                    SYD
                  </p>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Claim Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    {claimAmount ? formatAmount(claimAmount as bigint) : "10"}{" "}
                    SYD
                  </p>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <p className="text-sm text-gray-600">Cooldown</p>
                  <p className="text-xl font-bold text-purple-600">
                    {cooldown ? `${Number(cooldown) / 3600} hours` : "24 hours"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Claim Free Tokens</h3>
                {canUserClaim ? (
                  <div>
                    <button
                      onClick={handleClaimFromFaucet}
                      disabled={claimIsPending || claimIsConfirming}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      {claimIsPending
                        ? "Check Wallet..."
                        : claimIsConfirming
                          ? "Confirming..."
                          : "💧 Claim 10 SYD"}
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      You can claim once every 24 hours
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-yellow-700">
                      ⏳{" "}
                      {timeUntilNextClaim
                        ? `Time until next claim: ${Math.floor(Number(timeUntilNextClaim) / 3600)}h ${Math.floor((Number(timeUntilNextClaim) % 3600) / 60)}m`
                        : "Check back later"}
                    </p>
                  </div>
                )}
                {claimHash && (
                  <p className="text-xs mt-2">
                    Tx: {claimHash.slice(0, 10)}...
                  </p>
                )}
                {claimIsConfirmed && (
                  <p className="text-green-600 text-sm mt-2">
                    ✅ Claim successful! 10 SYD added to your wallet.
                  </p>
                )}
                {claimError && (
                  <p className="text-red-600 text-sm mt-2">
                    ❌ {claimError.message}
                  </p>
                )}
              </div>

              {isOwner && (
                <div className="mt-4 p-4 border-t border-blue-200">
                  <h3 className="font-bold mb-3 text-blue-800">
                    💰 Fund Faucet (Owner only)
                  </h3>
                  <form
                    onSubmit={handleFundFaucet}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-sm">Amount to Fund (SYD)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={fundFaucetAmount}
                        onChange={(e) => setFundFaucetAmount(e.target.value)}
                        placeholder="1000"
                        className="border p-2 rounded"
                        disabled={
                          fundIsPending || fundIsConfirming || approveIsPending
                        }
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        fundIsPending || fundIsConfirming || !fundFaucetAmount
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 self-start"
                    >
                      {approveIsPending
                        ? "Approving..."
                        : fundIsPending
                          ? "Funding..."
                          : fundIsConfirming
                            ? "Confirming..."
                            : "Fund Faucet"}
                    </button>
                    {fundHash && (
                      <p className="text-xs">Tx: {fundHash.slice(0, 10)}...</p>
                    )}
                    {fundIsConfirmed && (
                      <p className="text-green-600 text-sm">
                        ✅ Faucet funded successfully!
                      </p>
                    )}
                    {fundError && (
                      <p className="text-red-600 text-sm">
                        ❌ {fundError.message}
                      </p>
                    )}
                  </form>
                </div>
              )}
            </div>

            {isOwner && (
              <div className="border p-4 rounded border-red-500 bg-red-50">
                <h2 className="text-xl font-bold mb-4 text-red-700">
                  ⚠️ Renounce Ownership
                </h2>
                <p className="text-sm text-red-600 mb-4">
                  This action is irreversible. Once ownership is renounced, no
                  one will be able to mint new tokens.
                </p>
                <form
                  onSubmit={handleRenounceOwnership}
                  className="flex flex-col gap-4"
                >
                  <button
                    type="submit"
                    disabled={renounceIsPending || renounceIsConfirming}
                    className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 self-start hover:bg-red-700"
                  >
                    {renounceIsPending
                      ? "Check Wallet..."
                      : renounceIsConfirming
                        ? "Confirming..."
                        : "Renounce Ownership"}
                  </button>
                  {renounceHash && (
                    <p className="text-xs">
                      Tx: {renounceHash.slice(0, 10)}...
                    </p>
                  )}
                  {renounceIsConfirmed && (
                    <p className="text-green-600 text-sm">
                      ✅ Ownership renounced successfully!
                    </p>
                  )}
                  {renounceError && (
                    <p className="text-red-600 text-sm">
                      ❌ {renounceError.message}
                    </p>
                  )}
                </form>
              </div>
            )}

            <div className="border p-4 rounded">
              <h2 className="text-xl font-bold mb-4">Contract Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Token Address:</p>
                  <p className="font-mono break-all">{CONTRACT_ADDRESS}</p>
                </div>
                <div>
                  <p className="text-gray-600">Faucet Address:</p>
                  <p className="font-mono break-all">{FAUCET_ADDRESS}</p>
                </div>
                <div>
                  <p className="text-gray-600">Contract Owner:</p>
                  <p className="font-mono break-all">
                    {(contractOwner as string) || "Loading..."}
                    {contractOwner === OWNER_ADDRESS && " 👑"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Faucet Owner:</p>
                  <p className="font-mono break-all">
                    {(faucetOwner as string) || "Loading..."}
                    {faucetOwner === OWNER_ADDRESS && " 👑"}
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
                <div>
                  <p className="text-gray-600">Faucet Balance:</p>
                  <p>{formatAmount(faucetBalance as bigint)} SYD</p>
                </div>
                <div>
                  <p className="text-gray-600">Claim Amount:</p>
                  <p>{formatAmount(claimAmount as bigint)} SYD</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
