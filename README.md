# Decentralized Insurance Pool — Backend

Backend API for a community-governed mutual insurance protocol built on the [Stellar](https://stellar.org) network. Users deposit USDC into insurance pools, pay premiums, submit claims with on-chain evidence, and a quorum of elected assessors votes to approve or reject payouts — all automated through Soroban smart contracts.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | NestJS |
| Database | PostgreSQL |
| ORM | TypeORM |
| File storage | IPFS via Pinata |
| Blockchain | Stellar / Soroban RPC |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   NestJS Backend                    │
│                                                     │
│  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌──────┐  │
│  │  Pools   │  │ Claims │  │Assessors │  │ IPFS │  │
│  │   API    │  │  API   │  │   API    │  │  API │  │
│  └──────────┘  └────────┘  └──────────┘  └──────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │           Soroban Event Indexer              │   │
│  │  polls RPC → handles events → writes to DB  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
    PostgreSQL                   Stellar Testnet
```

## Modules

### Indexer
Polls the Soroban RPC every 5 seconds and syncs on-chain state to PostgreSQL.

| Event | Action |
|---|---|
| `POOL/created` | Insert pool row |
| `POOL/deposit` | Upsert LP position, update reserve |
| `POOL/withdraw` | Update reserve balance |
| `POOL/premium` | Update reserve balance |
| `POOL/payout` | Update reserve balance |
| `CLAIM/submit` | Insert claim row |
| `CLAIM/vote` | Insert vote, increment approval/rejection count |
| `CLAIM/final` | Update claim status to Approved/Rejected |
| `CLAIM/paid` | Update claim status to Paid |
| `ASSOR/reg` | Upsert assessor record |

### REST API

```
GET  /pools                              List all active pools
GET  /pools/:poolId                      Pool detail + reserve stats
GET  /pools/:poolId/positions/:address   LP balance for an address

GET  /claims                             List claims (filter: ?claimant= &status=)
GET  /claims/queue                       Voting queue — claims under review
GET  /claims/:claimId                    Claim detail with full vote breakdown

GET  /assessors                          All active assessors sorted by reputation score
GET  /assessors/:address                 Individual assessor stats

POST /ipfs/upload                        Upload evidence file → returns IPFS CID + URL

GET  /governance/proposals               All governance proposals
POST /governance/proposals               Create a proposal
GET  /governance/proposals/:proposalId   Proposal detail
GET  /governance/elections               Active assessor election proposals
```

Swagger UI is available at `http://localhost:3001/api` when the server is running.

## Database Schema

```
pools        — mirrors on-chain pool state (reserve, rates, member count)
claims       — full claim lifecycle (Pending → UnderReview → Approved/Rejected → Paid)
positions    — LP deposit balances per pool per address
assessors    — registered assessors with reputation score and stake
votes        — per-claim vote records (assessor, approve/reject, timestamp)
proposals    — governance proposals and election records
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- A Pinata account (for IPFS uploads)
- Deployed Soroban contract IDs (pool-manager, claims-engine)

### Setup

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
```

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=insurance_pool

STELLAR_RPC_URL=https://soroban-testnet.stellar.org
POOL_MANAGER_ID=<deployed contract ID>
CLAIMS_ENGINE_ID=<deployed contract ID>
INDEXER_POLL_MS=5000

PINATA_API_KEY=<your key>
PINATA_SECRET_KEY=<your secret>

PORT=3001
```

### Run

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The database schema is auto-synced on startup via TypeORM `synchronize`. Switch to migrations before deploying to production.

## Claim Flow

```
1. User uploads evidence file
   POST /ipfs/upload → { cid, url }

2. User calls submit_claim on-chain with the CID as evidence_hash
   Indexer picks up CLAIM/submit → inserts claim row

3. Assessors fetch the voting queue
   GET /claims/queue

4. Each assessor votes on-chain (approve/reject)
   Indexer picks up CLAIM/vote → updates counts

5. When quorum is reached, contract auto-finalizes
   Indexer picks up CLAIM/final → updates status

6. Anyone calls execute_payout on-chain for Approved claims
   Indexer picks up CLAIM/paid → marks claim Paid
```

## Smart Contracts

This backend indexes two deployed Soroban contracts:

- **pool-manager** — manages USDC reserves, LP deposits, premium payments, and payout releases
- **claims-engine** — handles claim submission, assessor voting with FBA quorum logic, and cross-contract payout execution

The remaining contracts (governance-dao, reputation-engine) are defined in `structure.md`.

## Project Structure

```
src/
├── common/entities/     # TypeORM entities (Pool, Claim, Position, Assessor, Vote, Proposal)
├── indexer/             # Soroban RPC event poller
├── pools/               # Pools REST module
├── claims/              # Claims REST module
├── assessors/           # Assessors REST module
├── ipfs/                # Pinata IPFS upload module
├── governance/          # Governance proposals + elections module
├── app.module.ts        # Root module
└── main.ts              # Entry point + Swagger setup
```
