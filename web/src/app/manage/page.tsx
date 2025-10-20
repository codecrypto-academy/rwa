'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WalletConnect } from '@/components/WalletConnect'
import { RegisterIdentityModal } from '@/components/RegisterIdentityModal'
import { ManageIssuersModal } from '@/components/ManageIssuersModal'
import { AddClaimModal } from '@/components/AddClaimModal'
import { ViewIssuersAndClaims } from '@/components/ViewIssuersAndClaims'
import { useAccount } from 'wagmi'
import { useTokenBalance, useTokenTransfer, useIsVerified, useCanTransfer } from '@/hooks/useToken'
import { useIsRegistered } from '@/hooks/useIdentity'
import { formatEther } from 'viem'

export default function ManagePage() {
  const { isConnected, address } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [tokenAddress, setTokenAddress] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isManageIssuersModalOpen, setIsManageIssuersModalOpen] = useState(false)
  const [isAddClaimModalOpen, setIsAddClaimModalOpen] = useState(false)
  const [isViewRegistryOpen, setIsViewRegistryOpen] = useState(false)

  // Handle mounting for SSR
  useEffect(() => {
    setMounted(true)
    setTokenAddress(process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '')
  }, [])

  // Get token balance
  const { data: balanceData } = useTokenBalance(address, tokenAddress)
  const balance = balanceData ? formatEther(balanceData as bigint) : '0'

  // Get verification status
  const { data: isVerified } = useIsVerified(address, tokenAddress)

  // Get registration status
  const { data: isRegistered } = useIsRegistered(address)

  // Check if transfer is possible
  const { data: canTransfer } = useCanTransfer(
    address,
    recipient as `0x${string}`,
    amount,
    tokenAddress
  )

  // Transfer hook
  const { transfer, isPending, isConfirming, isSuccess, error } = useTokenTransfer(tokenAddress)

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      setRecipient('')
      setAmount('')
      alert('Transfer successful!')
    }
  }, [isSuccess])

  // Show error
  useEffect(() => {
    if (error) {
      alert(`Transfer failed: ${error.message}`)
    }
  }, [error])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    if (!recipient || !amount) {
      alert('Please fill in all fields')
      return
    }

    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid recipient address')
      return
    }

    transfer(recipient as `0x${string}`, amount)
  }

  // Show loading during SSR/hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold hover:text-blue-600">
                ERC-3643 RWA Platform
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Manage Tokens</span>
            </div>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">Manage Your Tokens</h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Transfer Section */}
          <div className="bg-white shadow rounded-lg p-8">
            <h3 className="text-xl font-bold mb-6">Transfer Tokens</h3>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Token Contract Address
                </label>
                <input
                  type="text"
                  id="tokenAddress"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0x..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recipient must be registered and verified
                </p>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.0"
                />
              </div>

              <button
                type="submit"
                disabled={!isConnected || isPending || isConfirming}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isPending ? 'Confirming in wallet...' : isConfirming ? 'Processing...' : isConnected ? 'Transfer Tokens' : 'Connect Wallet'}
              </button>

              {canTransfer === false && recipient && amount && (
                <p className="mt-2 text-sm text-red-600">
                  ⚠️ Transfer not compliant. Check lock period, balance limits, and verification status.
                </p>
              )}
            </form>

            {isConnected && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Your Balance:</span> {balance} tokens
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Connected:</span> {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
            )}
          </div>

          {/* Compliance Status */}
          <div className="bg-white shadow rounded-lg p-8">
            <h3 className="text-xl font-bold mb-6">Compliance Status</h3>

            <div className="space-y-4">
              {isConnected ? (
                <>
                  <div className={`border-l-4 ${isVerified ? 'border-green-500' : 'border-red-500'} pl-4 py-2`}>
                    <h4 className={`font-medium ${isVerified ? 'text-green-900' : 'text-red-900'}`}>
                      Identity {isVerified ? 'Verified' : 'Not Verified'}
                    </h4>
                    <p className={`text-sm ${isVerified ? 'text-green-700' : 'text-red-700'}`}>
                      {isVerified
                        ? 'Your wallet has a verified identity'
                        : 'You need to register and verify your identity'}
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-medium text-green-900">Balance Limit</h4>
                    <p className="text-sm text-green-700">{parseFloat(balance).toFixed(2)}/1000 tokens</p>
                  </div>

                  {canTransfer !== undefined && (
                    <div className={`border-l-4 ${canTransfer ? 'border-green-500' : 'border-yellow-500'} pl-4 py-2`}>
                      <h4 className={`font-medium ${canTransfer ? 'text-green-900' : 'text-yellow-900'}`}>
                        Transfer Status
                      </h4>
                      <p className={`text-sm ${canTransfer ? 'text-green-700' : 'text-yellow-700'}`}>
                        {canTransfer
                          ? 'You can transfer tokens now'
                          : 'Transfer blocked by compliance rules'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="border-l-4 border-gray-500 pl-4 py-2">
                  <h4 className="font-medium text-gray-900">Connect Wallet</h4>
                  <p className="text-sm text-gray-700">Connect your wallet to view compliance status</p>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-md">
              <h4 className="font-medium mb-2">Compliance Requirements</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Must have verified identity</li>
                <li>Recipient must be verified</li>
                <li>Cannot exceed max balance per wallet</li>
                <li>Cannot transfer during lock period</li>
                <li>Cannot exceed max holder count</li>
              </ul>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setIsViewRegistryOpen(true)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Registry Info
              </button>
            </div>
          </div>
        </div>

        {/* Identity Management */}
        <div className="mt-8 bg-white shadow rounded-lg p-8">
          <h3 className="text-xl font-bold mb-6">Identity Management</h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Register Identity</h4>
              <p className="text-sm text-gray-600 mb-4">
                Create a new on-chain identity for an investor
              </p>
              {isConnected && isRegistered === true && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  ✓ Identity already registered
                </div>
              )}
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                disabled={!isConnected}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Register New
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Add KYC Claim</h4>
              <p className="text-sm text-gray-600 mb-4">
                Issue a KYC/AML verification claim to an identity
              </p>
              <button
                onClick={() => setIsAddClaimModalOpen(true)}
                disabled={!isConnected}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Issue Claim
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Manage Issuers</h4>
              <p className="text-sm text-gray-600 mb-4">
                Add or remove trusted claim issuers
              </p>
              <button
                onClick={() => setIsManageIssuersModalOpen(true)}
                disabled={!isConnected}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Manage
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <RegisterIdentityModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
        />
        <ManageIssuersModal
          isOpen={isManageIssuersModalOpen}
          onClose={() => setIsManageIssuersModalOpen(false)}
        />
        <AddClaimModal
          isOpen={isAddClaimModalOpen}
          onClose={() => setIsAddClaimModalOpen(false)}
        />
        <ViewIssuersAndClaims
          isOpen={isViewRegistryOpen}
          onClose={() => setIsViewRegistryOpen(false)}
        />
      </main>
    </div>
  )
}
