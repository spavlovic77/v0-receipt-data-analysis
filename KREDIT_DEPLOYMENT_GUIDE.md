# KREDIT Token Deployment Guide

## Overview

The KREDIT token system allows users to earn ERC-20 tokens for each receipt they scan. The token amount equals the receipt total (1 EUR = 1 KREDIT token with 18 decimals).

## Prerequisites

1. Node.js and npm installed
2. A wallet with ETH on Base Sepolia (for testnet) or Base (for mainnet)
3. Environment variables configured

## Required Environment Variables

Add these to your `.env` file or Vercel environment variables:

```env
# Contract Deployment
DEPLOYER_PRIVATE_KEY=<your-deployer-wallet-private-key>
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=<your-basescan-api-key>

# App Signing (generate a new wallet for this)
KREDIT_SIGNER_PRIVATE_KEY=<private-key-for-signing-receipts>
KREDIT_AUTHORIZED_SIGNER=<public-address-of-signer-wallet>

# After Deployment
KREDIT_CONTRACT_ADDRESS=<deployed-contract-address>
```

## Step 1: Generate Signer Wallet

The signer wallet is used by your app to sign receipts. Generate a new wallet:

```bash
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Private Key:', wallet.privateKey); console.log('Address:', wallet.address);"
```

Set these values:
- `KREDIT_SIGNER_PRIVATE_KEY` = the private key
- `KREDIT_AUTHORIZED_SIGNER` = the address

**⚠️ IMPORTANT**: Keep the signer private key secure! Never commit it to git.

## Step 2: Install Dependencies

```bash
npm install hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts
```

## Step 3: Compile Contract

```bash
npx hardhat compile
```

## Step 4: Deploy to Base Sepolia (Testnet)

```bash
npx hardhat run scripts/deploy-kredit.ts --network baseSepolia
```

Save the deployed contract address to `KREDIT_CONTRACT_ADDRESS`.

## Step 5: Get Testnet Tokens

Get free testnet ETH for Base Sepolia:
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- https://faucet.quicknode.com/base/sepolia

## Step 6: Verify Contract (Optional)

Get a Basescan API key from https://basescan.org/myapikey

The deployment script will automatically verify the contract.

## Step 7: Deploy to Production (Base Mainnet)

When ready for production:

```bash
npx hardhat run scripts/deploy-kredit.ts --network base
```

## How It Works

### 1. Receipt Scanning Flow

1. User scans receipt QR code
2. Receipt data is saved to database
3. App generates signature for minting:
   ```
   Message: {receiptId}:{name}:{surname}:{birthNumber}:{dic}:{amount}
   Signed by: KREDIT_SIGNER_PRIVATE_KEY
   ```

### 2. Token Minting

Users can mint KREDIT tokens by calling the smart contract with:
- Receipt details (ID, user data, merchant DIC)
- Token amount (receipt total in wei)
- App's signature

The contract verifies:
- Signature is from authorized signer ✓
- Receipt hasn't been minted before ✓

If valid, tokens are minted to the user's wallet.

### 3. Security

- **One mint per receipt**: `mintedReceipts` mapping prevents duplicate mints
- **Authorized signer only**: Only signatures from `authorizedSigner` address are accepted
- **On-chain verification**: All verification happens on-chain, trustlessly

## Testing

Test the contract locally:

```bash
npx hardhat test
```

## Contract Functions

### Public Functions

- `mintFromReceipt()` - Mint tokens for a scanned receipt
- `isReceiptMinted()` - Check if receipt was already minted
- `balanceOf()` - Check user's KREDIT balance
- `authorizedSigner()` - View authorized signer address

### Owner Functions

- `updateAuthorizedSigner()` - Update the authorized signer (owner only)

## Troubleshooting

### "Invalid signature" Error
- Verify `KREDIT_AUTHORIZED_SIGNER` matches the public address of `KREDIT_SIGNER_PRIVATE_KEY`
- Check message format is exact: `{receiptId}:{name}:{surname}:{birthNumber}:{dic}:{amount}`

### "Receipt already minted" Error
- Each receipt can only be minted once
- Check with `isReceiptMinted(receiptId)`

### Gas Estimation Failed
- Ensure wallet has enough ETH for gas fees
- Check all parameters are correctly formatted

## Summary of Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DEPLOYER_PRIVATE_KEY` | Private key for deploying contract | `0x123...` |
| `KREDIT_SIGNER_PRIVATE_KEY` | Private key for signing receipts | `0xabc...` |
| `KREDIT_AUTHORIZED_SIGNER` | Public address of signer | `0xdef...` |
| `KREDIT_CONTRACT_ADDRESS` | Deployed contract address | `0x789...` |
| `BASE_SEPOLIA_RPC_URL` | RPC endpoint for Base Sepolia | `https://sepolia.base.org` |
| `BASESCAN_API_KEY` | API key for contract verification | `ABC123...` |

## Next Steps

After deployment:
1. Add `KREDIT_CONTRACT_ADDRESS` to environment variables
2. Test minting with a test receipt
3. Update UI to show KREDIT balance
4. Add minting button to receipt details
