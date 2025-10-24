# Incident Management System

A decentralized incident reporting platform with Self Protocol identity verification and blockchain-based record keeping.

## Features

- **Self Protocol Identity Verification** - Zero-knowledge proof of identity
- **Blockchain Timestamping** - Immutable incident records on Celo
- **IPFS Storage** - Decentralized document storage via Storacha
- **PDF Report Generation** - Professional incident documentation
- **Smart Contract Integration** - Automated verification checks

## Project Structure

```
├── contracts/          # Smart contracts (Foundry)
│   ├── src/
│   │   ├── IncidentContract.sol    # Incident storage contract
│   │   └── ProofOfHuman.sol        # Self Protocol verification
│   └── script/         # Deployment scripts
└── dapp/              # React frontend (Vite + TypeScript)
    └── src/
        ├── components/ # UI components
        └── lib/       # PDF generation utilities
```

## Setup

### Prerequisites
- Node.js 18+
- Foundry
- MetaMask wallet
- Storacha account

### 1. Clone Repository
```bash
git clone <repository-url>
cd self-road-report-celo
```

### 2. Deploy Contracts
```bash
cd contracts
npm install
forge build
./script/deploy-proof-of-human.sh
./script/deploy-incident-manager.sh
```

### 3. Setup Frontend
```bash
cd dapp
npm install
cp .env.example .env
# Configure .env with your values
npm run dev
```

## User Flow

### Step 1: Connect Services
- Connect MetaMask wallet
- Connect Storacha storage account

### Step 2: Identity Verification
- **Returning users**: Auto-verified, skip to incident reporting
- **New users**: Scan QR code with Self Protocol app for verification

### Step 3: Report Incident
- Fill incident details (location, description, photos)
- Generate professional PDF report

### Step 4: Decentralized Storage
- Upload PDF to IPFS via Storacha
- Receive permanent content identifier (CID)

### Step 5: Blockchain Record
- Submit incident hash to smart contract
- Receive immutable transaction receipt

### Step 6: Completion
- Download PDF report
- Access permanent IPFS links
- View blockchain verification

## Smart Contracts

### ProofOfHuman.sol
- Integrates with Self Protocol for identity verification
- Tracks verified users: `isUserVerified(address)`
- One-time verification per wallet address

### IncidentContract.sol
- Stores incident metadata on-chain
- Links to IPFS-stored documents
- Provides incident search by ID

## Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Blockchain**: Celo (Sepolia testnet)
- **Storage**: IPFS via Storacha (Web3.Storage)
- **Identity**: Self Protocol (zero-knowledge verification)
- **Contracts**: Solidity + Foundry
- **PDF**: pdf-lib for document generation

## Environment Variables

```bash
# Self Protocol Configuration
VITE_SELF_APP_NAME="Incident Management System"
VITE_SELF_SCOPE="incident-management"
VITE_SELF_ENDPOINT=https://staging-api.self.xyz
```

## Deployed Contracts (Celo Sepolia)

- **ProofOfHuman**: `0xa46fbeC38d888c37b4310a145745CF947d83a0eB`
- **IncidentManager**: `0x839b35480ddb545e550742e094c0fc0a73fd43ce`

## Key Benefits

- **Privacy-Preserving**: Identity verified without revealing personal data
- **Immutable Records**: Cannot be tampered with or lost
- **Decentralized**: No single point of failure
- **Professional**: Generates court-admissible documentation
- **User-Friendly**: Seamless experience for verified users

## Development

```bash
# Frontend development
cd dapp && npm run dev

# Contract development
cd contracts && forge test

# Deploy to testnet
forge script script/Deploy.s.sol --broadcast --rpc-url $RPC_URL
```

## License

MIT