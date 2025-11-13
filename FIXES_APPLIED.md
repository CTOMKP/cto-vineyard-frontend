# Fixes Applied to cto-vineyard-frontend-repo

## Issues Fixed

### 1. ✅ **401 Unauthorized on Upload**
**Problem**: User not authenticated or session expired  
**Solution**: User needs to login via `/auth/signin` page

### 2. ✅ **404 on Download (Old Railway URL)**
**Problem**: Hardcoded Railway URL `cto-backend-production-28e3.up.railway.app`  
**Solution**: Replaced all hardcoded URLs with environment variable fallback to `https://api.ctomarketplace.com`

### 3. ✅ **Updated Fallback URLs**
**Problem**: Fallback URLs pointed to old `github.useguidr.com`  
**Solution**: Updated to `https://api.ctomarketplace.com`

## Files Updated

1. `src/hooks/useApi.ts` - Updated fallback URL
2. `src/lib/auth.ts` - Updated fallback URL  
3. `src/app/page.tsx` - Replaced hardcoded Railway URL
4. `src/app/admin/page.tsx` - Replaced hardcoded Railway URL
5. `src/app/admin/payments/page.tsx` - Replaced hardcoded Railway URL
6. `src/app/admin/listings/page.tsx` - Replaced hardcoded Railway URL
7. `src/app/admin/boosts/page.tsx` - Replaced hardcoded Railway URL

## Next Steps

### 1. Update Environment Variables in Vercel/Coolify

**For `cto-vineyard-frontend-repo` deployment**, set these environment variables:

```
NEXT_PUBLIC_API_URL=https://api.ctomarketplace.com
NEXT_PUBLIC_BACKEND_URL=https://api.ctomarketplace.com
```

**OR** (if using internal API URL):
```
NEXT_INTERNAL_API_URL=https://api.ctomarketplace.com
```

### 2. Redeploy Frontend

After updating environment variables, redeploy the frontend:
- **Vercel**: Should auto-deploy on push, or manually trigger redeploy
- **Coolify**: Click "Redeploy" button

### 3. Test the Fixes

#### Test Upload:
1. Go to `https://ctomemes.xyz` (or your domain)
2. **Login** via `/auth/signin` (must be ADMIN user)
3. Try uploading a meme
4. Should work without 401 error

#### Test Download:
1. Go to meme gallery
2. Click download on any meme
3. Should download successfully (no 404)

#### Test Admin Pages:
1. Login as admin
2. Check `/admin` dashboard
3. Check `/admin/listings`
4. Check `/admin/payments`
5. Check `/admin/boosts`
6. All should load without errors

## Authentication Requirements

**Important**: The `/api/memes/presign` endpoint requires:
- ✅ User must be logged in (NextAuth session)
- ✅ User must have `ADMIN` role
- ✅ Session must include `accessToken` in the session object

**To verify authentication:**
1. Check browser console for session data
2. Check Network tab - requests should include `Authorization: Bearer <token>` header
3. If 401 persists, user needs to logout and login again

## Share Modal Error (Non-Critical)

The `share-modal.js` error is a frontend script issue and doesn't affect core functionality. It can be fixed separately if needed.

## Verification Checklist

- [ ] Environment variables updated in Vercel/Coolify
- [ ] Frontend redeployed
- [ ] User can login successfully
- [ ] Upload works (no 401)
- [ ] Download works (no 404)
- [ ] Admin pages load correctly
- [ ] All API calls go to `api.ctomarketplace.com` (check Network tab)

