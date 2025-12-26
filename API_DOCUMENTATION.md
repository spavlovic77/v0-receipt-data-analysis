# Receipt Verification System - Developer Guide

## Overview

This document serves as a comprehensive guide for developing external applications that integrate with our receipt verification system. The system uses cryptographic signatures to verify the authenticity of scanned receipts without exposing personal user data.

## System Architecture

### Core Concept

When a user scans a receipt in our application:
1. The system collects: `receiptId`, user's `name`, `surname`, `birthNumber` (Slovak birth number), and `dic` (tax ID from receipt)
2. Creates a message: `receiptId:name:surname:birthNumber:dic`
3. Computes a Keccak256 hash of this message
4. Signs the hash using the user's Ethereum private key (secp256k1 curve)
5. Stores the signature and user's Ethereum address in the database

External systems can verify receipt authenticity by:
1. Computing the same message hash locally (using data they already have)
2. Sending only the `receiptId` and `messageHash` to our API
3. Our API verifies the signature matches without needing to receive personal data

### Security Model

- **Zero-knowledge verification**: Personal data (name, surname, birth number) never leaves the external system
- **Cryptographic proof**: Uses Ethereum's secp256k1 elliptic curve cryptography
- **Privacy-first**: Only hashes are transmitted over the network
- **Tamper-proof**: Any modification to the data results in verification failure

## Building an External Verification Application

### Prerequisites

```json
{
  "dependencies": {
    "ethers": "^6.0.0"
  }
}
```

Install dependencies:
```bash
npm install ethers
```

### Step 1: Understand Your Data Sources

Your external application needs access to:
- **Receipt ID** (`receiptId`): by scanning the QR code where Receipt ID is encoded
- **User Information**: Name, surname, and birth number from your user database
- **Tax ID** (`dic`): From the receipt or your records

Example data structure:
```typescript
interface ReceiptData {
  receiptId: string;      // e.g., "0-ABC123XYZ..."
  userName: string;       // e.g., "Adam"
  userSurname: string;    // e.g., "Smith"
  userBirthNumber: string; // e.g., "7711097383"
  merchantDic: string;    // e.g., "2120726927"
}
```

### Step 2: Implement Hash Generation

Create a function to generate the message hash:

```typescript
import { ethers } from 'ethers';

/**
 * Generates a Keccak256 hash of receipt verification data
 * @param data Receipt data to hash
 * @returns Hex string hash starting with "0x"
 */
function generateReceiptHash(data: ReceiptData): string {
  // Construct message in exact format: receiptId:name:surname:birthNumber:dic
  const message = `${data.receiptId}:${data.userName}:${data.userSurname}:${data.userBirthNumber}:${data.merchantDic}`;
  
  // Compute Keccak256 hash (same as keccak256 in Solidity)
  const messageHash = ethers.id(message);
  
  console.log('Message:', message);
  console.log('Hash:', messageHash);
  
  return messageHash;
}
```

**CRITICAL**: The message format MUST be exactly: `receiptId:name:surname:birthNumber:dic`
- Colon (`:`) separators
- No spaces
- Exact order
- Case-sensitive

### Step 3: Implement API Call

Create a function to verify receipts:

```typescript
interface VerificationResult {
  valid: boolean;
  receiptId?: string;
  ethAddress?: string;
  timestamp?: string;
  error?: string;
}

/**
 * Verifies a receipt against the verification API
 * @param apiUrl Base URL of the verification API
 * @param data Receipt data to verify
 * @returns Verification result
 */
async function verifyReceipt(
  apiUrl: string,
  data: ReceiptData
): Promise<VerificationResult> {
  try {
    // Generate hash locally (personal data never sent)
    const messageHash = generateReceiptHash(data);
    
    // Call API with only receiptId and hash
    const response = await fetch(`${apiUrl}/api/verify-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiptId: data.receiptId,
        messageHash: messageHash,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        valid: false,
        error: errorData.error || `HTTP ${response.status}`,
      };
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}
```

### Step 4: Complete Application Example

Here's a full example application:

```typescript
import { ethers } from 'ethers';

// Configuration
const API_URL = 'https://your-verification-api.com';

// Types
interface ReceiptData {
  receiptId: string;
  userName: string;
  userSurname: string;
  userBirthNumber: string;
  merchantDic: string;
}

