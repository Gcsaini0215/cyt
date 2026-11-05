import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";

/* Site-wide scroll feel for the public pages (mounted once in _app.js):
   - inside each section, the pieces come in one by one as they scroll into view — headings, text, buttons, images and
     the cards of a card grid (a card comes in as one piece, with its text). Sections / containers themselves never move,
     and sideways rows that scroll on their own (home psychologists) and sliders are left alone
   - a thin gold reading-progress bar at the top
   - in-page "#" links glide to their target, clear of the sticky header
   Never on dashboards, sign-in, booking or payment screens. Nothing moves for people who ask for reduced motion.
   Pages with their own scroll effects (.eap on /for-business, .fx on /festival-therapy) keep them — sections inside are
   left alone here. A section that holds a fixed/sticky element or its own animation is never touched (a transform on it
   would break those). Without JS everything simply shows. */

const EXACT = new Set(["/", "/about-us", "/contact-us", "/for-business", "/how-it-works", "/faqs", "/blogs", "/mind-matters",
  "/wellness-toolkit", "/self-assessment", "/view-all-therapist", "/join-us", "/plans", "/allworkshop",
  "/internship-modules", "/mentorship-for-students", "/online-vs-in-person-therapy", "/psychologist-vs-psychiatrist-vs-counsellor",
  "/emergency-support", "/cancellation-policy", "/privacy-policy", "/terms-conditions", "/starthealing", "/collaborate-noida",
  "/probono-therapist", "/noida-appointment", "/psychologist-in-noida-delhi", "/service-page",
  "/blog-details", "/blog-details-new", "/blog-view", "/festival-therapy", "/internship-registration"]);
const PREFIX = ["/blog/", "/psychologist-in/", "/therapy-for/", "/services/", "/view-profile/", "/therapists/", "/workshop-detail/",
  "/probono-therapist/"];

export const isMotionPage = (path) => EXACT.has(path) || PREFIX.some((p) => path.startsWith(p));

const SKIP_INSIDE = ".eap, .fx, .MuiModal-root, .MuiDialog-root, [data-sm-skip]";

// space taken by the header once it is pinned (it only pins after scrolling down a little)
function headerOffset() {
  const h = document.querySelector(".rbt-header-wrapper");
  const r = h?.getBoundingClientRect();
  const pinned = h && /fixed|sticky/.test(getComputedStyle(h).position) && r.top <= 1;
  return (pinned && r.bottom > 0 ? Math.min(r.bottom, 160) : 100) + 12;
}

// a fixed / sticky descendant or an animation of its own → leave this block alone
function unsafe(el) {
  const cs = getComputedStyle(el);
  if (cs.animationName && cs.animationName !== "none") return true;
  if (cs.position === "fixed" || cs.position === "sticky") return true;
  const all = el.getElementsByTagName("*");
  for (let i = 0; i < all.length && i < 600; i++) {
    const p = getComputedStyle(all[i]).position;
    if (p === "fixed" || p === "sticky") return true;
  }
  return false;
}

// card grids inside a section (3–24 similar children as a grid / wrapping row): each card comes in as one piece.
// Sideways-scrolling rows (e.g. the home psychologists row, which moves on by itself) and sliders are left alone.
const NO_GRID = ".swiper, .slick-slider, [class*=carousel], [class*=marquee], .tt-row-scroll";
function swipeRows(section) {
  return [...section.querySelectorAll("div, ul")].filter((c) => {
    if (c.children.length < 3) return false;
    const cs = getComputedStyle(c);
    return /(auto|scroll)/.test(cs.overflowX) && (cs.display === "flex" || cs.display === "grid");
  });
}
function cardGrids(section) {
  const found = [];
  const cands = section.querySelectorAll("div, ul, ol");
  for (let i = 0; i < cands.length && found.length < 6 && i < 600; i++) {
    const c = cands[i];
    const kids = c.children;
    if (kids.length < 3 || kids.length > 90) continue;
    if (found.some((f) => f.contains(c) || c.contains(f))) continue;
    const cs = getComputedStyle(c);
    if (/(auto|scroll)/.test(cs.overflowX)) continue; // a swipe row: leave it
    const grid = cs.display === "grid" || cs.display === "inline-grid" || (cs.display === "flex" && cs.flexWrap === "wrap") || /\brow\b/.test(c.className);
    if (!grid || kids.length > 24) continue;
    const tag = kids[0].tagName;
    if (![...kids].every((k) => k.tagName === tag)) continue;
    if ([...kids].some((k) => getComputedStyle(k).animationName !== "none")) continue;
    if (c.closest(NO_GRID)) continue;
    found.push(c);
  }
  return found;
}

// the pieces of a section that come in one by one — small things only, never a whole container
const PIECES = "h1, h2, h3, h4, h5, h6, p, blockquote, img, video, a[class*=btn], a[class*=Btn], a[class*=button], [class*=eyebrow], [class*=kicker]";

