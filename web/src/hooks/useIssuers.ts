'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import TrustedIssuersRegistryABI from '@/abis/TrustedIssuersRegistry.json'
import { CONTRACTS } from '@/config/contracts'

// Read hooks

export function useIsTrustedIssuer(issuer?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.TrustedIssuersRegistry,
    abi: TrustedIssuersRegistryABI,
    functionName: 'isTrustedIssuer',
    args: issuer ? [issuer] : undefined,
  })
}

export function useGetTrustedIssuers() {
  return useReadContract({
    address: CONTRACTS.TrustedIssuersRegistry,
    abi: TrustedIssuersRegistryABI,
    functionName: 'getTrustedIssuers',
  })
}

export function useGetIssuerClaimTopics(issuer?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.TrustedIssuersRegistry,
    abi: TrustedIssuersRegistryABI,
    functionName: 'getIssuerClaimTopics',
    args: issuer ? [issuer] : undefined,
  })
}

export function useHasClaimTopic(issuer?: `0x${string}`, claimTopic?: bigint) {
  return useReadContract({
    address: CONTRACTS.TrustedIssuersRegistry,
    abi: TrustedIssuersRegistryABI,
    functionName: 'hasClaimTopic',
    args: issuer && claimTopic !== undefined ? [issuer, claimTopic] : undefined,
  })
}

// Write hooks

export function useAddTrustedIssuer() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const addTrustedIssuer = (issuer: `0x${string}`, claimTopics: bigint[]) => {
    writeContract({
      address: CONTRACTS.TrustedIssuersRegistry,
      abi: TrustedIssuersRegistryABI,
      functionName: 'addTrustedIssuer',
      args: [issuer, claimTopics],
    })
  }

  return {
    addTrustedIssuer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useRemoveTrustedIssuer() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const removeTrustedIssuer = (issuer: `0x${string}`) => {
    writeContract({
      address: CONTRACTS.TrustedIssuersRegistry,
      abi: TrustedIssuersRegistryABI,
      functionName: 'removeTrustedIssuer',
      args: [issuer],
    })
  }

  return {
    removeTrustedIssuer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useUpdateIssuerClaimTopics() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const updateIssuerClaimTopics = (issuer: `0x${string}`, claimTopics: bigint[]) => {
    writeContract({
      address: CONTRACTS.TrustedIssuersRegistry,
      abi: TrustedIssuersRegistryABI,
      functionName: 'updateIssuerClaimTopics',
      args: [issuer, claimTopics],
    })
  }

  return {
    updateIssuerClaimTopics,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
