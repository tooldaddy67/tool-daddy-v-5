# Google Analytics 4 (GA4) Setup Guide

## Step 1: Get Your GA4 Measurement ID

### Option A: If You Already Have a Google Analytics Account

1. **Go to Google Analytics**: https://analytics.google.com
2. **Sign in** with your Google account
3. **Select or Create a Property**:
   - If you have an existing property for Tool Daddy, select it
   - If not, create a new one:
     - Click **Admin** (gear icon in bottom left)
     - Click **Create Property**
     - Property name: `Tool Daddy`
     - Time zone: Select your timezone
     - Currency: Select your currency
4. **Get Your Measurement ID**:
   - Go to **Admin** → **Data Streams**
   - Click on your web data stream (or create one if you don't have it)
   - Add your website URL: `https://tool-daddy.com` and `http://localhost:3000`
   - Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### Option B: If You Don't Have Google Analytics Yet

1. **Go to**: https://analytics.google.com
2. **Sign in** with your Google account
3. **Click "Start measuring"**
4. **Create an Account**:
   - Account name: `Tool Daddy`
   - Check the data sharing settings (optional)
   - Click **Next**
5. **Create a Property**:
   - Property name: `Tool Daddy`
   - Time zone: Select yours
   - Currency: Select yours
   - Click **Next**
6. **Business Information** (optional):
   - Industry category: Select appropriate
   - Business size: Select yours
   - Click **Next**
7. **Business Objectives**: 
   - Select relevant goals
   - Click **Create**
   - Accept Terms of Service
8. **Set Up Data Stream**:
   - Choose **Web**
   - Website URL: `https://tool-daddy.com`
   - Stream name: `Tool Daddy Website`
   - Click **Create stream**
9. **Copy Your Measurement ID**:
   - You'll see it at the top right (format: `G-XXXXXXXXXX`)
   - Example: `G-ABC123DEF4`

## Step 2: Add to Your Project

Once you have your Measurement ID (looks like `G-ABC123DEF4`), share it with me and I'll update the `.env.local` file.

## What Does This Enable?

- 📊 **Page View Tracking** - See which pages users visit
- 👥 **User Analytics** - Understand your audience
- 🎯 **Event Tracking** - Track button clicks, tool usage
- 📈 **Real-time Reports** - See live user activity
- 🔍 **Traffic Sources** - Know where users come from

## Testing

After setup, you can verify it's working:
1. Visit your site: `http://localhost:3000`
2. In GA4, go to **Reports** → **Realtime**
3. You should see yourself as an active user within 30 seconds

## Privacy Note

The current implementation includes:
- Anonymous IP tracking (`anonymize_ip: true`)
- Secure cookies (`SameSite=None;Secure`)
- GDPR-friendly configuration

---

**Ready?** Get your Measurement ID and paste it here!
