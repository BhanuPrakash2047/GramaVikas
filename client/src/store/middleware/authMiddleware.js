import apiClient from '../../services/api';

/**
 * Auth Middleware
 *
 * This middleware injects the JWT token from Redux state into all API requests.
 * It avoids the circular dependency issue by using the middleware's built-in
 * access to the store (via parameter) instead of importing the store directly.
 *
 * Runs: On every action dispatch
 * Effect: Sets axios Authorization header before API calls
 */
export const authMiddleware = (store) => (next) => (action) => {
  // Get current state with built-in store parameter (no import needed)
  const state = store.getState();
  const token = state.auth?.token;

  // Inject token into axios default headers
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Remove token if user logs out
    delete apiClient.defaults.headers.common['Authorization'];
  }

  // Call next middleware/reducer
  return next(action);
};
