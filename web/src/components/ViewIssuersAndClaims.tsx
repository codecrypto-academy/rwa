'use client'

import { useState } from 'react'
import { useGetTrustedIssuers, useGetIssuerClaimTopics } from '@/hooks/useIssuers'
import { useGetRegisteredCount, useGetRegisteredAddress, useGetIdentity, useClaimExists } from '@/hooks/useIdentity'

interface ViewIssuersAndClaimsProps {
  isOpen: boolean
  onClose: () => void
}

const CLAIM_TOPICS = {
  1: 'KYC',
  2: 'AML',
  3: 'Accredited Investor',
  4: 'Residence',
}

export function ViewIssuersAndClaims({ isOpen, onClose }: ViewIssuersAndClaimsProps) {
  const [activeTab, setActiveTab] = useState<'issuers' | 'identities'>('issuers')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Registry Information</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('issuers')}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === 'issuers'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Trusted Issuers
            </button>
            <button
              onClick={() => setActiveTab('identities')}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === 'identities'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registered Identities
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'issuers' && <IssuersView />}
        {activeTab === 'identities' && <IdentitiesView />}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Issuers View Component
function IssuersView() {
  const { data: trustedIssuers } = useGetTrustedIssuers()

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          <strong>Trusted Issuers</strong> are authorized to issue verification claims (KYC, AML, etc.)
          to investor identities.
        </p>
      </div>

      {trustedIssuers && Array.isArray(trustedIssuers) && trustedIssuers.length > 0 ? (
        <div className="border rounded-lg divide-y">
          <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700">
            Total Issuers: {trustedIssuers.length}
          </div>
          {(trustedIssuers as `0x${string}`[]).map((issuer, index) => (
            <IssuerCard key={issuer} issuer={issuer} index={index} />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          No trusted issuers configured
        </div>
      )}
    </div>
  )
}

// Issuer Card Component
function IssuerCard({ issuer, index }: { issuer: `0x${string}`; index: number }) {
  const { data: claimTopics } = useGetIssuerClaimTopics(issuer)

  return (
    <div className="px-4 py-4 hover:bg-gray-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
              #{index + 1}
            </span>
            <span className="text-sm font-mono text-gray-900 break-all">
              {issuer}
            </span>
          </div>

          {claimTopics && Array.isArray(claimTopics) && claimTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-gray-600">Authorized claim types:</span>
              {(claimTopics as bigint[]).map((topicId, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                >
                  {CLAIM_TOPICS[Number(topicId) as keyof typeof CLAIM_TOPICS] || `Topic ${topicId}`}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 mt-2">No claim topics assigned</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Identities View Component
function IdentitiesView() {
  const { data: registeredCount } = useGetRegisteredCount()
  const count = registeredCount ? Number(registeredCount) : 0

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          <strong>Registered Identities</strong> are investor wallets with verified on-chain identities
          containing KYC/AML claims.
        </p>
      </div>

      {count > 0 ? (
        <div className="border rounded-lg divide-y">
          <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700">
            Total Registered: {count}
          </div>
          {Array.from({ length: count }, (_, i) => (
            <IdentityCard key={i} index={i} />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          No identities registered yet
        </div>
      )}
    </div>
  )
}

// Identity Card Component
function IdentityCard({ index }: { index: number }) {
  const { data: walletAddress } = useGetRegisteredAddress(index)
  const { data: identityAddress } = useGetIdentity(walletAddress as `0x${string}`)

  return (
    <div className="px-4 py-4 hover:bg-gray-50">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
            #{index + 1}
          </span>
          <div className="flex-1">
            <p className="text-xs text-gray-600">Wallet Address:</p>
            <p className="text-sm font-mono text-gray-900 break-all">{walletAddress as string}</p>
          </div>
        </div>

        {identityAddress && identityAddress !== '0x0000000000000000000000000000000000000000' ? (
          <>
            <div>
              <p className="text-xs text-gray-600">Identity Contract:</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {identityAddress as string}
              </p>
            </div>

            <ClaimsInfo
              identityAddress={identityAddress as `0x${string}`}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}

// Claims Info Component
function ClaimsInfo({
  identityAddress
}: {
  identityAddress: `0x${string}`
}) {
  const { data: trustedIssuers } = useGetTrustedIssuers()

  if (!trustedIssuers || !Array.isArray(trustedIssuers) || trustedIssuers.length === 0) {
    return <p className="text-xs text-gray-500 italic">No claims found (no trusted issuers)</p>
  }

  return (
    <div>
      <p className="text-xs text-gray-600 mb-2">Claims:</p>
      <div className="flex flex-wrap gap-2">
        {(trustedIssuers as `0x${string}`[]).map((issuer) =>
          Object.entries(CLAIM_TOPICS).map(([topicId, topicName]) => (
            <ClaimChecker
              key={`${issuer}-${topicId}`}
              identityAddress={identityAddress}
              issuer={issuer}
              topicId={BigInt(topicId)}
              topicName={topicName}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Claim Checker Component
function ClaimChecker({
  identityAddress,
  issuer,
  topicId,
  topicName,
}: {
  identityAddress: `0x${string}`
  issuer: `0x${string}`
  topicId: bigint
  topicName: string
}) {
  const { data: claimExists, isLoading, error } = useClaimExists(identityAddress, topicId, issuer)

  // Debug: show all states
  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded text-xs">
        <span className="text-gray-500">Checking {topicName}...</span>
      </div>
    )
  }

  if (error) {
    console.error(`Error checking claim ${topicName}:`, error)
    return null
  }

  if (!claimExists) return null

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded text-xs">
      <span className="font-medium text-green-900">{topicName}</span>
      <span className="text-green-700">
        by {issuer.slice(0, 6)}...{issuer.slice(-4)}
      </span>
    </div>
  )
}
