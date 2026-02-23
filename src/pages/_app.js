import "@/App.css";
import "@/index.css";
import "@/components/bottom-navigation.css";
import Providers from "@/components/Providers";
import PremiumLoader from "@/components/global/PremiumLoader";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

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
      {isLoading && <PremiumLoader />}
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
