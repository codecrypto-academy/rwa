'use client'

import Link from 'next/link'
import { WalletConnect } from '@/components/WalletConnect'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">ERC-3643 RWA Platform</h1>
            <WalletConnect />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Compliant Security Tokens
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create and manage ERC-3643 compliant security tokens with built-in KYC/AML compliance,
            transfer restrictions, and regulatory controls.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <Link href="/deploy" className="block">
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500">
              <h3 className="text-2xl font-bold mb-4">Deploy New Token</h3>
              <p className="text-gray-600 mb-4">
                Create a new ERC-3643 compliant security token with customizable compliance rules.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Maximum balance per wallet (1000 tokens)</li>
                <li>• Maximum number of holders</li>
                <li>• Transfer lock period (30 days)</li>
                <li>• Identity verification (KYC/AML)</li>
              </ul>
            </div>
          </Link>

          <Link href="/manage" className="block">
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500">
              <h3 className="text-2xl font-bold mb-4">Manage Tokens</h3>
              <p className="text-gray-600 mb-4">
                Transfer tokens, manage identities, and monitor compliance status.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Transfer tokens to verified investors</li>
                <li>• Register and verify investor identities</li>
                <li>• View compliance status in real-time</li>
                <li>• Manage trusted claim issuers</li>
              </ul>
            </div>
          </Link>
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4">About ERC-3643</h3>
          <p className="text-gray-700 mb-4">
            ERC-3643 (T-REX) is the standard for issuing and managing compliant security tokens on blockchain.
            It provides a comprehensive framework for identity management, regulatory compliance, and transfer restrictions.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="font-bold mb-2">Identity Registry</h4>
              <p className="text-sm text-gray-600">
                On-chain identity verification with claim-based authentication
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Compliance Modules</h4>
              <p className="text-sm text-gray-600">
                Modular compliance rules enforced at the smart contract level
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-2">Trusted Issuers</h4>
              <p className="text-sm text-gray-600">
                Authorized third parties for KYC/AML claim verification
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
