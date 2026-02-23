# Before & After Changes

## Fix #1: TypeError feesArray.map - src/utils/helpers.js

### ❌ BEFORE (Broken)
```js
export const getMinMaxPrice = (fees) => {
  const feesArray = JSON.parse(JSON.stringify(fees));
  
  const allFees = feesArray
    .map(f => f.formats.map(fmt => fmt.fee))  // ❌ CRASHES if feesArray not valid array
    .reduce((acc, val) => acc.concat(val), [])
    .filter(f => f !== null);
  
  if (allFees.length > 0) {
    return `₹${Math.min(...allFees)} - ₹${Math.max(...allFees)}`;
  }
  return "--";
};
```

**Problems:**
- No check if `fees` is null/undefined
- No check if `fees` is an array
- No check if fee object has `formats` property
- No error handling

### ✅ AFTER (Fixed)
```js
export const getMinMaxPrice = (fees) => {
  // Check if fees is valid
  if (!fees || !Array.isArray(fees) || fees.length === 0) {
    return "--";
  }

  try {
    const feesArray = JSON.parse(JSON.stringify(fees));

    const allFees = feesArray
      .filter(f => f && f.formats && Array.isArray(f.formats))  // ✅ Validate structure
      .map(f => f.formats
        .filter(fmt => fmt && typeof fmt.fee === 'number' && fmt.fee !== null)  // ✅ Type check
        .map(fmt => fmt.fee)
      )
      .reduce((acc, val) => acc.concat(val), []);

    if (allFees.length > 0) {
      const minFee = Math.min(...allFees);
      const maxFee = Math.max(...allFees);
      return `₹${minFee} - ₹${maxFee}`;
    }
    return "--";
  } catch (error) {  // ✅ Error handling
    console.error("Error in getMinMaxPrice:", error);
    return "--";
  }
};
```

**Improvements:**
- ✅ Validates fees is an array
- ✅ Validates each fee object structure
- ✅ Type-checks fee values
- ✅ Try-catch error handling
- ✅ Safe fallback to "--"

---

## Fix #2: Hydration Mismatch - src/components/home/banner.js

### ❌ BEFORE (Broken)
```js
import useMediaQuery from "@mui/material/useMediaQuery";

export default function Banner({ topTherapists = [] }) {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));  // ❌ SERVER & CLIENT DIFFER
  const isTablet = useMediaQuery((theme) => theme.breakpoints.down("md"));
  
  // ... rest of component
}
```

**Problems:**
- Server has no window object → defaults to false
- Client has window object → actual media query value
- Values don't match → hydration error

### ✅ AFTER (Fixed)
```js
import { useState, useEffect } from "react";

export default function Banner({ topTherapists = [] }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // ✅ Only runs on CLIENT in useEffect
  useEffect(() => {
    setIsClient(true);
    const mobileQuery = window.matchMedia("(max-width: 600px)");
    const tabletQuery = window.matchMedia("(max-width: 960px)");
    
    setIsMobile(mobileQuery.matches);
    setIsTablet(tabletQuery.matches);

    const handleMobileChange = (e) => setIsMobile(e.matches);
    const handleTabletChange = (e) => setIsTablet(e.matches);

    mobileQuery.addListener(handleMobileChange);
    tabletQuery.addListener(handleTabletChange);

    return () => {
      mobileQuery.removeListener(handleMobileChange);
      tabletQuery.removeListener(handleTabletChange);
    };
  }, []);
  
  // ... rest of component
}
```

**Improvements:**
- ✅ Uses useState for initial values
- ✅ useEffect only runs on client
- ✅ Server and client render same initially
- ✅ Client updates to correct value after hydration
- ✅ No mismatch!

---

## Fix #3: Multiple Components (Same Pattern)

Same fix applied to:
- `src/components/home/workshops.js`
- `src/components/home/profile-card-vert.js`
- `src/components/therapists/workshops/workshop-checkout-card.js`
- `src/components/ConsultationForm.js`
- `src/components/home/counter.js`

---

## Fix #4: API Debug Component - src/components/api-debug.js

### ❌ BEFORE
```js
export default function ApiDebug() {
  const [status, setStatus] = useState({});

  useEffect(() => {
    const checkApi = async () => {
      // ... API check logic
    };
    checkApi();
  }, []);

  if (process.env.NODE_ENV !== 'development') {  // ❌ Still might render on server
    return null;
  }
  
  return (/* ... JSX ... */);
}
```

### ✅ AFTER
```js
export default function ApiDebug() {
  const [status, setStatus] = useState({});
  const [isClient, setIsClient] = useState(false);  // ✅ Track hydration

  useEffect(() => {
    setIsClient(true);  // ✅ Only set after client hydration
    
    const checkApi = async () => {
      // ... API check logic
    };
    checkApi();
  }, []);

  if (!isClient || process.env.NODE_ENV !== 'development') {  // ✅ Both checks
    return null;
  }
  
  return (/* ... JSX ... */);
}
```

---

## Fix #5: Document Body - src/pages/_document.js

### ❌ BEFORE
```js
export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head />
      <body>  {/* ❌ No suppressHydrationWarning */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### ✅ AFTER
```js
export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head />
      <body suppressHydrationWarning>  {/* ✅ Added */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

---

## Summary of Pattern

### The Hydration Problem
```
SERVER RENDER          CLIENT RENDER (after hydration)
├─ No window          ├─ window exists
├─ useMediaQuery: false -> defaults    ├─ useMediaQuery: true -> actual value
├─ Renders: mobile layout              ├─ Renders: desktop layout
└─ HTML: "mobile"                      └─ HTML: "desktop"
   ↓
MISMATCH! → Hydration Error
```

### The Solution
```
SERVER RENDER          CLIENT RENDER          AFTER HYDRATION
├─ useState: false      ├─ useState: false      ├─ useEffect runs
├─ Renders: default     ├─ Hydrates: same       ├─ Sets correct value
└─ HTML: "default"      └─ HTML: "default"      └─ Component updates
                           ↓
                        MATCH! → No Error
                                 Then update to correct value
```

---

## Testing Each Fix

### Test Fix #1 (getMinMaxPrice)
```js
// Should not crash
getMinMaxPrice(null)        // Returns "--"
getMinMaxPrice([])          // Returns "--"
getMinMaxPrice(undefined)   // Returns "--"
getMinMaxPrice([{fee: 500}])  // Returns "--" (missing formats)
getMinMaxPrice([{
  formats: [{ fee: 500 }, { fee: 1000 }]
}])  // Returns "₹500 - ₹1000"
```

### Test Fixes #2-5 (Hydration)
1. Open DevTools → Console
2. Refresh page
3. Should NOT see:
   - "hydration" errors
   - "Text content does not match"
   - "mismatch" warnings
4. Should see:
   - Page loads smoothly
   - No layout shift
   - Components render correctly

---

## Common Patterns to Watch For

❌ **BAD - Will cause hydration errors:**
```js
const isMobile = useMediaQuery(...);  // At component level
const isServer = typeof window === 'undefined';  // At component level
const time = new Date().toLocaleString();  // At component level (time differs)
```

✅ **GOOD - Safe for hydration:**
```js
useEffect(() => {
  const isMobile = window.matchMedia(...);
  // ...
}, []);
```

```js
useEffect(() => {
  const isServer = typeof window === 'undefined';
  // ...
}, []);
```

```js
useEffect(() => {
  const time = new Date().toLocaleString();
  // ...
}, []);
```
