// Convert an axios/network error into a short, user-facing message.
//
// Network failures (no internet, DNS/ENOTFOUND, connection refused, request
// timeout, CORS) never carry an `err.response`, so surfacing `err.message`
// directly leaks strings like "timeout of 15000ms exceeded" or
// "getaddrinfo ENOTFOUND api.example.com" into the UI. Map those to one
// friendly line instead.
export function apiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  // Server actually responded — prefer its message.
  const status = err?.response?.status;
  const serverMsg = err?.response?.data?.message;
  if (serverMsg) return serverMsg;
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (status === 401 || status === 403) return "Your session has expired. Please try again.";
  if (status && status >= 500) return "The server ran into a problem. Please try again in a moment.";
  if (status) return fallback;

  // No response object at all — the request never reached the server.
  const code = err?.code;
  const msg = String(err?.message || "").toLowerCase();

  if (code === "ECONNABORTED" || msg.includes("timeout")) {
    return "The server is taking too long to respond. Please check your connection and try again.";
  }
  if (
    code === "ERR_NETWORK" ||
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    code === "ECONNREFUSED" ||
    msg.includes("network error") ||
    msg.includes("failed to fetch") ||
    msg.includes("enotfound") ||
    msg.includes("econnrefused")
  ) {
    return "Can't reach the server right now. Please check your internet connection and try again.";
  }

  return fallback;
}
