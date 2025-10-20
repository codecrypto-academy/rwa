'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRegisterIdentity } from '@/hooks/useIdentity'

interface RegisterIdentityModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RegisterIdentityModal({ isOpen, onClose }: RegisterIdentityModalProps) {
  const { address } = useAccount()
  const [walletAddress, setWalletAddress] = useState('')
  const [identityAddress, setIdentityAddress] = useState('')

  // Register Identity in registry
  const {
    registerIdentity,
    isPending: isRegisterPending,
    isConfirming: isRegisterConfirming,
    isSuccess: isRegisterSuccess,
    error: registerError,
  } = useRegisterIdentity()

  useEffect(() => {
    if (!isOpen) {
      setWalletAddress('')
      setIdentityAddress('')
    }
  }, [isOpen])

  // Update wallet address when connected
  useEffect(() => {
    if (address && !walletAddress) {
      setWalletAddress(address)
    }
  }, [address, walletAddress])

  // Handle registration success
  useEffect(() => {
    if (isRegisterSuccess) {
      alert('Identity registered successfully!')
      onClose()
    }
  }, [isRegisterSuccess, onClose])

  // Handle error
  useEffect(() => {
    if (registerError) {
      alert(`Registration failed: ${registerError.message}`)
    }
  }, [registerError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid wallet address')
      return
    }

    if (!identityAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid identity contract address')
      return
    }

    registerIdentity(walletAddress as `0x${string}`, identityAddress as `0x${string}`)
  }

  const handleClose = () => {
    if (!isRegisterPending && !isRegisterConfirming) {
      onClose()
    }
  }

  const isProcessing = isRegisterPending || isRegisterConfirming

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Register Identity</h2>
          <button
            onClick={handleClose}
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
              <p className="mt-1 text-sm text-gray-500">
                The wallet address to register
              </p>
            </div>

            <div>
              <label htmlFor="identity" className="block text-sm font-medium text-gray-700 mb-2">
                Identity Contract Address
              </label>
              <input
                type="text"
                id="identity"
                value={identityAddress}
                onChange={(e) => setIdentityAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0x..."
              />
              <p className="mt-1 text-sm text-gray-500">
                The deployed Identity contract address
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You must first deploy an Identity contract for the wallet.
                Use Foundry or deploy via script, then enter the contract address here.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Permissions:</strong> You must be the owner of the IdentityRegistry to register identities.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Register
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Registering Identity</h3>
            <p className="text-sm text-gray-600">
              {isRegisterPending
                ? 'Confirm transaction in your wallet...'
                : 'Waiting for confirmation...'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
