# ERC-3643 RWA Token Platform

A complete implementation of the ERC-3643 (T-REX) standard for compliant Real World Asset (RWA) tokenization with a Next.js frontend for token management.

## Project Structure

```
/sc/              # Smart contracts (Foundry)
  /src/           # Solidity source files
  /test/          # Contract tests
  /script/        # Deployment scripts
/web/             # Next.js web application
```

## Features

### Smart Contracts

**Core Contracts:**
- `Token.sol` - Main ERC-3643 compliant token
- `Identity.sol` - Identity contract with claims
- `IdentityRegistry.sol` - Registry of investor identities
- `TrustedIssuersRegistry.sol` - Registry of authorized claim issuers
- `ClaimTopicsRegistry.sol` - Registry of required claim topics

**Compliance Modules:**
1. **MaxBalanceCompliance** - Limits maximum tokens per wallet (default: 1000)
2. **MaxHoldersCompliance** - Limits total number of token holders
3. **TransferLockCompliance** - Enforces lock-up period for token sales (default: 30 days)

### Web Application

- **Deploy Page** - Create new ERC-3643 tokens with custom compliance rules
- **Manage Page** - Transfer tokens and manage investor identities
- **Wallet Integration** - Connect with MetaMask and other Web3 wallets
- **Compliance Dashboard** - Real-time compliance status monitoring

## Getting Started

### Prerequisites

- Node.js 18+
- Foundry
- MetaMask or compatible Web3 wallet
- jq (for JSON processing)

### Quick Start

The easiest way to get started is using the automated deployment script:

```bash
# 1. Start Anvil in a separate terminal
anvil

# 2. Run the deployment script (from project root)
./deploy.sh
```

This script will:
- Clean and build the smart contracts
- Deploy all contracts to the local Anvil network
- Extract contract addresses
- Create `.env.local` with all contract addresses
- Create `src/config/contracts.ts` with TypeScript constants
- Display a deployment summary

```bash
# 3. Start the web application
cd web
npm run dev
```

Open http://localhost:3000 and connect MetaMask to localhost:8545 (Chain ID: 31337).

### Manual Deployment

#### Smart Contract Development

```bash
cd sc

# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Deploy to local network (requires Anvil running)
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

#### Web Application

```bash
cd web

# Install dependencies
npm install

# Create .env.local with contract addresses
cp .env.example .env.local
# Edit .env.local with your deployed contract addresses

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The web application will be available at http://localhost:3000

### MetaMask Configuration

To use the deployed contracts with MetaMask:

1. Add Localhost network:
   - Network Name: Localhost
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. Import test account (from Anvil):
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This account will have 10,000 ETH for testing

## Compliance Rules

### 1. Maximum Balance per Wallet
- Default: 1000 tokens
- Prevents concentration of ownership
- Enforced on both transfers and minting

### 2. Maximum Number of Holders
- Configurable limit on total token holders
- Prevents new holders once limit is reached
- Automatically tracks holder count

### 3. Transfer Lock Period
- Default: 30 days
- Prevents immediate token flipping
- Lock period starts when tokens are received
- Agent can perform forced transfers that bypass lock

## Identity & Verification

All token holders must have:
1. Registered identity in the IdentityRegistry
2. Valid KYC/AML claim from a trusted issuer
3. Required claim topics (configured in ClaimTopicsRegistry)

### Adding an Investor

1. Deploy an Identity contract for the investor
2. Register the identity in IdentityRegistry
3. Add KYC/AML claim issued by a trusted issuer
4. Investor can now receive and transfer tokens (subject to compliance)

## Contract Roles

- **DEFAULT_ADMIN_ROLE** - Can configure registries, pause token, manage roles
- **AGENT_ROLE** - Can mint, burn, and perform forced transfers
- **COMPLIANCE_ROLE** - Can add/remove compliance modules

## Security Features

- **Pausable** - Emergency stop mechanism for token transfers
- **Frozen Accounts** - Ability to freeze individual accounts
- **Access Control** - Role-based permissions for administrative functions
- **Compliance Enforcement** - On-chain validation of all transfers
- **Event Logging** - Comprehensive event logging for audit trails

## Testing

The test suite covers:
- Token minting and burning
- Transfer compliance checks
- Identity verification
- All three compliance rules
- Account freezing and pausing
- Forced transfers by agents

Run tests:
```bash
cd sc
forge test -vv
```

## Deployment

The deployment script (`Deploy.s.sol`) automatically:
1. Deploys all registry contracts
2. Deploys the token contract
3. Deploys and configures compliance modules
4. Sets up initial claim topics
5. Links all contracts together

## Frontend Integration

The web app uses:
- **Wagmi** - React hooks for Ethereum
- **Viem** - TypeScript client for Ethereum
- **TanStack Query** - Async state management
- **Tailwind CSS** - Styling

Contract ABIs are automatically extracted from Foundry builds and stored in `/web/src/abis/`.

## License

MIT

## Contributing

This is an implementation of the ERC-3643 standard for educational and demonstration purposes.
For production use, ensure proper security audits and legal compliance.
