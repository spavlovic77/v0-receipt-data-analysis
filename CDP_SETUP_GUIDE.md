# Coinbase CDP Wallet Setup Guide

This guide will help you set up Coinbase Developer Platform (CDP) wallets for your application.

## Overview

This implementation creates a custodial wallet for each logged-in user using the `@coinbase/cdp-sdk`. Wallets are automatically created on user login and stored in your Supabase database.

## Required Environment Variables

You need to create three environment variables in the CDP Portal:

### 1. CDP_API_KEY_ID
The API Key ID from your CDP API credentials.

### 2. CDP_API_KEY_SECRET  
The API Key Secret (privateKey) from your CDP API credentials.

### 3. CDP_WALLET_SECRET
A separate wallet secret for managing wallet operations.

## Step-by-Step Setup

### Step 1: Create CDP Project

1. Go to https://portal.cdp.coinbase.com/
2. Sign in or create an account
3. Create a new project or select existing project

### Step 2: Generate API Key

1. Navigate to **Settings** → **API Keys**
2. Click **Create API Key**
3. Select **Server-to-Server**
4. Download the JSON file which contains:
   ```json
   {
     "id": "your-api-key-id",
     "privateKey": "your-api-key-secret"
   }
   ```

### Step 3: Generate Wallet Secret

1. Navigate to **Settings** → **Wallet Secrets**
2. Click **Create Wallet Secret**
3. Copy the generated secret (you won't be able to see it again)

### Step 4: Add Environment Variables

Add these three variables to your project:

```
CDP_API_KEY_ID=your-api-key-id
CDP_API_KEY_SECRET=your-api-key-secret
CDP_WALLET_SECRET=your-wallet-secret
```

**In v0:** Add them via the **Vars** section in the left sidebar.

## How It Works

1. **User Authentication**: When a user logs in
2. **Wallet Check**: System checks if wallet exists in database
3. **Wallet Creation**: If no wallet exists, creates new CDP EVM account
4. **Database Storage**: Saves wallet address and account ID to Supabase
5. **Future Use**: Wallet can be used to sign messages, mint tokens, etc.

## Testing

After setting up the environment variables:

1. Log in as a user
2. Check the console logs for wallet creation messages
3. Verify wallet appears in the `wallets` table in Supabase
4. Each user should have one wallet with a unique blockchain address

## Wallet Features

- **Network**: Base Sepolia (testnet)
- **Address**: Standard Ethereum address format (0x...)
- **Signing**: Can sign messages for receipt verification
- **Tokens**: Ready for minting tokens based on receipt values
- **Custody**: Server-side custodial wallet (user doesn't manage keys)

## Security Notes

- Wallets are custodial (you manage the keys via CDP)
- Each user has one wallet tied to their user_id
- Wallet operations require authentication
- Row Level Security (RLS) protects wallet data in Supabase

## Next Steps

After wallets are created, you can:
- Sign receipt data with user's wallet
- Mint tokens to user's wallet based on receipt values
- Transfer tokens between wallets
- Query wallet balances and transaction history

## Troubleshooting

### 401 Authentication Error
- Verify all three environment variables are set correctly
- Check that API key is still active in CDP Portal
- Ensure wallet secret matches the one in CDP Portal

### Wallet Creation Fails
- Check CDP Portal dashboard for API usage limits
- Verify network_id is supported (base-sepolia)
- Review console logs for specific error messages

## Support

For CDP-specific issues, visit:
- Documentation: https://docs.cdp.coinbase.com/
- Portal: https://portal.cdp.coinbase.com/
- Support: https://support.coinbase.com/
