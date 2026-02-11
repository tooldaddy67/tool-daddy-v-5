# API Key & Security Guidelines

## Overview
This project uses API keys for AI services (Google Gemini). **Never commit real API keys to the repository.**

## Safe Key Loading

### Environment Variables (Recommended)
The app loads keys in this priority order:
1. **Environment variables** (production safe):
   - `GEMINI_API_KEY` - Primary Gemini/Google AI key
   - `GOOGLE_API_KEY` - Alternative (fallback)
2. **Local file** (development fallback): `src/ai/api-keys.json`

### Local Development Setup

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Add your real key to `.env.local`**:
   ```
   GEMINI_API_KEY=your_real_key_here
   ```

3. **Or use the file method** (less secure):
   - Copy `src/ai/api-keys.example.json` → `src/ai/api-keys.json`
   - Edit `src/ai/api-keys.json` with your real key
   - (This file is gitignored and will never be committed)

## Security Checklist

- ✅ Never commit `.env.local` (gitignored)
- ✅ Never commit `src/ai/api-keys.json` (gitignored)
- ✅ Use `.env.example` to document required keys only
- ✅ Use environment variables in production (CI/CD, cloud platforms)
- ✅ Rotate keys if accidentally exposed to anyone untrusted
- ✅ Review `.gitignore` regularly to ensure sensitive files are excluded

## If Keys Were Exposed

1. **Immediately rotate the key** at the provider (e.g., https://aistudio.google.com/app/apikey)
2. **Scan git history** for accidentally committed keys:
   ```bash
   git log --all -p -G"AIza|sk-|apiKey" | head -200
   ```
3. **Clean history if needed** (requires force-push):
   ```bash
   # Install: pip install git-filter-repo
   git filter-repo --invert-paths --paths src/ai/api-keys.json
   git push --force-with-lease
   ```

## Checking Current Status

View which keys are loaded:
```bash
# Dev mode - check logs when app starts
npm run dev

# Production - ensure GEMINI_API_KEY env var is set
echo $GEMINI_API_KEY
```

## References
- [Genkit Docs](https://firebase.google.com/docs/genkit)
- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Environment Variables Best Practices](https://12factor.net/config)
