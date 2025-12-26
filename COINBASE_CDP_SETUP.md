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
3. **CRITICAL:** Select **ES256 (ECDSA)** as the key type (NOT Ed25519)
4. Select permissions: `wallet:read`, `wallet:create`, `wallet:sign`
5. Download the API key JSON file - it contains:
   - `name`: Your API key ID (e.g., `165e6f4e-50f6-4e3e-922b-ad2846fc1140`)
   - `privateKey`: Your API private key in PEM format

### 3. Verify Private Key Format

Your private key MUST be in PEM format and look like this:

```
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEICOpQ2jzABC123...multiple lines of base64...XYZ789
asdfASDF1234+/=
-----END EC PRIVATE KEY-----
```

**Common Mistake:** The key you get from CDP might be a simple base64 string like `HUwVyxs1zUXWF9eg...`. This is NOT the correct format. You need the full PEM-formatted key with BEGIN/END markers.

### 4. Add Environment Variables

**For v0 (current environment):**
Add in the **Vars** section of the in-chat sidebar:

```
CDP_API_KEY_NAME=165e6f4e-50f6-4e3e-922b-ad2846fc1140
CDP_PRIVATE_KEY=-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEI...\n-----END EC PRIVATE KEY-----
CDP_NETWORK_ID=base-sepolia
```

**For local development (`.env.local`):**

```bash
CDP_API_KEY_NAME=165e6f4e-50f6-4e3e-922b-ad2846fc1140
CDP_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\nYour private key here\n-----END EC PRIVATE KEY-----"
CDP_NETWORK_ID=base-sepolia
```

**Important:** 
- Use `\n` (backslash-n) for line breaks when storing as a single-line string
- Keep your private key secure and never commit it to version control
- The key must be ES256 ECDSA format, NOT Ed25519

### 5. Install Dependencies

The app requires the `jsonwebtoken` package for CDP authentication:

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### 6. How It Works

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
