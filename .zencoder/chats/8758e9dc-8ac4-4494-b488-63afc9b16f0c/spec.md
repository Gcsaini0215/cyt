# Technical Specification - Login Error Fix (429 Too Many Requests)

## Context
Language: JavaScript (Next.js)
Component: `src/pages/login.js`
API: `https://api.chooseyourtherapist.in/api/login` (controlled via `src/utils/url.js` and `src/utils/actions.js`)

## Implementation Approach

### State Management
Add a new state `cooldown` (integer, representing seconds remaining) to the `Login` component.
Update the `handleSubmit` function to check if `cooldown > 0` before making the API call.

### Timer Logic
Use `useEffect` to handle the countdown if `cooldown > 0`.

### Error Handling
In the `catch` block of `handleSubmit`, specifically check if `error.response?.status === 429`.
If 429 is detected, set a custom error message: "Too many requests. Please wait before trying again." and initiate a longer cooldown (e.g., 60 seconds).

### UI Changes
- Disable the "Send OTP" button if `cooldown > 0`.
- Display the remaining seconds on the button text or near it (e.g., "Send OTP (45s)").
- Add `disabled={loading || cooldown > 0}` to the button for extra safety.

## Source Code Structure Changes
Only `src/pages/login.js` will be modified.

## Data Model / API / Interface Changes
No changes to external APIs.

## Delivery Phases
1. Phase 1: Implement cooldown state and timer logic in `Login` component.
2. Phase 2: Update `handleSubmit` to handle 429 specifically and trigger cooldown.
3. Phase 3: Update UI to reflect cooldown state.

## Verification Approach
- Manual testing: Trigger the "Send OTP" button multiple times to verify the button disables and the timer starts.
- Linting: Run `npm run lint` (or equivalent) to ensure no regressions.
