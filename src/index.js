import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./App.css";
import App from "./App";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import PremiumLoader from "./components/global/PremiumLoader";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <HelmetProvider>
    <BrowserRouter>
      <Suspense fallback={<PremiumLoader />}>
        <App />
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
);
