import "@/App.css";
import "@/index.css";
import "@/components/bottom-navigation.css";
import Providers from "@/components/Providers";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>India's Growing Network of Verified Therapists | Choose Your Therapist</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes, viewport-fit=cover" />
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossOrigin="anonymous" />
      </Head>
      <Providers>
        <div className="offcanvas-overlay"></div>
        <div className="wrapper">
          <div className="main-wrapper">
            <Component {...pageProps} />
          </div>
        </div>
      </Providers>
    </>
  );
}

export default MyApp;
