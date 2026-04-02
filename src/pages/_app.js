import "@/App.css";
import "@/index.css";
import "@/components/bottom-navigation.css";
import Providers from "@/components/Providers";
import PremiumLoader from "@/components/global/PremiumLoader";
import WhatsAppWidget from "@/components/global/whatsapp-widget";
import TawkToWidget from "@/components/global/tawk-widget";
import CookieConsent from "@/components/global/cookie-consent";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { postData } from "../utils/actions";
import { subscribeToNotifications } from "../utils/push-notifications";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Global error handler to suppress external widget errors (like Tawk.to)
    const handleError = (event) => {
      if (event.filename && (event.filename.includes('tawk.to') || event.filename.includes('twk-chunk'))) {
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.stack && event.reason.stack.includes('tawk.to')) {
        event.preventDefault();
      }
    });

    // Register service worker and subscribe to notifications
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
          // Auto-subscribe after registration
          subscribeToNotifications();
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events?.on("routeChangeStart", handleStart);
    router.events?.on("routeChangeComplete", handleComplete);
    router.events?.on("routeChangeError", handleComplete);

    return () => {
      router.events?.off("routeChangeStart", handleStart);
      router.events?.off("routeChangeComplete", handleComplete);
      router.events?.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const hideWidgetsOn = [
    "/therapist-dashboard",
    "/appointments",
    "/clinic-patients",
    "/case-history",
    "/create-report",
    "/workshops",
    "/coupons",
    "/settings",
    "/create-workshop",
    "/add-offline-client",
    "/therapist-blogs",
    "/therapist-ai-blog",
    "/therapists/",
    "/coupon/",
    "/update-workshop/"
  ];

  const shouldHideWidgets = hideWidgetsOn.some(route => router.pathname.startsWith(route));

  return (
    <Providers>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#228756" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />
        {/* Global Geo Tags - Defaulting to Noida, India to prevent US-based Googlebot/VPN detection sync issues */}
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content="Sector 51, Noida, Uttar Pradesh, India" />
        <meta name="geo.position" content="28.5672;77.3650" />
        <meta name="ICBM" content="28.5672, 77.3650" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>
      {isLoading && <PremiumLoader />}
      {!shouldHideWidgets && (
        <>
          <WhatsAppWidget />
          <TawkToWidget />
        </>
      )}
      <CookieConsent />
      <div className="offcanvas-overlay" suppressHydrationWarning></div>
      <div className="wrapper" suppressHydrationWarning>
        <div className="main-wrapper" suppressHydrationWarning>
          <Component {...pageProps} />
        </div>
      </div>
    </Providers>
  );
}

export default MyApp;
