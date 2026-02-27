# Remaining Hydration Fixes - All Components

## Fixed ✅
- src/components/home/profile-card.js
- src/components/home/free-resources.js  
- src/components/home/HorTherapistCard.js

## Need Fixing ❌

### Pattern to Replace
**BEFORE:**
```js
import useMediaQuery from "@mui/material/useMediaQuery";

export default function Component() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
}
```

**AFTER:**
```js
import { useState, useEffect } from "react";

export default function Component() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 600px)");
    setIsMobile(query.matches);
    const handle = (e) => setIsMobile(e.matches);
    query.addListener(handle);
    return () => query.removeListener(handle);
  }, []);
}
```

## Files to Fix
1. src/pages/terms-conditions.js
2. src/pages/supervision-details.js
3. src/pages/starthealing.js
4. src/pages/privacy-policy.js
5. src/pages/cancellation-policy.js
6. src/pages/blog-details.js
7. src/pages/blog-details-new.js
8. src/components/view_profile/payment-success-popup.js
9. src/components/about/team.js
10. src/components/view_profile/header.js
11. src/components/about/collaborator.js
12. src/components/home/consultation-form.js
13. src/components/global/qrcode-card.js
14. src/components/dashboard/user-layout.js
15. src/components/dashboard/notify-bar.js
16. src/components/home/process-steps.js
17. src/components/home/mood-navigator.js
18. src/components/home/profile-card-hor.js
19. src/components/home/specializations.js
20. src/components/services/header.js
21. src/components/therapist-card.js
22. src/components/therapists/settings/profile.js
23. src/components/therapists/main-layout.js

## Steps
1. Open each file
2. Find: `import useMediaQuery from "@mui/material/useMediaQuery";`
3. Remove that import
4. Add: `import { useState, useEffect } from "react";`
5. Replace all useMediaQuery calls with useState + useEffect pattern above
6. Save file

## Quick Build Test
```bash
npm run build
npm run dev
```

Should see NO hydration errors!
