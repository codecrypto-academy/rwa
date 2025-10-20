'use client'

import { useState, useEffect } from 'react'
import {
  useGetTrustedIssuers,
  useAddTrustedIssuer,
  useRemoveTrustedIssuer,
  useGetIssuerClaimTopics,
} from '@/hooks/useIssuers'

interface ManageIssuersModalProps {
  isOpen: boolean
  onClose: () => void
}

const CLAIM_TOPICS = {
  KYC: { id: BigInt(1), name: 'KYC (Know Your Customer)' },
  AML: { id: BigInt(2), name: 'AML (Anti-Money Laundering)' },
  ACCREDITED: { id: BigInt(3), name: 'Accredited Investor' },
  RESIDENCE: { id: BigInt(4), name: 'Residence Verification' },
}

export function ManageIssuersModal({ isOpen, onClose }: ManageIssuersModalProps) {
  const [view, setView] = useState<'list' | 'add' | 'remove'>('list')
  const [newIssuerAddress, setNewIssuerAddress] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<bigint[]>([])
  const [issuerToRemove, setIssuerToRemove] = useState<`0x${string}` | null>(null)

  // Get all trusted issuers
  const { data: trustedIssuers, refetch: refetchIssuers } = useGetTrustedIssuers()

  // Add issuer hook
  const {
    addTrustedIssuer,
    isPending: isAddPending,
    isConfirming: isAddConfirming,
    isSuccess: isAddSuccess,
    error: addError,
  } = useAddTrustedIssuer()

  // Remove issuer hook
  const {
    removeTrustedIssuer,
    isPending: isRemovePending,
    isConfirming: isRemoveConfirming,
    isSuccess: isRemoveSuccess,
    error: removeError,
  } = useRemoveTrustedIssuer()

  useEffect(() => {
    if (!isOpen) {
      setView('list')
      setNewIssuerAddress('')
      setSelectedTopics([])
      setIssuerToRemove(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (isAddSuccess) {
      alert('Issuer added successfully!')
      setView('list')
      setNewIssuerAddress('')
      setSelectedTopics([])
      refetchIssuers()
    }
  }, [isAddSuccess, refetchIssuers])

  useEffect(() => {
    if (isRemoveSuccess) {
      alert('Issuer removed successfully!')
      setView('list')
      setIssuerToRemove(null)
      refetchIssuers()
    }
  }, [isRemoveSuccess, refetchIssuers])

  useEffect(() => {
    if (addError) {
      alert(`Failed to add issuer: ${addError.message}`)
    }
  }, [addError])

  useEffect(() => {
    if (removeError) {
      alert(`Failed to remove issuer: ${removeError.message}`)
    }
  }, [removeError])

  const handleAddIssuer = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newIssuerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid issuer address')
      return
    }

    if (selectedTopics.length === 0) {
      alert('Please select at least one claim topic')
      return
    }

    addTrustedIssuer(newIssuerAddress as `0x${string}`, selectedTopics)
  }

  const handleRemoveIssuer = () => {
    if (!issuerToRemove) return
    removeTrustedIssuer(issuerToRemove)
  }

  const toggleTopic = (topicId: bigint) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter((id) => id !== topicId))
    } else {
      setSelectedTopics([...selectedTopics, topicId])
    }
  }

  const isProcessing = isAddPending || isAddConfirming || isRemovePending || isRemoveConfirming

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Trusted Issuers</h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
          >
            ✕
          </button>
        </div>

        {/* View: List */}
        {view === 'list' && !isProcessing && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setView('add')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add New Issuer
              </button>
            </div>

            <div className="border rounded-lg divide-y">
              <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700">
                Current Trusted Issuers
              </div>

              {trustedIssuers && (trustedIssuers as `0x${string}`[]).length > 0 ? (
                (trustedIssuers as `0x${string}`[]).map((issuer) => (
                  <IssuerRow
                    key={issuer}
                    issuer={issuer}
                    onRemove={() => {
                      setIssuerToRemove(issuer)
                      setView('remove')
                    }}
                  />
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  No trusted issuers configured
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        )}

        {/* View: Add Issuer */}
        {view === 'add' && !isProcessing && (
          <form onSubmit={handleAddIssuer} className="space-y-4">
            <div>
              <label htmlFor="issuer" className="block text-sm font-medium text-gray-700 mb-2">
                Issuer Address
              </label>
              <input
                type="text"
                id="issuer"
                value={newIssuerAddress}
                onChange={(e) => setNewIssuerAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0x..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Claim Topics (select at least one)
              </label>
              <div className="space-y-2 border rounded-md p-4">
                {Object.entries(CLAIM_TOPICS).map(([key, topic]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={() => toggleTopic(topic.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">{topic.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Only the owner of the TrustedIssuersRegistry can add issuers.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Issuer
              </button>
            </div>
          </form>
        )}

        {/* View: Remove Issuer Confirmation */}
        {view === 'remove' && !isProcessing && issuerToRemove && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="font-medium text-red-900 mb-2">Confirm Removal</h3>
              <p className="text-sm text-red-700 mb-4">
                Are you sure you want to remove this trusted issuer? This action cannot be undone.
              </p>
              <div className="bg-white rounded p-3 border">
                <p className="text-xs text-gray-500 mb-1">Issuer Address:</p>
                <p className="text-sm font-mono break-all">{issuerToRemove}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setView('list')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveIssuer}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove Issuer
              </button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Processing...</h3>
            <p className="text-sm text-gray-600">
              {isAddPending || isRemovePending
                ? 'Confirm transaction in your wallet...'
                : 'Waiting for confirmation...'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Component to display issuer row with claim topics
function IssuerRow({ issuer, onRemove }: { issuer: `0x${string}`; onRemove: () => void }) {
  const { data: claimTopics } = useGetIssuerClaimTopics(issuer)

  const getTopicName = (topicId: bigint) => {
    const topic = Object.values(CLAIM_TOPICS).find((t) => t.id === topicId)
    return topic?.name || `Topic ${topicId}`
  }

  return (
    <div className="px-4 py-3 hover:bg-gray-50">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono break-all text-gray-900">{issuer}</p>
          {claimTopics && Array.isArray(claimTopics) && claimTopics.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {(claimTopics as bigint[]).map((topicId, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                >
                  {getTopicName(topicId)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <button
          onClick={onRemove}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
