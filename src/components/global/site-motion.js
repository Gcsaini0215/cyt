import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";

/* Site-wide scroll feel for the public pages (mounted once in _app.js):
   - sections below the first screen fade up as they scroll into view; a grid of cards inside one comes in card by card
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

// the first card grid inside a section: 3–12 similar children laid out as a grid / wrapping row
function cardGrids(section) {
  const found = [];
  const cands = section.querySelectorAll("div, ul, ol");
  for (let i = 0; i < cands.length && found.length < 2 && i < 400; i++) {
    const c = cands[i];
    const kids = c.children;
    if (kids.length < 3 || kids.length > 12) continue;
    if (found.some((f) => f.contains(c) || c.contains(f))) continue;
    const cs = getComputedStyle(c);
    const isGrid = cs.display === "grid" || cs.display === "inline-grid" || (cs.display === "flex" && cs.flexWrap === "wrap") || /\brow\b/.test(c.className);
    if (!isGrid) continue;
    const tag = kids[0].tagName;
    if (![...kids].every((k) => k.tagName === tag)) continue;
    if ([...kids].some((k) => getComputedStyle(k).animationName !== "none")) continue;
    if (c.closest(".swiper, .slick-slider, [class*=carousel], [class*=marquee]")) continue;
    found.push(c);
  }
  return found;
}

export default function SiteMotion() {
  const router = useRouter();
  const barRef = useRef(null);
  const on = isMotionPage(router.pathname);

  useEffect(() => {
    if (!on) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const root = document.querySelector(".main-wrapper") || document.body;
    const io = !reduce && "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.remove("sm-pending");
          e.target.classList.add("sm-in");
          io.unobserve(e.target);
        }), { threshold: 0, rootMargin: "0px 0px -6% 0px" })
      : null;

    const scan = () => {
      if (!io) return;
      const vh = window.innerHeight;
      root.querySelectorAll("section, footer").forEach((el) => {
        if (el.dataset.sm) return;
        el.dataset.sm = "1";
        if (el.parentElement?.closest("section") || el.closest(SKIP_INSIDE)) return;
        const r = el.getBoundingClientRect();
        if (r.height < 40 || r.top < vh * 0.9) return; // already on screen (or tiny): show as it is
        if (unsafe(el)) return;
        cardGrids(el).forEach((g) => {
          g.classList.add("sm-stagger");
          [...g.children].forEach((k, i) => { k.style.animationDelay = `${Math.min(i, 8) * 0.07 + 0.12}s`; });
        });
        el.classList.add("sm-pending");
        io.observe(el);
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
    const reveal = () => root.querySelectorAll(".sm-pending").forEach((el) => el.classList.replace("sm-pending", "sm-in"));
    window.addEventListener("beforeprint", reveal);

    return () => {
      clearTimeout(t0); clearTimeout(t); clearTimeout(stopMo); clearInterval(settle);
      mo?.disconnect(); io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      window.removeEventListener("beforeprint", reveal);
      root.querySelectorAll("[data-sm]").forEach((el) => { delete el.dataset.sm; el.classList.remove("sm-pending", "sm-in"); });
      root.querySelectorAll(".sm-stagger").forEach((g) => { g.classList.remove("sm-stagger"); [...g.children].forEach((k) => { k.style.animationDelay = ""; }); });
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
@keyframes smUp { from { opacity:0; transform:translateY(34px); } to { opacity:1; transform:none; } }
@keyframes smCard { from { opacity:0; transform:translateY(26px) scale(.98); } to { opacity:1; transform:none; } }
.sm-pending { opacity:0; }
.sm-in { animation:smUp .85s cubic-bezier(.2,.7,.2,1) backwards; }
.sm-pending .sm-stagger > * { opacity:0; }
.sm-in .sm-stagger > * { animation:smCard .7s cubic-bezier(.2,.7,.2,1) backwards; }
.sm-progress { position:fixed; top:0; left:0; right:0; height:3px; z-index:2147483000; transform:scaleX(0); transform-origin:0 50%;
  background:linear-gradient(90deg, #1e7a4c, #e3a83a); box-shadow:0 0 10px rgba(227,168,58,.55); pointer-events:none; }
@media (prefers-reduced-motion: reduce) {
  .sm-pending, .sm-pending .sm-stagger > * { opacity:1; }
  .sm-in, .sm-in .sm-stagger > * { animation:none; }
  .sm-progress { display:none; }
}
@media print { .sm-pending, .sm-pending .sm-stagger > * { opacity:1 !important; } .sm-progress { display:none; } }
`;
