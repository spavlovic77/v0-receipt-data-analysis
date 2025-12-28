# Coinbase Developer Platform (CDP) Wallet Integration Setup

This application uses Coinbase CDP SDK to create and manage custodial wallets for users automatically.

## What is CDP?

Coinbase Developer Platform (CDP) Wallets allow you to programmatically create and manage wallets without handling private keys directly. The wallets are secured using Trusted Execution Environments (TEEs), ensuring that private keys are never exposed.

## Setup Instructions

### 1. Create a CDP Account

1. Go to [Coinbase Developer Portal](https://portal.cdp.coinbase.com/)
2. Sign up or log in
3. Create a new project

### 2. Generate API Credentials

#### A. Create API Key

1. In your CDP project dashboard, go to **API Keys**
2. Click **Create API Key**
3. Download the API key JSON file - it will look like this:
   ```json
   {
     "id": "165e6f4e-50f6-4e3e-922b-ad2846fc1140",
     "privateKey": "HUwVyxs1zUXWF9egcwNfTZ6YMEtOE2FTZ1W/jeQ+L63AFQBu9/dbofGfmS4Ov7Tw41aGJznHSIxtgsjor5USag=="
   }
   ```

#### B. Create Wallet Secret

1. In the CDP Portal, go to **Wallet Secrets**
2. Click **Create Wallet Secret**
3. Copy the generated secret (you'll need this for CDP_WALLET_SECRET)
4. **IMPORTANT:** Save this secret securely - you cannot retrieve it again!

### 3. Add Environment Variables

**For v0 (current environment):**
Add in the **Vars** section of the in-chat sidebar:

```
CDP_API_KEY_ID=165e6f4e-50f6-4e3e-922b-ad2846fc1140
CDP_API_KEY_SECRET=HUwVyxs1zUXWF9egcwNfTZ6YMEtOE2FTZ1W/jeQ+L63AFQBu9/dbofGfmS4Ov7Tw41aGJznHSIxtgsjor5USag==
CDP_WALLET_SECRET=your-wallet-secret-from-cdp-portal
CDP_NETWORK_ID=base-sepolia
```

Use the exact values:
- `CDP_API_KEY_ID` = the `id` field from API key JSON
- `CDP_API_KEY_SECRET` = the `privateKey` field from API key JSON (base64 string as-is)
- `CDP_WALLET_SECRET` = the wallet secret you created in step 2B
- `CDP_NETWORK_ID` = `base-sepolia` for testnet

**For local development (`.env.local`):**

```bash
CDP_API_KEY_ID=165e6f4e-50f6-4e3e-922b-ad2846fc1140
CDP_API_KEY_SECRET=HUwVyxs1zUXWF9egcwNfTZ6YMEtOE2FTZ1W/jeQ+L63AFQBu9/dbofGfmS4Ov7Tw41aGJznHSIxtgsjor5USag==
CDP_WALLET_SECRET=your-wallet-secret-from-cdp-portal
CDP_NETWORK_ID=base-sepolia
```

**Important:** 
- All three secrets (API Key ID, API Key Secret, and Wallet Secret) are required
- Keep all secrets secure and never commit them to version control
- The API Key Secret is base64-encoded - use it exactly as provided
- The Wallet Secret must be generated from the CDP Portal - it cannot be auto-generated

### 4. Install Dependencies

The app uses the official Coinbase CDP SDK:

```bash
npm install @coinbase/cdp-sdk
```

### 5. How It Works

#### Automatic Wallet Creation

When a user signs up or logs in:
1. The system checks if the user has a CDP wallet
2. If not, it automatically creates an EVM account using `cdp.evm.createAccount()`
3. The account is stored in the `wallets` table with:
   - `wallet_id`: Account address (used as identifier)
   - `network_id`: Blockchain network (default: base-sepolia)
   - `default_address`: The account's public address

#### Receipt Signing

When a user scans a receipt:
1. The system retrieves the user's CDP account
2. Creates a message: `receiptId:name:surname:birthNumber:dic`
3. Signs the message using `account.signMessage()`
4. Stores the signature in the `scanned_receipts` table

#### Verification

External systems can verify receipt authenticity:
1. Hash the receipt data locally
2. Send the hash to `/api/verify-receipt`
3. The API verifies the signature matches the expected account address

## Network Configuration

By default, accounts are created on **Base Sepolia** (testnet). To use mainnet:

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
- All signing happens server-side via CDP SDK
- Account addresses are tied to user accounts in the database
- The SDK handles all authentication and encryption automatically

## Troubleshooting

### "CDP API credentials not configured"
- Check that `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, and `CDP_WALLET_SECRET` are set in the Vars section
- Verify you copied the exact values from the CDP JSON file and Wallet Secret
- Make sure you're using the `id` field for CDP_API_KEY_ID, not "API Key Name"

### "Database error creating new user"
- Ensure the `wallets` table exists (run migration 004)

### "Failed to sign message with wallet"
- Verify CDP API key has wallet permissions
- Check that the account address is correct
- Ensure you're not hitting rate limits

### SDK Import Errors
- Make sure `@coinbase/cdp-sdk` is installed (not `@coinbase/coinbase-sdk`)
- Check that your Node.js version is compatible (Node 18+)

### 401 Authentication Errors
- Verify the `CDP_API_KEY_SECRET` value is exactly as provided in the CDP JSON (base64 string)
- Do not modify or convert the private key - use it as-is
- Ensure your CDP API key is active and not expired

## Cost Considerations

CDP wallet creation and signing operations may incur costs depending on:
- Number of accounts created
- Number of signing operations
- Network fees (for on-chain transactions)

Check [CDP Pricing](https://www.coinbase.com/cloud/pricing) for current rates.

## Development vs Production

**Development (Testnet):**
- Use `base-sepolia` or `ethereum-sepolia`
- Free to create accounts and sign messages
- No real funds involved

**Production (Mainnet):**
- Switch to `base-mainnet` or `ethereum-mainnet`
- Real transaction costs apply
- Require proper security audit before launch
