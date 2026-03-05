# Product Requirements Document - Login Error Fix (429 Too Many Requests)

## Context
The user is experiencing a `429 Too Many Requests` error when attempting to log in via the `/api/login` endpoint. This error indicates that the server-side rate limiter is being triggered.

## Problem Statement
When a user attempts to log in, the API call returns a 429 status code. The current frontend does not handle this error specifically, leading to a generic "Request failed with status code 429" message or similar. Additionally, there is no client-side mechanism to prevent rapid repeated attempts if the re-render is slow.

## Requirements

### Functional Requirements
1. **Error Handling**: Detect 429 status code and provide a user-friendly message (e.g., "Too many attempts. Please try again later.").
2. **Cooldown Mechanism**: Implement a client-side cooldown (e.g., 30-60 seconds) after a successful request or a rate-limit error to prevent further spamming.
3. **Button State**: Ensure the login button is truly disabled and shows a countdown during the cooldown period.
4. **No redundant calls**: Ensure `handleSubmit` cannot be triggered multiple times simultaneously (already partially handled by `loading` state, but can be improved with a dedicated debouncing or immediate disabling).

### Non-Functional Requirements
1. **User Experience**: Provide clear feedback on when the user can try again.
2. **Robustness**: Handle different types of error responses from the backend gracefully.

## Constraints
- The backend rate-limiting logic is not accessible for modification in this task.
- Changes should be minimal and focused on solving the immediate user pain point.

## Decisions/Assumptions
- We will assume a 60-second cooldown is reasonable for a login OTP request.
- We will use local state in the `Login` component to manage the cooldown timer.
