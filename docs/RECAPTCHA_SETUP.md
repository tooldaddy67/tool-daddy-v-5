# reCAPTCHA Setup Guide

## Step 1: Get reCAPTCHA Keys from Google

1. **Visit Google reCAPTCHA Admin Console**:
   - Go to: https://www.google.com/recaptcha/admin/create
   - Sign in with your Google account

2. **Create a New Site**:
   - **Label**: `Tool Daddy` (or any name you prefer)
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add:
     - `localhost` (for local development)
     - `tool-daddy.com` (your production domain)
     - Any other domains you'll use
   - **Accept the Terms of Service**
   - Click **Submit**

3. **Copy Your Keys**:
   After creation, you'll see two keys:
   - **Site Key** (starts with `6L...`) - This is PUBLIC (goes in NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
   - **Secret Key** (starts with `6L...`) - This is SECRET (goes in RECAPTCHA_SECRET_KEY)

## Step 2: Add Keys to Your Project

Once you have the keys, provide them to me and I'll update the `.env.local` file.

## What is reCAPTCHA v3?
- Invisible bot protection (no "I'm not a robot" checkbox)
- Runs in the background and scores user interactions
- Protects your AI features from abuse and DDoS attacks
- Required for:
  - AI Text Humanizer
  - AI Playlist Maker
  - Any rate-limited features

## Next Steps
After you get the keys:
1. I'll update `.env.local` with your keys
2. Restart the dev server
3. Test the AI features to verify it's working
