# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Implementation of the ERC-3643 (T-REX) standard for compliant security tokens representing Real World Assets (RWA). The project includes smart contracts and a web application for token creation and transfers.

## Project Structure

```
/foundry-sc/          # Smart contracts (Foundry/Solidity)
/web-app/             # Next.js web application
```

## Smart Contract Development (Foundry)

### Commands
```bash
# Install dependencies
forge install

# Build contracts
forge build

# Run all tests
forge test

# Run tests with verbosity
forge test -vvv

# Run specific test file
forge test --match-path test/ContractName.t.sol

# Run specific test function
forge test --match-test testFunctionName

# Run tests with gas reporting
forge test --gas-report

# Deploy to local network
anvil  # In separate terminal
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Format code
forge fmt

# Clean artifacts
forge clean
```

### ERC-3643 Standard Implementation

The ERC-3643 (T-REX - Token for Regulated EXchanges) standard provides a framework for issuing and managing compliant security tokens.

**Core Components:**
- **Token Contract**: ERC-3643 compliant token with transfer restrictions
- **Identity Registry**: Manages investor identities and their verified claims
- **Compliance Module**: Enforces regulatory rules on token transfers
- **Trusted Issuers Registry**: Manages authorized claim issuers for KYC/AML
- **Claim Topics Registry**: Defines required claim types for token holders

### Compliance Rules Implementation

The project implements the following compliance rules:

1. **Maximum tokens per wallet**: 1000 tokens
   - Enforced in compliance module before transfers
   - Prevents concentration of ownership

2. **Maximum number of holders**
   - Global cap on total token holders
   - Enforced during new holder onboarding

3. **Lock-up period for selling**
   - Time-based transfer restrictions
   - Prevents immediate token flipping

### Contract Architecture

```
Token (ERC-3643)
├── Compliance Module
│   ├── MaxBalanceCompliance (rule #1)
│   ├── MaxHoldersCompliance (rule #2)
│   └── TransferLockCompliance (rule #3)
├── Identity Registry
│   └── Identity Contracts (per investor)
├── Trusted Issuers Registry
└── Claim Topics Registry
```

### Key Security Patterns
- **Role-based Access Control**: Separate roles for token agents, compliance managers, and owners
- **Modular Compliance**: Each rule in separate module for composability
- **Identity Management**: On-chain identity verification through claims
- **Pausable Transfers**: Emergency stop mechanism
- **Event Logging**: Comprehensive events for compliance auditing

## Web Application (Next.js)

### Commands
```bash
# Install dependencies
npm install  # or yarn install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test
```

### Application Features

1. **Token Creation Interface**
   - Deploy new ERC-3643 tokens
   - Configure compliance rules
   - Set up identity registry and claim issuers

2. **Transfer Management**
   - Transfer tokens between compliant addresses
   - View transfer eligibility in real-time
   - Display compliance check results

3. **Identity & Compliance Dashboard**
   - Manage investor identities
   - Issue and verify claims
   - Monitor compliance status

### Tech Stack
- **Framework**: Next.js (React)
- **Web3 Integration**: ethers.js or wagmi/viem
- **UI Components**: (to be determined based on implementation)
- **State Management**: (to be determined based on implementation)

## Development Workflow

1. **Smart Contract First**: Implement and test ERC-3643 contracts in Foundry
2. **Local Testing**: Use Anvil for local blockchain development
3. **Web Integration**: Connect Next.js frontend to deployed contracts
4. **End-to-End Testing**: Test complete token lifecycle

## Testing Strategy

### Smart Contracts
- Unit tests for each compliance module
- Integration tests for full token transfer flows
- Test compliance rule enforcement
- Test identity verification flows
- Fuzz testing for edge cases

### Web Application
- Component tests for UI elements
- Integration tests for wallet connections
- E2E tests for token creation and transfer flows

## Important Notes

- All token transfers must pass compliance checks
- Investors must have valid identity claims before receiving tokens
- Compliance rules are enforced on-chain and cannot be bypassed
- The token agent role has special transfer privileges for forced transfers/recoveries
