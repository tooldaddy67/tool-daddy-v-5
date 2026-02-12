# OTP Email Setup Guide

## Issue Fixed
The "Unable to detect a Project Id" error was caused by missing SMTP (email) configuration in your `.env.local` file. I've now added the required configuration, but you need to set up Gmail credentials.

## Quick Setup Steps

### 1. Enable Gmail SMTP
To send OTP emails, you need to configure Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" and follow the setup

2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device and name it "Tool Daddy"
   - Click "Generate"
   - **Copy the 16-character password** (you won't see it again!)

### 2. Update Your .env.local File

Open `c:\Users\yunis\Downloads\Tool_Dady-main\Tool_Dady-main\.env.local` and update these lines:

```bash
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=your-16-char-app-password-here
SMTP_FROM="Tool Daddy" <your-actual-email@gmail.com>
```

**Example:**
```bash
SMTP_USER=johndoe@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM="Tool Daddy" <johndoe@gmail.com>
```

### 3. Restart Your Development Server

After updating the `.env.local` file:

1. Stop the current dev server (Ctrl+C in terminal)
2. Restart it: `npm run dev`
3. Try sending an OTP again - it should work now!

## Alternative: Use a Different Email Service

If you don't want to use Gmail, you can use other SMTP providers:

### SendGrid (Recommended for Production)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM="Tool Daddy" <noreply@yourdomain.com>
```

### Outlook/Office 365
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM="Tool Daddy" <your-email@outlook.com>
```

## Troubleshooting

### "Invalid login" error
- Make sure you're using an **App Password**, not your regular Gmail password
- Double-check that 2FA is enabled on your Gmail account

### "Connection timeout" error
- Check if your firewall/antivirus is blocking port 587
- Try using port 465 with `SMTP_SECURE=true`

### Still getting "Project Id" error
- Make sure you've restarted the dev server after updating `.env.local`
- Check that there are no spaces or quotes issues in the SMTP credentials

## Security Note
⚠️ **Never commit `.env.local` to Git!** It's already in `.gitignore`, but always double-check before pushing code.

## What Changed
I've updated:
1. ✅ `.env.local` - Added SMTP configuration (you need to fill in real credentials)
2. ✅ `.env.example` - Added documentation for future setup
3. ✅ The password generator - Fixed to only save history/send notifications on button clicks

Let me know if you need help with any of these steps!
