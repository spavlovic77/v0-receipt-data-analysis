# How to Get the Correct CDP API Key

## The Problem
Your current key is in the wrong format. You have:
```
HUwVyxs1zUXWF9egcwNfTZ6YMEtOE2FTZ1W/jeQ+L63AFQBu9/dbofGfmS4Ov7Tw41aGJznHSIxtgsjor5USag==
```

This needs to be a **PEM-formatted ES256 ECDSA private key**.

## What the Correct Key Looks Like

The private key should look like this (multi-line PEM format):

```
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIBKnC9/zT8cAKd7qSaZH1mJW8GnPvqJQyJDPx5eMH3oQoAoGCCqGSM49
AwEHoUQDQgAEW6K5T1pQZgVZ+nYqAqLq8YmQxqzN6DqQ+PzW9xJ3MaKpQqJxKzFz
XnYm3QzLpQxJ5MqWzZ+nQzKpQxJ5MqWzZw==
-----END EC PRIVATE KEY-----
```

**Important:** It MUST start with `-----BEGIN EC PRIVATE KEY-----` and end with `-----END EC PRIVATE KEY-----`

## Steps to Get the Correct Key

### Option 1: Create New API Key (Recommended)

1. Go to https://portal.cdp.coinbase.com/access/api
2. Click **"Create API Key"**
3. **IMPORTANT:** When creating the key, make sure to:
   - Select **"ES256 (ECDSA)"** as the signing algorithm (NOT Ed25519)
   - This is usually a dropdown or radio button selection
4. After creation, you'll see two things:
   - **API Key Name/ID** (like: `165e6f4e-50f6-4e3e-922b-ad2846fc1140`)
   - **Private Key** - This will be shown as a downloadable file or copyable text in PEM format
5. Copy the ENTIRE private key including the `-----BEGIN EC PRIVATE KEY-----` and `-----END EC PRIVATE KEY-----` lines

### Option 2: Check Downloaded Key File

If you downloaded a key file (like `cdp_api_key.json`), it might contain:

```json
{
  "name": "165e6f4e-50f6-4e3e-922b-ad2846fc1140",
  "privateKey": "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEE...\n-----END EC PRIVATE KEY-----"
}
```

Use the `privateKey` value (with `\n` converted to actual newlines).

## How to Add to Environment Variables

When adding to the Vars section in v0:

1. Variable name: `CDP_PRIVATE_KEY`
2. Variable value: **Copy the entire PEM key as-is, including newlines**

Example:
```
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIBKnC9/zT8cAKd7qSaZH1mJW8GnPvqJQyJDPx5eMH3oQoAoGCCqGSM49
AwEHoUQDQgAEW6K5T1pQZgVZ+nYqAqLq8YmQxqzN6DqQ+PzW9xJ3MaKpQqJxKzFz
XnYm3QzLpQxJ5MqWzZ+nQzKpQxJ5MqWzZw==
-----END EC PRIVATE KEY-----
```

**Note:** If you're adding it via environment variable in Vercel/v0 UI, you can paste it as a multi-line string directly.

## Troubleshooting

### If you only have the base64 string
The base64 string you provided (`HUwVyxs1zUXWF9egcwNfTZ6YMEtOE2FTZ1W/jeQ+L63AFQBu9/dbofGfmS4Ov7Tw41aGJznHSIxtgsjor5USag==`) is likely NOT usable. You need to create a new API key with ES256 algorithm.

### If the key doesn't work
- Make sure it's ES256 (ECDSA) algorithm, not Ed25519
- Ensure all newlines are preserved
- Include the full BEGIN and END markers
- Don't add any extra quotes or escaping

## Next Steps

1. Create a new API key with ES256 algorithm from CDP portal
2. Copy the entire PEM-formatted private key
3. Update the `CDP_PRIVATE_KEY` variable in the Vars section
4. Test by logging in and scanning a receipt
