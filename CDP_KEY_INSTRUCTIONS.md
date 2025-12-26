# How to Get Your Coinbase CDP Private Key in Correct Format

## The Issue

You need a **PEM-formatted ES256 ECDSA private key** from Coinbase Developer Platform, not a base64 string.

## Steps to Get the Correct Key

1. **Go to Coinbase Developer Portal**
   - Visit: https://portal.cdp.coinbase.com
   - Sign in to your account

2. **Create a New API Key (if needed)**
   - Click "API Keys" in the navigation
   - Click "Create API Key"
   - **CRITICAL**: When asked for key type, select **"ES256 (ECDSA)"**
   - Download the key file OR copy the private key

3. **Verify Key Format**
   
   Your private key should look exactly like this:
   ```
   -----BEGIN EC PRIVATE KEY-----
   MHcCAQEEICOpQ2jzABC123...multiple lines of base64...XYZ789
   asdfASDF1234+/=
   -----END EC PRIVATE KEY-----
   ```

4. **Format for Environment Variable**

   When adding to Vercel/v0 environment variables, format it as a single line with escaped newlines:
   
   ```
   -----BEGIN EC PRIVATE KEY-----\nMHcCAQEEICOpQ2...\n-----END EC PRIVATE KEY-----
   ```
   
   Replace actual line breaks with `\n` (backslash-n)

## What You Currently Have

The key you provided:
```
HUwVyxs1zUXWF9egcwNfTZ6YMEtOE2FTZ1W/jeQ+L63AFQBu9/dbofGfmS4Ov7Tw41aGJznHSIxtgsjor5USag==
```

This appears to be:
- Either just the secret/password (not the private key)
- Or an Ed25519 key (which doesn't work with CDP API)
- Or improperly encoded

## Next Steps

1. Return to Coinbase Developer Portal
2. Create a NEW API key
3. **Select ES256 (ECDSA)** as the key type
4. Copy the FULL private key including the BEGIN/END lines
5. Update the `CDP_PRIVATE_KEY` environment variable with the correctly formatted key
