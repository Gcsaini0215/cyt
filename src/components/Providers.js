'use client';

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import useTherapistStore from "@/store/therapistStore";
import useUserStore from "@/store/userStore";
import { getDecodedToken, getToken, removeToken } from "@/utils/jwt";

const theme = createTheme();

export default function Providers({ children }) {
  const { fetchTherapistInfo } = useTherapistStore();
  const { fetchUserInfo } = useUserStore();

  useEffect(() => {
    const data = getToken();

    if (data) {
      const userData = getDecodedToken();
      const currentTime = Date.now() / 1000;
      if (userData.role === 2) {
        removeToken();
      }
      else if (userData.exp < currentTime) {
        removeToken();
      } else {
        if (userData.role === 1) {
          fetchTherapistInfo();
        } else {
          fetchUserInfo();
        }
      }
    }
  }, [fetchUserInfo, fetchTherapistInfo]);

  return (
    <ThemeProvider theme={theme}>
      {children}
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}
