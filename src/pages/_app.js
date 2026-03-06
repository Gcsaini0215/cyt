import "@/App.css";
import "@/index.css";
import "@/components/bottom-navigation.css";
import Providers from "@/components/Providers";
import PremiumLoader from "@/components/global/PremiumLoader";
import WhatsAppWidget from "@/components/global/whatsapp-widget";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </Head>
      {isLoading && <PremiumLoader />}
      <WhatsAppWidget />
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
