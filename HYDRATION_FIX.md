# Hydration Error Fix - Complete Guide

## Problem
"Text content does not match server-rendered HTML" - This happens when components render differently on server vs client.

## Root Cause
Several components were using `useMediaQuery` directly without wrapping it in `useEffect`. This causes:
- Server renders with default values
- Client renders with actual window size
- Mismatch = hydration error

## Changes Made

### 1. Fixed `src/components/home/banner.js`
- Replaced `useMediaQuery` hook with manual `window.matchMedia` in useEffect
- Now safely detects mobile/tablet after hydration

### 2. Fixed `src/components/home/workshops.js`
- Same fix as banner.js
- Uses `window.matchMedia` with proper event listeners

### 3. Updated `src/pages/_document.js`
- Added `suppressHydrationWarning` to body tag as fallback

### 4. Fixed `src/components/api-debug.js`
- Added `isClient` check to prevent server-side rendering issues

### 5. Created Custom Hooks
- `src/hooks/useHydrated.js` - Check if component is hydrated
- `src/hooks/useMediaQueryClient.js` - Safe media query hook for other components

## Steps to Fix Complete App

### Step 1: Clean Build
```bash
cd d:\cyt
npm run build
```
If errors appear, check console for which component has issues.

### Step 2: Test Locally
```bash
npm run dev
```
Open http://localhost:3000 and check browser console (F12).
- Should NOT see hydration errors
- Should see therapists loading

### Step 3: Production Build
```bash
npm run build
npm start
```
Test at http://localhost:3000 in production mode.

### Step 4: Fix Remaining Components (If Needed)

If you still see errors, they're from other components using `useMediaQuery`. 

**Quick fix for any component:**
Replace:
```js
const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
```

With:
```js
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const query = window.matchMedia("(max-width: 600px)");
  setIsMobile(query.matches);
  
  const handleChange = (e) => setIsMobile(e.matches);
  query.addListener(handleChange);
  
  return () => query.removeListener(handleChange);
}, []);
```

Or use the custom hook:
```js
import { useMediaQueryClient } from '../hooks/useMediaQueryClient';

const isMobile = useMediaQueryClient('sm');
```

## Verification Checklist

✅ No red errors in browser console
✅ All pages load without hydration warnings
✅ Mobile responsive works correctly
✅ Data loads from API or mock data
✅ Therapists display on home page
✅ Profile page shows therapist data

## If Still Getting Errors

1. Check browser DevTools → Console tab
2. Look for specific component name in error
3. Apply the fix template above to that component
4. Rebuild with `npm run build`

## Deploy
Once local tests pass:
```bash
git add .
git commit -m "Fix hydration errors"
git push origin main
```
Auto-deployment will start.
