# Social Login Setup Guide

This app supports Google, Apple, and GitHub social login via Supabase Auth.

## Setup Steps

### 1. Configure Redirect URLs in Supabase

Go to your Supabase Dashboard → Authentication → URL Configuration:

**Site URL**: `https://your-domain.com`
**Redirect URLs**: Add these URLs:
- `https://your-domain.com/auth/callback`
- `http://localhost:3000/auth/callback` (for development)

### 2. Enable Social Providers in Supabase

Go to Authentication → Providers and enable:

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://[your-supabase-project].supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase

#### Apple OAuth
1. Go to [Apple Developer](https://developer.apple.com/)
2. Create a Service ID
3. Configure Sign in with Apple
4. Add redirect URI: `https://[your-supabase-project].supabase.co/auth/v1/callback`
5. Copy Service ID and Key to Supabase

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Set Authorization callback URL: `https://[your-supabase-project].supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

### 3. Test the Integration

1. Try logging in with each provider
2. Verify wallet is automatically created
3. Check that users are redirected properly

## How It Works

1. User clicks social login button
2. Redirected to OAuth provider for authentication
3. After approval, redirected to `/auth/callback`
4. Callback route exchanges code for session
5. Wallet is automatically created via `ensureUserWallet()`
6. User redirected to home page with active session

## Troubleshooting

**"Invalid redirect URL"**: Make sure redirect URLs are configured in both provider and Supabase
**"Wallet not created"**: Check console logs in `/auth/callback/route.ts`
**"OAuth error"**: Verify Client ID/Secret are correct in Supabase dashboard
