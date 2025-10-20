'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WalletConnect } from '@/components/WalletConnect'
import { useAccount } from 'wagmi'

export default function DeployPage() {
  const { isConnected } = useAccount()
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [maxBalance, setMaxBalance] = useState('1000')
  const [maxHolders, setMaxHolders] = useState('100')
  const [lockPeriod, setLockPeriod] = useState('40')
  const [deploying, setDeploying] = useState(false)

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    setDeploying(true)
    try {
      // TODO: Implement deployment logic
      console.log('Deploying token...', {
        tokenName,
        tokenSymbol,
        maxBalance,
        maxHolders,
        lockPeriod,
      })

      // Simulated deployment
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Token deployed successfully! (Demo)')
    } catch (error) {
      console.error('Deployment failed:', error)
      alert('Deployment failed. See console for details.')
    } finally {
      setDeploying(false)
    }
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
              <span className="text-gray-600">Deploy Token</span>
            </div>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">Deploy New ERC-3643 Token</h2>

        <form onSubmit={handleDeploy} className="bg-white shadow rounded-lg p-8 space-y-6">
          <div>
            <label htmlFor="tokenName" className="block text-sm font-medium text-gray-700 mb-2">
              Token Name
            </label>
            <input
              type="text"
              id="tokenName"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., My Security Token"
            />
          </div>

          <div>
            <label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-700 mb-2">
              Token Symbol
            </label>
            <input
              type="text"
              id="tokenSymbol"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., MST"
              maxLength={10}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Compliance Rules</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="maxBalance" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Balance per Wallet
                </label>
                <input
                  type="number"
                  id="maxBalance"
                  value={maxBalance}
                  onChange={(e) => setMaxBalance(e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum number of tokens an address can hold
                </p>
              </div>

              <div>
                <label htmlFor="maxHolders" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Number of Holders
                </label>
                <input
                  type="number"
                  id="maxHolders"
                  value={maxHolders}
                  onChange={(e) => setMaxHolders(e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Maximum total number of token holders allowed
                </p>
              </div>

              <div>
                <label htmlFor="lockPeriod" className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Lock Period (days)
                </label>
                <input
                  type="number"
                  id="lockPeriod"
                  value={lockPeriod}
                  onChange={(e) => setLockPeriod(e.target.value)}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Time investors must wait before they can transfer tokens
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={!isConnected || deploying}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {deploying ? 'Deploying...' : isConnected ? 'Deploy Token' : 'Connect Wallet to Deploy'}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h4 className="font-medium mb-2">Deployment Process</h4>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Deploy core registry contracts (Identity, Trusted Issuers, Claim Topics)</li>
            <li>Deploy compliance modules with your specified rules</li>
            <li>Deploy the main ERC-3643 token contract</li>
            <li>Configure all contracts and set permissions</li>
            <li>Token is ready for investor registration and minting</li>
          </ol>
        </div>
      </main>
    </div>
  )
}
