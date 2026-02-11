# DDoS Mitigation & Protection Strategy

## Current Protections

### 1. Infrastructure Level (Google Firebase)
- ✅ **Built-in DDoS Protection**: Google Cloud provides network-level DDoS protection
- ✅ **Auto-scaling**: Firebase App Hosting auto-scales to handle traffic spikes
- ✅ **Global CDN**: Distributed edge locations reduce latency and absorb traffic

### 2. Application Level

#### Rate Limiting
- **Server-side rate limiter** (`src/lib/rate-limiter.ts`): 30 requests per minute per IP by default
- **Humanizer tool**: 4 requests per minute (client + backend)
- **reCAPTCHA verification**: 30 requests per minute per IP (prevents endpoint abuse)

#### Bot Protection
- **reCAPTCHA v3** (Invisible): Scores user interactions 0.0 (bot) to 1.0 (human)
- **Score threshold**: 0.5+ to allow requests (adjustable)
- **Server-side verification**: Token validation with Google servers

#### Auto-scaling
- **maxInstances**: 10 (Firebase App Hosting automatically scales)
- Handles traffic spikes without service degradation

---

## Protection by Attack Type

### HTTP Floods / Brute Force Attacks
**Status**: ✅ Protected
- Rate limiting blocks IPs exceeding 30 req/min
- reCAPTCHA prevents bot automation
- Auto-scaling distributes load

### Application-Layer Attacks
**Status**: ⚠️ Partially Protected
- Rate limiting catches simple floods
- reCAPTCHA catches bots
- **Recommendation**: Monitor logs for suspicious patterns

### Volumetric Attacks (GB/s floods)
**Status**: ✅ Protected
- Google's infrastructure handles this layer
- Anycast routing + traffic scrubbing
- Transparent to your application

### Slowloris / Slow Attacks
**Status**: ⚠️ Partially Protected
- Firebase's connection timeouts help
- **Recommendation**: Monitor for connections with zero requests

---

## Configuration Guide

### Enable reCAPTCHA on Sensitive Endpoints

1. **Get API Keys** from [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
   - Site Key: NEXT_PUBLIC_RECAPTCHA_SITE_KEY (public, exposed in browser)
   - Secret Key: RECAPTCHA_SECRET_KEY (secret, server-side only)

2. **Add to `.env.local`**:
   ```
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
   RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
   ```

3. **Add to Client Components** (AI tools, forms):
   ```typescript
   import { useCallback } from 'react';
   
   export function MyComponent() {
     const handleCaptcha = useCallback(async (token: string) => {
       const res = await fetch('/api/verify-recaptcha', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ token }),
       });
       const data = await res.json();
       if (data.success) {
         // Proceed with request
       } else {
         // Show error: "Please verify you're human"
       }
     }, []);
   
     return (
       <button onClick={async () => {
         const token = await window.grecaptcha?.execute('SITE_KEY');
         if (token) await handleCaptcha(token);
       }}>
         Submit
       </button>
     );
   }
   ```

### Use Rate Limiting in API Routes

```typescript
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  const ip = getClientIp();
  
  // Check rate limit: 10 requests per minute
  if (!checkRateLimit(ip, 10, 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  // Your API logic here
  return NextResponse.json({ success: true });
}
```

### Adjust Rate Limits

Edit `src/lib/rate-limiter.ts` and update the default parameters:
- **Default**: 30 requests per minute per IP
- **Strict**: 5 requests per minute (sensitive endpoints)
- **Relaxed**: 100 requests per minute (public endpoints)

---

## Monitoring & Alerts

### What to Monitor

1. **Request rate by IP**: Detect unusually high rates
2. **Failed reCAPTCHA verifications**: Sign of bot activity
3. **5xx errors**: Backend resource exhaustion
4. **Response times**: Slowdowns indicate overload
5. **Firebase quota usage**: Approaching limits

### Recommended Tools

- **Firebase Console**: Monitor App Hosting metrics
- **Google Cloud Logging**: View request logs
- **Upstash Analytics**: Rate limiter stats (if upgrading to Redis)
- **Cloudflare (optional)**: WAF + advanced DDoS protection

---

## Scaling Beyond Current Setup

### Current Limitations
- **In-memory rate limiter**: Works for single instance, resets on restart
- **Limited to 10 instances**: Firebase App Hosting limit
- **No distributed state**: Rate limits not shared across instances

### Upgrade Path

#### Phase 1: Redis-based Rate Limiting (Recommended)
```bash
npm install redis ioredis
```
Replace in-memory limiter with Redis for distributed state:
```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimit(ip: string) {
  const key = `rate-limit:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  return count <= 30;
}
```

**Services**:
- **Upstash Redis** (serverless, free tier): https://upstash.com
- **Redis Cloud**: https://redis.com/cloud/
- **Self-hosted Redis**: For high-volume needs

#### Phase 2: WAF (Web Application Firewall)
- **Cloudflare**: Free plan includes DDoS protection
- **AWS WAF**: If migrating to AWS
- **Google Cloud Armor**: Native integration with GCP

#### Phase 3: Advanced Monitoring
- Set up Sentry for error tracking
- Enable Firebase real-time alerts
- Configure PagerDuty for incidents

---

## Response Strategy (During Attack)

1. **Detection**: Monitor Firebase metrics in console
2. **Immediate**: Check if traffic is legitimate (events, launches)
3. **If attack confirmed**:
   - **Increase reCAPTCHA score threshold** (0.5 → 0.7)
   - **Lower rate limits** (30 → 5 requests/min)
   - **Increase maxInstances** (10 → 20)
4. **Communicate**: Update status page
5. **Analyze**: Check logs for attack patterns
6. **Remediate**: Block specific countries/IPs if needed (via WAF)

---

## Quick Checklist

- [ ] Set RECAPTCHA_SECRET_KEY and NEXT_PUBLIC_RECAPTCHA_SITE_KEY
- [ ] Enable reCAPTCHA on sensitive endpoints
- [ ] Test rate limiter with `curl` or load testing tool
- [ ] Monitor Firebase metrics weekly
- [ ] Update maxInstances based on expected traffic
- [ ] Set up alerts in Firebase Console
- [ ] Document on-call escalation procedure
- [ ] Plan Redis upgrade for multi-instance deployments

---

## Testing Rate Limiter Locally

```bash
# Test with curl (should fail after 30 requests in 60 seconds)
for i in {1..35}; do
  curl -X POST http://localhost:3000/api/verify-recaptcha \
    -H "Content-Type: application/json" \
    -d '{"token":"test"}' \
    -H "X-Forwarded-For: 192.168.1.100"
  sleep 1
done

# You should see 429 status after the 30th request
```

---

## References

- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [reCAPTCHA v3 Implementation Guide](https://developers.google.com/recaptcha/docs/v3)
- [OWASP DDoS Protection Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Prevention_Cheat_Sheet.html)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (429 = Too Many Requests)
