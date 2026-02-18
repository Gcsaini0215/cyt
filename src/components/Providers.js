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

    // Tawk.to Script Integration
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      const tawkId = '667414b4dd590416e2580cc6/1i0qn1osp';
      if (!document.getElementById('tawk-script')) {
        // Mock i18next to prevent t.$_Tawk.i18next is not a function error
        if (!window.i18next) {
          window.i18next = {
            t: (key) => key,
            init: () => {},
            on: () => {},
          };
        }
        
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();
        const s1 = document.createElement("script");
        const s0 = document.getElementsByTagName("script")[0];
        s1.id = 'tawk-script';
        s1.async = true;
        s1.src = `https://embed.tawk.to/${tawkId}`;
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode.insertBefore(s1, s0);
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
