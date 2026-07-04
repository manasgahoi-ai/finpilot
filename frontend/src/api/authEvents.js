// Lightweight event bus used to bridge non-React modules (like the axios
// interceptor) with React Router, which lives inside the React tree.
//
// The axios interceptor can't call `useNavigate()` directly because it runs
// outside React's component tree. Instead, it dispatches a CustomEvent on
// `window`, and the `AuthHandler` component (mounted inside <BrowserRouter>)
// listens for it and performs a SPA-friendly navigation.

export const AUTH_LOGOUT_EVENT = 'finpilot:auth-logout'

/**
 * Dispatch an auth-logout event. The AuthHandler component will pick this up
 * and navigate to /login via React Router (no full page reload).
 */
export function dispatchAuthLogout() {
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT))
}
