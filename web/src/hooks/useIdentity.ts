'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import IdentityRegistryABI from '@/abis/IdentityRegistry.json'
import IdentityABI from '@/abis/Identity.json'
import { CONTRACTS } from '@/config/contracts'

// Identity Registry Hooks

export function useIsRegistered(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.IdentityRegistry,
    abi: IdentityRegistryABI,
    functionName: 'isRegistered',
    args: address ? [address] : undefined,
  })
}

export function useGetIdentity(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACTS.IdentityRegistry,
    abi: IdentityRegistryABI,
    functionName: 'getIdentity',
    args: address ? [address] : undefined,
  })
}

export function useRegisterIdentity() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const registerIdentity = (wallet: `0x${string}`, identityAddress: `0x${string}`) => {
    writeContract({
      address: CONTRACTS.IdentityRegistry,
      abi: IdentityRegistryABI,
      functionName: 'registerIdentity',
      args: [wallet, identityAddress],
    })
  }

  return {
    registerIdentity,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// Identity Contract Hooks

export function useAddClaim() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const addClaim = (
    identityAddress: `0x${string}`,
    topic: bigint,
    scheme: bigint,
    issuer: `0x${string}`,
    signature: `0x${string}`,
    data: `0x${string}`,
    uri: string
  ) => {
    writeContract({
      address: identityAddress,
      abi: IdentityABI,
      functionName: 'addClaim',
      args: [topic, scheme, issuer, signature, data, uri],
    })
  }

  return {
    addClaim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

export function useClaimExists(
  identityAddress?: `0x${string}`,
  topic?: bigint,
  issuer?: `0x${string}`
) {
  const enabled = Boolean(
    identityAddress &&
    identityAddress !== '0x0000000000000000000000000000000000000000' &&
    topic !== undefined &&
    issuer
  )

  return useReadContract({
    address: identityAddress,
    abi: IdentityABI,
    functionName: 'claimExists',
    args: enabled ? [topic, issuer] : undefined,
    query: {
      enabled,
    },
  })
}

export function useGetClaim(
  identityAddress?: `0x${string}`,
  topic?: bigint,
  issuer?: `0x${string}`
) {
  return useReadContract({
    address: identityAddress,
    abi: IdentityABI,
    functionName: 'getClaim',
    args: topic !== undefined && issuer ? [topic, issuer] : undefined,
  })
}

export function useGetRegisteredCount() {
  return useReadContract({
    address: CONTRACTS.IdentityRegistry,
    abi: IdentityRegistryABI,
    functionName: 'getRegisteredCount',
  })
}

export function useGetRegisteredAddress(index?: number) {
  return useReadContract({
    address: CONTRACTS.IdentityRegistry,
    abi: IdentityRegistryABI,
    functionName: 'getRegisteredAddress',
    args: index !== undefined ? [index] : undefined,
  })
}

// Deploy new Identity contract
export function useDeployIdentity() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const deployIdentity = (owner: `0x${string}`) => {
    writeContract({
      address: CONTRACTS.IdentityRegistry,
      abi: IdentityABI,
      functionName: 'constructor',
      args: [owner],
    })
  }

  return {
    deployIdentity,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
