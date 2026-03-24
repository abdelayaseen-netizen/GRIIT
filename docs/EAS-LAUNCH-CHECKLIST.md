# GRIIT EAS Launch Checklist

## Before every production build — verify these env vars are set in EAS:
Go to: https://expo.dev → your project → Secrets

### Required (app will not function without these):
- [ ] EXPO_PUBLIC_SUPABASE_URL
- [ ] EXPO_PUBLIC_SUPABASE_ANON_KEY
- [ ] EXPO_PUBLIC_API_BASE_URL  (your Railway URL, no trailing slash)

### Required for revenue (paywall will be dead without these):
- [ ] EXPO_PUBLIC_REVENUECAT_IOS_KEY
- [ ] EXPO_PUBLIC_REVENUECAT_ANDROID_KEY

### Required for error monitoring:
- [ ] EXPO_PUBLIC_SENTRY_DSN

### Optional but recommended:
- [ ] EXPO_PUBLIC_POSTHOG_API_KEY  (analytics)

## Build commands:
# Test on simulator:
eas build --platform ios --profile development

# Send to TestFlight (internal beta):
eas build --platform ios --profile preview

# Production App Store build:
eas build --platform ios --profile production

# Submit to App Store (after production build):
eas submit --platform ios --profile production

## Railway backend deploy:
railway up --service grit-backend

## After deploy — smoke test:
curl https://grit-backend-production.up.railway.app/health
# Must return {"status":"ok"}