interface VerificationResult {
  valid: boolean;
  receiptId?: string;
  ethAddress?: string;
  timestamp?: string;
  error?: string;
}

// Hash generation
function generateReceiptHash(data: ReceiptData): string {
  const message = `${data.receiptId}:${data.userName}:${data.userSurname}:${data.userBirthNumber}:${data.merchantDic}`;
  return ethers.id(message);
}

// API verification
async function verifyReceipt(
  apiUrl: string,
  data: ReceiptData
): Promise<VerificationResult> {
  try {
    const messageHash = generateReceiptHash(data);
    
    const response = await fetch(`${apiUrl}/api/verify-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiptId: data.receiptId,
        messageHash: messageHash,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { valid: false, error: errorData.error || `HTTP ${response.status}` };
    }
    
    return await response.json();
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

// Main application logic
async function main() {
  // Example: Data retrieved from your database and receipt QR code
  const receiptData: ReceiptData = {
    receiptId: '0-ABC123XYZ789',
    userName: 'Adam',
    userSurname: 'Smith',
    userBirthNumber: '7711097383',
    merchantDic: '2120726927',
  };
  
  console.log('Verifying receipt:', receiptData.receiptId);
  
  const result = await verifyReceipt(API_URL, receiptData);
  
  if (result.valid) {
    console.log('✅ Receipt is AUTHENTIC');
    console.log('  - Receipt ID:', result.receiptId);
    console.log('  - Verified by address:', result.ethAddress);
    console.log('  - Scanned at:', result.timestamp);
  } else {
    console.log('❌ Receipt verification FAILED');
    console.log('  - Error:', result.error);
  }
}

// Run
main();
```

## API Reference

### Endpoint

```
POST /api/verify-receipt
```

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "receiptId": "0-ABC123XYZ789",
  "messageHash": "0x1234567890abcdef..."
}
```

**Parameters:**
- `receiptId` (string, required): The unique receipt ID from the eKasa system
- `messageHash` (string, required): Keccak256 hash of `receiptId:name:surname:birthNumber:dic`

### Response Codes

- **200 OK**: Verification completed (check `valid` field)
- **400 Bad Request**: Missing or invalid parameters
- **404 Not Found**: Receipt not found in database
- **500 Internal Server Error**: Server error during verification

### Response Body

**Success (Authentic Receipt):**
```json
{
  "valid": true,
  "receiptId": "0-ABC123XYZ789",
  "ethAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "timestamp": "2025-01-10T12:34:56.789Z"
}
```

**Failure (Invalid Receipt):**
```json
{
  "valid": false,
  "error": "Invalid signature or receipt not found"
}
```

## Common Use Cases

### Use Case 1: Batch Verification

Verify multiple receipts efficiently:

```typescript
async function verifyBatch(receipts: ReceiptData[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  
  // Process in parallel with rate limiting
  const batchSize = 10;
  for (let i = 0; i < receipts.length; i += batchSize) {
    const batch = receipts.slice(i, i + batchSize);
    const promises = batch.map(receipt => verifyReceipt(API_URL, receipt));
    const batchResults = await Promise.all(promises);
    
    batch.forEach((receipt, index) => {
      results.set(receipt.receiptId, batchResults[index].valid);
    });
  }
  
  return results;
}
```

### Use Case 2: Real-time Verification

Verify receipts as users scan QR codes:

```typescript
async function handleQRCodeScan(qrData: string, userId: string) {
  // Parse QR code to get receiptId
  const receiptId = extractReceiptId(qrData);
  
  // Fetch user data from your database
  const user = await getUserFromDatabase(userId);
  
  // Extract merchant DIC from QR or API
  const merchantDic = await getMerchantDic(receiptId);
  
  // Verify
  const result = await verifyReceipt(API_URL, {
    receiptId,
    userName: user.name,
    userSurname: user.surname,
    userBirthNumber: user.birthNumber,
    merchantDic,
  });
  
  // Handle result
  if (result.valid) {
    await markReceiptAsVerified(receiptId);
    showSuccessMessage('Receipt verified!');
  } else {
    showErrorMessage('Invalid receipt');
  }
}
```

### Use Case 3: Audit Trail

Create an audit log of verifications:

```typescript
interface AuditLogEntry {
  receiptId: string;
  verified: boolean;
  verifiedAt: Date;
  ethAddress?: string;
  error?: string;
}

async function verifyWithAudit(data: ReceiptData): Promise<AuditLogEntry> {
  const result = await verifyReceipt(API_URL, data);
  
  const auditEntry: AuditLogEntry = {
    receiptId: data.receiptId,
    verified: result.valid,
    verifiedAt: new Date(),
    ethAddress: result.ethAddress,
    error: result.error,
  };
  
  // Save to your audit database
  await saveToAuditLog(auditEntry);
  
  return auditEntry;
}
```

## Troubleshooting

### Issue: "Invalid signature format"

**Cause**: The messageHash format is incorrect.

**Solution**: Ensure you're using `ethers.id()` which returns Keccak256 hash:
```typescript
const messageHash = ethers.id(message); // Correct
// NOT: ethers.utils.sha256(message) // Wrong
```

### Issue: "Receipt not found"

**Cause**: The receipt hasn't been scanned in the main application yet.

**Solution**: Ensure the receipt exists in the system before verification.

### Issue: Verification returns `valid: false`

**Possible causes:**
1. **Data mismatch**: Name, surname, or birth number don't match exactly
2. **Format error**: Message format is incorrect (check colons, order, spacing)
3. **Case sensitivity**: Names are case-sensitive

**Debug steps:**
```typescript
// Add logging to see the exact message
const message = `${data.receiptId}:${data.userName}:${data.userSurname}:${data.userBirthNumber}:${data.merchantDic}`;
console.log('Attempting verification with message:', message);
console.log('Hash:', ethers.id(message));
```

### Issue: Network errors

**Cause**: API unavailable or network issues.

**Solution**: Implement retry logic with exponential backoff:
```typescript
async function verifyWithRetry(data: ReceiptData, maxRetries = 3): Promise<VerificationResult> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await verifyReceipt(API_URL, data);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Security Best Practices

1. **Never log personal data**: Avoid logging names, surnames, or birth numbers in production
2. **Use HTTPS**: Always use secure connections to the API
3. **Validate input**: Sanitize all user input before processing
4. **Rate limiting**: Implement rate limiting to prevent abuse
5. **Error handling**: Don't expose internal errors to end users
6. **Access control**: Ensure only authorized users can trigger verifications

## Testing

### Test Data

Use this test receipt for development:

```typescript
const testReceipt: ReceiptData = {
  receiptId: '0-TEST123456',
  userName: 'Adam',
  userSurname: 'Smith',
  userBirthNumber: '7711097383',
  merchantDic: '2120726927',
};
```

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';

describe('Receipt Verification', () => {
  it('should generate correct hash', () => {
    const data: ReceiptData = {
      receiptId: '0-TEST',
      userName: 'Adam',
      userSurname: 'Smith',
      userBirthNumber: '7711097383',
      merchantDic: '2120726927',
    };
    
    const hash = generateReceiptHash(data);
    expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });
  
  it('should handle verification response', async () => {
    const result = await verifyReceipt(API_URL, testReceipt);
    expect(result).toHaveProperty('valid');
    if (result.valid) {
      expect(result).toHaveProperty('ethAddress');
      expect(result).toHaveProperty('timestamp');
    }
  });
});
```

## Support

For integration support or questions:
- Review this documentation carefully
- Check the troubleshooting section
- Ensure message format is exact: `receiptId:name:surname:birthNumber:dic`
- Verify you're using `ethers.id()` for Keccak256 hashing

## Appendix: Cryptographic Details

### Signing Process (In Main Application)

```typescript
// 1. Create message
const message = `${receiptId}:${name}:${surname}:${birthNumber}:${dic}`;

// 2. Hash with Keccak256
const messageHash = ethers.id(message);

// 3. Sign with private key
const signature = await wallet.signMessage(ethers.getBytes(messageHash));

// 4. Store signature and wallet address
await database.insert({
  receiptId,
  signature,
  ethAddress: wallet.address,
});
```

### Verification Process (In API)

```typescript
// 1. Receive receiptId and messageHash
// 2. Fetch stored signature and ethAddress from database
// 3. Recover signer address from signature
const recoveredAddress = ethers.verifyMessage(
  ethers.getBytes(messageHash),
  signature
);

// 4. Compare addresses
const valid = recoveredAddress.toLowerCase() === storedAddress.toLowerCase();
```

This ensures that:
- Only the holder of the private key could have created the signature
- The data hasn't been tampered with (hash would change)
- The verification doesn't require the private key
