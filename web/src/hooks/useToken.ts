'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import TokenABI from '@/abis/Token.json'

// Get contract address from environment or config
const getTokenAddress = (customAddress?: string): `0x${string}` | undefined => {
  if (customAddress && customAddress.startsWith('0x')) {
    return customAddress as `0x${string}`
  }

  const envAddress = process.env.NEXT_PUBLIC_TOKEN_ADDRESS
  if (!envAddress) {
    // Return undefined instead of throwing during SSR
    return undefined
  }

  return envAddress as `0x${string}`
}

export function useTokenBalance(address?: `0x${string}`, tokenAddress?: string) {
  return useReadContract({
    address: getTokenAddress(tokenAddress),
    abi: TokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })
}

export function useTokenInfo(tokenAddress?: string) {
  const { data: name } = useReadContract({
    address: getTokenAddress(tokenAddress),
    abi: TokenABI,
    functionName: 'name',
  })

  const { data: symbol } = useReadContract({
    address: getTokenAddress(tokenAddress),
    abi: TokenABI,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    address: getTokenAddress(tokenAddress),
    abi: TokenABI,
    functionName: 'decimals',
  })

  return { name, symbol, decimals }
}

export function useTokenTransfer(tokenAddress?: string) {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const transfer = (to: `0x${string}`, amount: string) => {
    const address = getTokenAddress(tokenAddress)
    if (!address) return

    writeContract({
      address,
      abi: TokenABI,
      functionName: 'transfer',
      args: [to, parseEther(amount)],
    })
  }

  return {
    transfer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useCanTransfer(
  from?: `0x${string}`,
  to?: `0x${string}`,
  amount?: string,
  tokenAddress?: string
) {
  return useReadContract({
    address: getTokenAddress(tokenAddress),
    abi: TokenABI,
    functionName: 'canTransfer',
    args: from && to && amount ? [from, to, parseEther(amount)] : undefined,
  })
}

export function useIsVerified(address?: `0x${string}`, tokenAddress?: string) {
  return useReadContract({
    address: getTokenAddress(tokenAddress),
    abi: TokenABI,
    functionName: 'isVerified',
    args: address ? [address] : undefined,
  })
}

export function useIsFrozen(address?: `0x${string}`, tokenAddress?: string) {
  return useReadContract({
    address: getTokenAddress(tokenAddress),
    abi: TokenABI,
    functionName: 'isFrozen',
    args: address ? [address] : undefined,
  })
}
