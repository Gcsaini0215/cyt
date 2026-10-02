import React from "react";
import { useRouter } from "next/router";
import useTherapistStore from "../../store/therapistStore";
import DashboardTopNav from "./top-nav";
import TherapistSideNav from "./side-nav";
import ChatWidget from "./ChatWidget";
import { checkProfileSet } from "../../utils/url";
import { fetchById } from "../../utils/actions";

/**
 * Therapist portal shell (top nav + side nav + chat). _app.js mounts it ONCE
 * for every route below and keeps it mounted across navigation, so a click in
 * the sidebar only swaps the page body — no nav/chat remount, no refetch.
 * Pages still wrap themselves in <MainLayout>; inside the shell that is a
 * pass-through. Add a route here when a new page uses MainLayout.
 */
export const THERAPIST_SHELL_ROUTES = new Set([
  "/therapist-dashboard",
  "/appointments",
  "/my-schedule",
  "/case-history",
  "/clinic-patients",
  "/add-offline-client",
  "/create-report",
  "/coupons",
  "/coupon/create",
  "/coupon/update/[id]",
  "/workshops",
  "/create-workshop",
  "/update-workshop/[id]",
  "/therapist-blogs",
  "/therapist-ai-blog",
  "/settings",
  "/therapists/invoices",
  "/therapists/notifications",
  "/therapists/reviews",
  "/therapists/change-password",
]);

const ShellContext = React.createContext(false);

// Layout spacing via CSS media queries (not useMediaQuery) so the server HTML
// already has the right padding — no jump after hydration. 960px is where
// the top nav turns into a bottom nav and the side nav hides.
const shellStyles = `
  .ts-area { background: #f8faf9; min-height: 100vh; padding-top: 38px; padding-left: 60px; }
  .ts-main { padding: 28px 40px; }
  .ts-inner { max-width: 1500px; margin: 0 auto; transition: opacity .18s ease; }
  .ts-inner.is-busy { opacity: .55; pointer-events: none; }
  /* opacity only: a transform here would make every position:fixed modal/
     banner inside the page position itself relative to this box instead of
     the screen */
  .ts-page { animation: tsIn .2s ease; }
  @keyframes tsIn { from { opacity: 0; } to { opacity: 1; } }
  @media (max-width: 960px) { .ts-area { padding-left: 0; padding-bottom: 80px; } }
  @media (max-width: 599px) { .ts-main { padding: 16px 10px; } }
  @media (prefers-reduced-motion: reduce) { .ts-page { animation: none; } .ts-inner { transition: none; } }

  .ts-progress { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 2000; pointer-events: none; overflow: hidden; }
  .ts-progress::after {
    content: ""; position: absolute; top: 0; bottom: 0; left: -40%; width: 40%;
    background: linear-gradient(90deg, transparent, #22c55e, #f2c94c, transparent);
    animation: tsBar 0.9s ease-in-out infinite;
  }
  @keyframes tsBar { to { left: 100%; } }
`;

export function TherapistShell({ children }) {
  const { profileSet, setProfileSet } = useTherapistStore();
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!profileSet) {
      const getData = async () => {
        try {
          const res = await fetchById(checkProfileSet);
          if (res.status) setProfileSet(res.data.check);
        } catch (err) {
          console.log(err);
        }
      };
      getData();
    }
  }, [profileSet]);

  // Thin progress bar + dimmed body while the next page's code/data loads;
  // only shown if it takes >120ms so instant switches don't flicker.
  React.useEffect(() => {
    let t;
    const start = (url, { shallow } = {}) => {
      if (shallow) return;
      clearTimeout(t);
      t = setTimeout(() => setBusy(true), 120);
    };
    const done = () => { clearTimeout(t); setBusy(false); };
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError", done);
    return () => {
      clearTimeout(t);
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError", done);
    };
  }, [router.events]);

  return (
    <ShellContext.Provider value={true}>
      <style dangerouslySetInnerHTML={{ __html: shellStyles }} />
      {busy && <div className="ts-progress" role="progressbar" aria-label="Loading page" />}
      <DashboardTopNav />
      <TherapistSideNav />
      <ChatWidget />
      <div className="rbt-dashboard-area ts-area">
        <main className="ts-main">
          <div className={`container-fluid ts-inner${busy ? " is-busy" : ""}`}>
            {/* keyed by route so each page body fades in on arrival */}
            <div className="ts-page" key={router.asPath.split("?")[0]}>{children}</div>
          </div>
        </main>
      </div>
    </ShellContext.Provider>
  );
}

export default function MainLayout(props) {
  const inShell = React.useContext(ShellContext);
  if (inShell) return <>{props.children}</>;
  // Fallback for a page not listed in THERAPIST_SHELL_ROUTES.
  return <TherapistShell>{props.children}</TherapistShell>;
}
