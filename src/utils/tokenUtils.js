import { jwtDecode } from "jwt-decode";

// Returns true if token is valid, false otherwise
export function isTokenValid(token) {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // current time in seconds
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}

// Returns decoded token payload, or null if invalid
export function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
}