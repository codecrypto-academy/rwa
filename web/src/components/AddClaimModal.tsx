'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useGetIdentity, useAddClaim } from '@/hooks/useIdentity'
import { useGetTrustedIssuers } from '@/hooks/useIssuers'

interface AddClaimModalProps {
  isOpen: boolean
  onClose: () => void
}

const CLAIM_TOPICS = {
  KYC: { id: BigInt(1), name: 'KYC (Know Your Customer)', description: 'Verifies customer identity' },
  AML: { id: BigInt(2), name: 'AML (Anti-Money Laundering)', description: 'Confirms AML compliance' },
  ACCREDITED: { id: BigInt(3), name: 'Accredited Investor', description: 'Verifies accredited investor status' },
  RESIDENCE: { id: BigInt(4), name: 'Residence Verification', description: 'Confirms country of residence' },
}

export function AddClaimModal({ isOpen, onClose }: AddClaimModalProps) {
  const { address: connectedAddress } = useAccount()
  const [walletAddress, setWalletAddress] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<bigint>(BigInt(1))
  const [claimData, setClaimData] = useState('')

  // Get identity for the wallet
  const { data: identityAddress } = useGetIdentity(
    walletAddress ? (walletAddress as `0x${string}`) : undefined
  )

  // Get trusted issuers
  const { data: trustedIssuers } = useGetTrustedIssuers()

  // Add claim hook
  const {
    addClaim,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useAddClaim()

  useEffect(() => {
    if (!isOpen) {
      setWalletAddress('')
      setSelectedTopic(BigInt(1))
      setClaimData('')
    }
  }, [isOpen])

  useEffect(() => {
    if (connectedAddress && !walletAddress) {
      setWalletAddress(connectedAddress)
    }
  }, [connectedAddress, walletAddress])

  useEffect(() => {
    if (isSuccess) {
      alert('Claim added successfully!')
      onClose()
    }
  }, [isSuccess, onClose])

  useEffect(() => {
    if (error) {
      alert(`Failed to add claim: ${error.message}`)
    }
  }, [error])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid wallet address')
      return
    }

    if (!identityAddress || identityAddress === '0x0000000000000000000000000000000000000000') {
      alert('This wallet does not have a registered identity')
      return
    }

    // Use connected address as issuer
    if (!connectedAddress) {
      alert('Please connect your wallet to issue claims')
      return
    }

    // Encode claim data - convert string to hex
    let encodedData = '0x'
    if (claimData) {
      const encoder = new TextEncoder()
      const bytes = encoder.encode(claimData)
      encodedData = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    }

    // Add claim to the identity contract
    addClaim(
      identityAddress as `0x${string}`,
      selectedTopic,
      BigInt(1), // scheme: 1 = ECDSA
      connectedAddress,
      '0x', // signature (empty for now)
      encodedData as `0x${string}`,
      '' // uri (empty for now)
    )
  }

  const isProcessing = isPending || isConfirming
  const hasIdentity = identityAddress && identityAddress !== '0x0000000000000000000000000000000000000000'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Issue KYC/AML Claim</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
          >
            ✕
          </button>
        </div>

        {!isProcessing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="wallet" className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                id="wallet"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0x..."
              />
              {walletAddress && hasIdentity === true && (
                <p className="mt-1 text-sm text-green-600">
                  ✓ Identity found: {(identityAddress as string)?.slice(0, 10)}...
                  {(identityAddress as string)?.slice(-8)}
                </p>
              )}
              {walletAddress && hasIdentity === false && (
                <p className="mt-1 text-sm text-red-600">⚠ No identity registered for this wallet</p>
              )}
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                Claim Type
              </label>
              <select
                id="topic"
                value={selectedTopic.toString()}
                onChange={(e) => setSelectedTopic(BigInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(CLAIM_TOPICS).map(([key, topic]) => (
                  <option key={key} value={topic.id.toString()}>
                    {topic.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {Object.values(CLAIM_TOPICS).find((t) => t.id === selectedTopic)?.description}
              </p>
            </div>

            <div>
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                Claim Data (Optional)
              </label>
              <textarea
                id="data"
                value={claimData}
                onChange={(e) => setClaimData(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional claim information..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Any additional data to include with the claim
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Issuer:</strong> {connectedAddress?.slice(0, 10)}...
                {connectedAddress?.slice(-8)}
              </p>
              <p className="mt-2 text-xs text-blue-700">
                You are issuing this claim from your connected wallet. Make sure you are a trusted issuer.
              </p>
            </div>

            {trustedIssuers && Array.isArray(trustedIssuers) && trustedIssuers.length > 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-xs text-gray-600 font-medium mb-2">Current Trusted Issuers:</p>
                <div className="space-y-1">
                  {(trustedIssuers as `0x${string}`[]).map((issuer) => (
                    <div key={issuer} className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono ${
                          connectedAddress?.toLowerCase() === issuer.toLowerCase()
                            ? 'text-green-700 font-medium'
                            : 'text-gray-500'
                        }`}
                      >
                        {issuer.slice(0, 10)}...{issuer.slice(-8)}
                      </span>
                      {connectedAddress?.toLowerCase() === issuer.toLowerCase() && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Important:</strong> Only the owner of the Identity contract can add claims.
              </p>
              <p className="text-xs text-yellow-700">
                Each Identity contract is owned by the investor&apos;s wallet. To issue claims:
              </p>
              <ol className="text-xs text-yellow-700 list-decimal list-inside mt-1 space-y-1">
                <li>The investor must connect their wallet</li>
                <li>They navigate to this page and enter their own address</li>
                <li>They can then issue claims to their own identity</li>
              </ol>
              <p className="text-xs text-yellow-700 mt-2">
                <strong>Or:</strong> As deployer, you can deploy Identity contracts with your address as owner for testing.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hasIdentity}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Issue Claim
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Issuing Claim</h3>
            <p className="text-sm text-gray-600">
              {isPending ? 'Confirm transaction in your wallet...' : 'Waiting for confirmation...'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