export default function SiteMotion() {
  const router = useRouter();
  const barRef = useRef(null);
  const on = isMotionPage(router.pathname);

  useEffect(() => {
    if (!on) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const root = document.querySelector(".main-wrapper") || document.body;
    // what scrolls in together comes in one after another
    const io = !reduce && "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          const shown = entries.filter((e) => e.isIntersecting).map((e) => e.target)
            .sort((x, y) => (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
          shown.forEach((el, i) => {
            el.style.setProperty("--smd", `${Math.min(i, 8) * 0.07}s`);
            el.classList.add("sm-on");
            io.unobserve(el);
          });
        }, { threshold: 0.05, rootMargin: "0px 0px -3% 0px" })
      : null;

    const scan = () => {
      if (!io) return;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      root.querySelectorAll("section, footer").forEach((sec) => {
        if (sec.dataset.sm) return;
        sec.dataset.sm = "1";
        if (sec.parentElement?.closest("section") || sec.closest(SKIP_INSIDE)) return;
        const r = sec.getBoundingClientRect();
        if (r.height < 40) return;
        if (unsafe(sec)) return;
        const grids = cardGrids(sec);
        const rows = swipeRows(sec);
        const items = [];
        grids.forEach((g) => items.push(...g.children));
        const inGrid = (el) => grids.some((g) => g.contains(el)) || rows.some((r2) => r2.contains(el));
        const list = sec.querySelectorAll(PIECES);
        for (let i = 0; i < list.length && items.length < 90; i++) {
          const el = list[i];
          if (inGrid(el) || el.closest(`${SKIP_INSIDE}, ${NO_GRID}, form, table, nav, [role=tablist]`)) continue;
          if (items.some((x) => x.contains(el))) continue; // already part of a bigger piece
          items.push(el);
        }
        items.forEach((el) => {
          if (getComputedStyle(el).animationName !== "none") return;
          const er = el.getBoundingClientRect();
          if (er.height > vh * 0.9) return; // a big block, not a piece
          if (!er.width && !er.height) return; // hidden
          const onScreen = er.top < vh * 0.92 && er.bottom > 0 && er.left < vw && er.right > 0;
          if (onScreen) return; // already in view on arrival: leave it as it is
          el.classList.add("sm-it");
          io.observe(el);
        });
      });
    };

    let t = 0;
    const later = () => { clearTimeout(t); t = setTimeout(scan, 200); };
    const t0 = setTimeout(scan, 60);
    const mo = io ? new MutationObserver(later) : null;
    mo?.observe(root, { childList: true, subtree: true });
    const stopMo = setTimeout(() => mo?.disconnect(), 20000); // content that arrives late is still caught for 20s

    // reading progress
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${max > 200 ? Math.min(1, window.scrollY / max) : 0})`;
        }
        // at the very bottom: whatever is still waiting (e.g. the last footer line) comes in
        if (window.scrollY >= max - 4) root.querySelectorAll(".sm-it:not(.sm-on)").forEach((el) => { el.classList.add("sm-on"); io?.unobserve(el); });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // in-page links glide, clear of the sticky header
    let settle = 0;
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href*='#']");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.hash.length < 2) return;
      let el = null;
      try { el = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { el = null; }
      if (!el) return;
      e.preventDefault();
      const go = (behavior) => window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerOffset()), behavior });
      go(reduce ? "auto" : "smooth");
      // the header pins on the way down and the page shifts under it — once the glide has stopped, measure again
      clearInterval(settle);
      let last = -1, still = 0, tries = 0;
      settle = setInterval(() => {
        tries += 1;
        const y = window.scrollY;
        still = Math.abs(y - last) < 1 ? still + 1 : 0;
        last = y;
        if (still < 2 && tries < 40) return;
        clearInterval(settle);
        const off = el.getBoundingClientRect().top - headerOffset();
        if (Math.abs(off) > 4) window.scrollTo({ top: Math.max(0, window.scrollY + off), behavior: reduce ? "auto" : "smooth" });
      }, 100);
      history.replaceState(history.state, "", url.hash);
    };
    document.addEventListener("click", onClick);

    // printing: show everything
    const reveal = () => root.querySelectorAll(".sm-it").forEach((el) => el.classList.add("sm-on"));
    window.addEventListener("beforeprint", reveal);

    return () => {
      clearTimeout(t0); clearTimeout(t); clearTimeout(stopMo); clearInterval(settle);
      mo?.disconnect(); io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      window.removeEventListener("beforeprint", reveal);
      root.querySelectorAll("[data-sm]").forEach((el) => { delete el.dataset.sm; });
      root.querySelectorAll(".sm-it").forEach((el) => { el.classList.remove("sm-it", "sm-on"); el.style.removeProperty("--smd"); });
    };
  }, [on, router.asPath]);

  if (!on) return null;
  return (
    <>
      <div className="sm-progress" ref={barRef} aria-hidden="true" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </>
  );
}

const CSS = `
@keyframes smUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }
@keyframes smZoom { from { opacity:0; transform:translateY(18px) scale(.96); } to { opacity:1; transform:none; } }
.sm-it { opacity:0; }
.sm-it.sm-on { opacity:1; animation:smUp .75s cubic-bezier(.2,.7,.2,1) var(--smd, 0s) backwards; }
img.sm-it.sm-on, video.sm-it.sm-on, iframe.sm-it.sm-on { animation-name:smZoom; animation-duration:.9s; }
.sm-progress { position:fixed; top:0; left:0; right:0; height:3px; z-index:2147483000; transform:scaleX(0); transform-origin:0 50%;
  background:linear-gradient(90deg, #1e7a4c, #e3a83a); box-shadow:0 0 10px rgba(227,168,58,.55); pointer-events:none; }
@media (prefers-reduced-motion: reduce) {
  .sm-it { opacity:1; }
  .sm-it.sm-on { animation:none; }
  .sm-progress { display:none; }
}
@media print { .sm-it { opacity:1 !important; } .sm-progress { display:none; } }
`;
