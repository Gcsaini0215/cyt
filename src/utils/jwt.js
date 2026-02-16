// auth.js
import { jwtDecode } from "jwt-decode";

export const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

export const getDecodedToken = () => {
  const token = getToken();
  if (!token) return null;
  return jwtDecode(token);
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    if (Date.now() >= exp * 1000) {
      removeToken();
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
