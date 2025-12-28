# Supabase OAuth Setup Guide

This guide walks you through enabling Google, Apple, and GitHub OAuth providers in your Supabase project.

## Prerequisites

- Access to your Supabase Dashboard
- OAuth credentials from Google, Apple, and GitHub

---

## Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** > **Providers**

---

## Step 2: Enable Google OAuth

### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application**
6. Add Authorized redirect URI:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
7. Copy your **Client ID** and **Client Secret**

### Configure in Supabase

1. In Supabase Dashboard, find **Google** in the providers list
2. Toggle **Enable Google provider**
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

---

## Step 3: Enable Apple OAuth

### Get Apple OAuth Credentials

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create a new **App ID** if needed
4. Enable **Sign in with Apple**
5. Create a **Service ID** for web authentication
6. Configure Return URLs:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
7. Create a **Key** for Sign in with Apple
8. Note your **Services ID**, **Team ID**, and **Key ID**

### Configure in Supabase

1. In Supabase Dashboard, find **Apple** in the providers list
2. Toggle **Enable Apple provider**
3. Enter your **Services ID** (Client ID)
4. Paste your **Secret Key** (.p8 file content)
5. Enter **Team ID** and **Key ID**
6. Click **Save**

---

## Step 4: Enable GitHub OAuth

### Get GitHub OAuth Credentials

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in application details:
   - **Application name**: Your app name
   - **Homepage URL**: Your app URL
   - **Authorization callback URL**:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy your **Client ID**
6. Generate a new **Client Secret** and copy it

### Configure in Supabase

1. In Supabase Dashboard, find **GitHub** in the providers list
2. Toggle **Enable GitHub provider**
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

---

## Step 5: Test OAuth Login

1. Open your app
2. Click on any social login button (Google, Apple, or GitHub)
3. You should be redirected to the OAuth provider
4. After successful authentication, you'll be redirected back to your app
5. A Coinbase wallet will be automatically created for you

---

## Quick Setup (For Testing)

If you just want to test quickly, you can enable providers without custom credentials:

1. In Supabase Dashboard > Authentication > Providers
2. Enable any provider
3. Use Supabase's default OAuth credentials (for development only)
4. For production, you MUST use your own credentials

---

## Troubleshooting

### Error: "provider is not enabled"
- Make sure the provider is toggled ON in Supabase Dashboard
- Check that you've saved the configuration

### OAuth redirect not working
- Verify the redirect URI matches exactly in both the OAuth provider and Supabase
- Check for typos in your Project Reference ID

### "Invalid credentials" error
- Double-check Client ID and Client Secret are correct
- Ensure no extra spaces when copying credentials
- Try regenerating the client secret

---

## Security Notes

- Never commit OAuth credentials to Git
- Use environment variables for sensitive data
- For production, always use your own OAuth credentials
- Regularly rotate your OAuth secrets
- Monitor OAuth usage in your provider dashboards

---

## Environment Variables

After OAuth is configured, your app will use these Supabase environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

These are already configured in your v0 project.
