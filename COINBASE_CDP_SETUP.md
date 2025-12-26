# Coinbase Developer Platform (CDP) Wallet Integration Setup

This application uses Coinbase CDP to create and manage custodial wallets for users automatically.

## What is CDP?

Coinbase Developer Platform (CDP) Wallets allow you to programmatically create and manage wallets without handling private keys directly. The wallets are secured using Trusted Execution Environments (TEEs), ensuring that private keys are never exposed.

## Setup Instructions

### 1. Create a CDP Account

1. Go to [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
2. Sign up or log in
3. Create a new project

### 2. Generate API Credentials

1. In your CDP project dashboard, go to **API Keys**
2. Click **Create API Key**
3. Select permissions: `wallet:read`, `wallet:create`, `wallet:sign`
4. Download the API key JSON file - it contains:
   - `name`: Your API key name
   - `privateKey`: Your API private key (ES256 format)

### 3. Add Environment Variables

Add the following to your `.env.local` file:

```bash
CDP_API_KEY_NAME=organizations/your-org-id/apiKeys/your-key-id
CDP_API_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\nYour private key here\n-----END EC PRIVATE KEY-----"
```

**Important:** Keep your private key secure and never commit it to version control.

### 4. Install Dependencies

The app requires the `jsonwebtoken` package for CDP authentication:

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 5. How It Works

#### Automatic Wallet Creation

When a user signs up or logs in:
1. The system checks if the user has a CDP wallet
2. If not, it automatically creates one using `createUserWallet()`
3. The wallet is stored in the `wallets` table with:
   - `wallet_id`: CDP wallet identifier
   - `network_id`: Blockchain network (default: base-sepolia)
   - `default_address`: The wallet's public address

#### Receipt Signing

When a user scans a receipt:
1. The system retrieves the user's CDP wallet
2. Creates a message: `receiptId:name:surname:birthNumber:dic`
3. Signs the message using the CDP wallet via API
4. Stores the signature in the `scanned_receipts` table

#### Verification

External systems can verify receipt authenticity:
1. Hash the receipt data locally
2. Send the hash to `/api/verify-receipt`
3. The API verifies the signature matches the expected wallet address

## Network Configuration

By default, wallets are created on **Base Sepolia** (testnet). To use mainnet:

1. Update `network_id` in `lib/coinbase-cdp.ts`:
   ```typescript
   createCDPWallet("base-mainnet")
   ```

2. Ensure your CDP API key has mainnet permissions

## Supported Networks

- `base-sepolia` (testnet) - Default
- `base-mainnet` (production)
- `ethereum-mainnet`
- `ethereum-sepolia`
- `polygon-mainnet`
- And more...

## Security Notes

- Private keys never leave CDP's Trusted Execution Environment
- Users don't need to manage wallets manually
- All signing happens server-side via CDP API
- Wallet addresses are tied to user accounts in the database

## Troubleshooting

### "CDP API credentials not configured"
- Check that `CDP_API_KEY_NAME` and `CDP_API_PRIVATE_KEY` are set
- Verify the private key format includes the PEM headers

### "Database error creating new user"
- Ensure the `wallets` table exists (run migration 004)
- Check that user has a profile in `user_profiles` table

### "Failed to sign message with wallet"
- Verify CDP API key has `wallet:sign` permission
- Check that the wallet_id and address are correct
- Ensure you're not hitting rate limits

## Cost Considerations

CDP wallet creation and signing operations may incur costs depending on:
- Number of wallets created
- Number of signing operations
- Network fees (for on-chain transactions)

Check [CDP Pricing](https://www.coinbase.com/cloud/pricing) for current rates.

## Development vs Production

**Development (Testnet):**
- Use `base-sepolia` or `ethereum-sepolia`
- Free to create wallets and sign messages
- No real funds involved

**Production (Mainnet):**
- Switch to `base-mainnet` or `ethereum-mainnet`
- Real transaction costs apply
- Require proper security audit before launch
