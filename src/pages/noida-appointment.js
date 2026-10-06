import React, { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import { createPortal } from "react-dom";
import { apiUrl, imagePath } from "../utils/url";
import { profilePath } from "../utils/therapist-slug";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LockRounded from "@mui/icons-material/LockRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import CurrencyRupeeRounded from "@mui/icons-material/CurrencyRupeeRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import ConfirmationNumberRounded from "@mui/icons-material/ConfirmationNumberRounded";
import WavingHandRounded from "@mui/icons-material/WavingHandRounded";
import HourglassTopRounded from "@mui/icons-material/HourglassTopRounded";
import BoltRounded from "@mui/icons-material/BoltRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import EventBusyRounded from "@mui/icons-material/EventBusyRounded";
import DirectionsRounded from "@mui/icons-material/DirectionsRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import PersonAddAlt1Rounded from "@mui/icons-material/PersonAddAlt1Rounded";
import EventRepeatRounded from "@mui/icons-material/EventRepeatRounded";
import UpdateRounded from "@mui/icons-material/UpdateRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import { useRouter } from "next/router";

// Pushes an event to Google Tag Manager's dataLayer (already loaded in _document.js).
// Never pass names, phones or emails here — only slot / step / booking-type info.
function track(event, params = {}) {
  try {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch { /* analytics must never break booking */ }
}

// Contact details a client already typed, kept for 24h so a failed payment or a closed tab
// doesn't mean retyping. Deliberately excludes the free-text concern and the chosen slot.
const DRAFT_KEY = "cyt_noida_draft_v1";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

// A phone number this device has confirmed belongs to a real client — either it matched
// an existing booking, or they just successfully booked with it — kept indefinitely (no
// TTL, unlike the short-lived form draft above) so a return visit weeks later still
// recognises them, without asking them to type their number again just to find out.
const KNOWN_PHONE_KEY = "cyt_noida_known_phone_v1";
function saveKnownPhone(phone) {
  try { if (/^\d{10}$/.test(phone)) localStorage.setItem(KNOWN_PHONE_KEY, phone); } catch { /* ignore */ }
}
function loadKnownPhone() {
  try { const v = localStorage.getItem(KNOWN_PHONE_KEY) || ""; return /^\d{10}$/.test(v) ? v : ""; } catch { return ""; }
}
const KNOWN_NAME_KEY = "cyt_noida_known_name_v1";
function saveKnownName(name) {
  try { const n = String(name || "").trim(); if (n) localStorage.setItem(KNOWN_NAME_KEY, n.slice(0, 60)); } catch { /* ignore */ }
}
function loadKnownName() {
  try { return localStorage.getItem(KNOWN_NAME_KEY) || ""; } catch { return ""; }
}
function forgetKnownClient() {
  try { localStorage.removeItem(KNOWN_PHONE_KEY); localStorage.removeItem(KNOWN_NAME_KEY); } catch { /* ignore */ }
}
// A light tap on phones that support it (Android) — iOS Safari ignores it.
function haptic(ms = 12) {
  try { if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(ms); } catch { /* ignore */ }
}

// ── SEO / AI-search: everything below is derived from real page data (address, live prices) ──
const SITE = "https://www.chooseyourtherapist.in";
const PAGE_URL = `${SITE}/noida-appointment`;
const CENTRE_ID = `${PAGE_URL}#centre`;
const SEO_TITLE = "Psychologist in Noida – Book In-Person, Online or Home Visit";
const SEO_DESC = "Book a psychologist in Noida at our Sector 51 centre — pick an open slot, pay securely, get confirmed instantly. Online sessions & home visits available.";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// Prices are read from the same admin-managed source the booking form uses, so the copy never goes stale.
function priceLine(p) {
  if (!p) return "";
  const parts = [];
  if (p.individual_inperson) parts.push(`individual in-person ${inr(p.individual_inperson)}`);
  if (p.individual_online) parts.push(`individual online ${inr(p.individual_online)}`);
  if (p.individual_homevisit) parts.push(`individual home visit ${inr(p.individual_homevisit)}`);
  if (p.couple_inperson) parts.push(`couple in-person ${inr(p.couple_inperson)}`);
  return parts.length ? `Session fees: ${parts.join(", ")}${p.platformFee ? `, plus a ${inr(p.platformFee)} platform fee` : ""}.` : "";
}

function seoFaq(p) {
  const pkgs = Array.isArray(p?.packages) ? p.packages.filter(k => k?.name && k?.price && k?.sessionsCount) : [];
  const fees = priceLine(p);
  return [
    { q: "Where is the Choose Your Therapist centre in Noida?", a: `Our Noida centre is at Gate No-3, D-137, near LPS Global School, Block D, Sector 51, Noida, Uttar Pradesh 201301. You can get directions on Google Maps from this page.` },
    { q: "How much does a psychologist session cost in Noida?", a: fees ? `${fees} Live availability and the exact total for your choice are shown on this page before you pay.` : "Fees depend on the session type (individual or couple) and mode (in-person, online or home visit). The exact total for your choice is shown on this page before you pay." },
    { q: "How long is a therapy session?", a: "A session runs 50–60 minutes." },
    { q: "Can I book an online session or a home visit instead of visiting the centre?", a: "Yes. Every booking lets you choose in-person at the Sector 51 centre, an online session, or a home visit. Home-visit charges may increase with distance." },
    { q: "How do I book an appointment with a psychologist in Noida?", a: "Open the booking page, tap any open slot, enter your details and pay securely with UPI, card or netbanking. Your appointment is confirmed instantly." },
    { q: "I have already visited — how do I book a follow-up?", a: "Use the Follow-up tab on the booking page and enter the phone number you booked with. We recognise you, so you can pick a new slot straight away." },
    { q: "Can I reschedule or cancel my appointment?", a: "Use the Reschedule tab on the booking page to move your session to another time. To cancel, message us on WhatsApp." },
    ...(pkgs.length ? [{ q: "Do you offer therapy packages?", a: `Yes. Multi-session packages are available: ${pkgs.slice(0, 4).map(k => `${k.name} (${k.sessionsCount} sessions, ${inr(k.price)})`).join("; ")}. You can choose one in the booking flow.` }] : []),
    { q: "Is my information kept confidential?", a: "Your details are used only to manage your booking and are handled as described in our Privacy Policy." },
  ];
}

function buildSeoGraph(p) {
  const prices = [p?.individual_inperson, p?.individual_online, p?.individual_homevisit, p?.couple_inperson, p?.couple_online, p?.couple_homevisit].map(Number).filter(n => n > 0);
  const offer = (name, price) => price ? ({ "@type": "Offer", price: String(price), priceCurrency: "INR", itemOffered: { "@type": "MedicalTherapy", name } }) : null;
  const offers = [
    offer("Individual therapy session — in-person, Noida", p?.individual_inperson),
    offer("Individual therapy session — online", p?.individual_online),
    offer("Individual therapy session — home visit", p?.individual_homevisit),
    offer("Couple therapy session — in-person, Noida", p?.couple_inperson),
    offer("Couple therapy session — online", p?.couple_online),
    offer("Couple therapy session — home visit", p?.couple_homevisit),
  ].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["MedicalClinic", "LocalBusiness"],
        "@id": CENTRE_ID,
        name: "Choose Your Therapist — Noida Centre",
        alternateName: ["CYT Noida", "Choose Your Therapist LLP"],
        url: PAGE_URL,
        telephone: "+918077757951",
        email: "Chooseyourtherapist@gmail.com",
        image: `${SITE}/og-noida-appointment-v3.png`,
        logo: `${SITE}/favicon.png`,
        description: "Psychologists and therapists at the Choose Your Therapist centre in Sector 51, Noida — individual and couple sessions in-person, online or as a home visit.",
        medicalSpecialty: "Psychiatric",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Gate No-3, D-137, near LPS Global School, Block D, Sector 51",
          addressLocality: "Noida",
          addressRegion: "Uttar Pradesh",
          postalCode: "201301",
          addressCountry: "IN",
        },
        geo: { "@type": "GeoCoordinates", latitude: 28.5821626, longitude: 77.3716335 },
        hasMap: MAPS_URL,
        areaServed: [
          { "@type": "City", name: "Noida" },
          { "@type": "AdministrativeArea", name: "Delhi NCR" },
        ],
        ...(prices.length ? { priceRange: `${inr(Math.min(...prices))}–${inr(Math.max(...prices))}` } : {}),
        paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking",
        currenciesAccepted: "INR",
        sameAs: [
          "https://www.instagram.com/chooseyourtherapist",
          "https://www.facebook.com/chooseyourtherapist",
          "https://twitter.com/CYT_India",
        ],
        ...(offers.length ? { hasOfferCatalog: { "@type": "OfferCatalog", name: "Therapy sessions at CYT Noida", itemListElement: offers } } : {}),
        potentialAction: {
          "@type": "ReserveAction",
          name: "Book a session",
          target: { "@type": "EntryPoint", urlTemplate: PAGE_URL, actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"] },
          result: { "@type": "Reservation", name: "Therapy appointment at CYT Noida" },
        },
      },
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: SEO_TITLE,
        description: SEO_DESC,
        inLanguage: "en-IN",
        about: { "@id": CENTRE_ID },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Psychologist in Noida & Delhi", item: `${SITE}/psychologist-in-noida-delhi` },
          { "@type": "ListItem", position: 3, name: "Book at the Noida centre", item: PAGE_URL },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: seoFaq(p).map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STEP_LABELS = ["You", "Session", "Payment"];
const MATRIX_DAYS = 10;

function dateLabel(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return { value: dateStr, weekday: WEEKDAY_SHORT[dt.getDay()], day: dt.getDate(), month: MONTH_SHORT[dt.getMonth()] };
}

function slotStartMinutes(label) {
  const [time, ampm] = label.split(" - ")[0].split(" ");
  let [h, m] = time.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function priceFieldFor(sessionMode, format) {
  const fmt = format === "home-visit" ? "homevisit" : format === "online" ? "online" : "inperson";
  const mode = sessionMode === "couple" ? "couple" : "individual";
  return `${mode}_${fmt}`;
}

// Slot times are always IST regardless of the viewer's own timezone — build
// the true UTC instant by constructing as if UTC, then undoing the +5:30
// offset, so a live countdown is correct no matter where the browser is.
function slotStartInstant(dateStr, slotLabel) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const startMin = slotStartMinutes(slotLabel);
  const utcMs = Date.UTC(y, m - 1, d, Math.floor(startMin / 60), startMin % 60) - (5 * 60 + 30) * 60000;
  return new Date(utcMs);
}

function mmss(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// A short confetti burst — used to celebrate a slot getting booked live,
// spotted via the auto-refreshing slots table. No external library: a
// plain canvas overlay that removes itself when the animation ends.
function fireConfetti() {
  if (typeof window === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const colors = ["#1a6b3a", "#f59e0b", "#dc2626", "#3b82f6", "#a855f7", "#16a34a"];
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.3,
    w: 5 + Math.random() * 4,
    h: 3 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 3,
    rotation: Math.random() * 360,
    vr: (Math.random() - 0.5) * 10,
  }));
  const start = Date.now();
  const duration = 2600;
  function tick() {
    const elapsed = Date.now() - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rotation += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (elapsed < duration) requestAnimationFrame(tick);
    else canvas.remove();
  }
  tick();
}

// True when any cell that was open (or a last-minute request slot) in the
// previous grid is now booked — i.e. someone just took it.
function hasNewlyBooked(prevGrid, nextGrid) {
  if (!prevGrid) return false;
  return Object.keys(nextGrid).some(
    (key) => nextGrid[key] === "taken" && (prevGrid[key] === "open" || prevGrid[key] === "lastMinute")
  );
}

// Razorpay's checkout script pulls in ~80 more requests, so it is fetched only when the client gets
// to the payment step (or taps pay), not on every visit to the slots table.
function loadRazorpay() {
  if (typeof window === "undefined" || window.Razorpay || document.getElementById("rzp-checkout-js")) return;
  const el = document.createElement("script");
  el.id = "rzp-checkout-js";
  el.src = "https://checkout.razorpay.com/v1/checkout.js";
  el.async = true;
  document.body.appendChild(el);
}

function waitForRazorpay(timeout = 12000) {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve();
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (typeof window !== "undefined" && window.Razorpay) {
        clearInterval(iv);
        resolve();
      } else if (Date.now() - t0 > timeout) {
        clearInterval(iv);
        reject(new Error("Payment library failed to load. Please check your connection and retry."));
      }
    }, 150);
  });
}

// Fetches an open-days x time-slots matrix for a given booking type in one
// call — the server already limits to future, notice-window-safe slots.
// Shared by the full-page New/Follow-up slot picker and the Reschedule tab.
async function fetchSlotsMatrix(type) {
  const res = await fetch(`${apiUrl}/noida-appointments/slots-matrix?type=${type}`);
  const json = await res.json();
  const all = json?.status ? (json.data || []) : [];
  const dates = Array.from(new Set(all.map(s => s.date))).sort().slice(0, MATRIX_DAYS);
  const dateSet = new Set(dates);
  const times = Array.from(new Set(all.filter(s => dateSet.has(s.date)).map(s => s.slot)))
    .sort((a, b) => slotStartMinutes(a) - slotStartMinutes(b));
  const grid = {};
  const lastOne = {}; // shared slots (several clients an hour) down to their last place
  all.forEach(s => {
    if (!dateSet.has(s.date)) return;
    grid[`${s.date}|${s.slot}`] = s.booked ? "taken" : s.past ? "past" : (s.lastMinute ? "lastMinute" : "open");
    if (!s.booked && !s.past && s.cap > 1 && s.left === 1) lastOne[`${s.date}|${s.slot}`] = true;
  });
  return { dates, times, grid, lastOne };
}

// Reusable date x time availability table — an open cell is a clickable
// button, booked/not-opened cells are inert. A "lastMinute" cell (inside
// the last-minute window) is still clickable but styled distinctly, since
// picking it starts the request-and-wait flow instead of an instant book.
// `disableLastMinute` makes those cells inert too — used for Reschedule,
// which doesn't support the request flow. `selected` (optional
// {date, slot}) highlights the currently-picked cell.
// On a phone there's no room for 10 day-columns, so the table shows 5 days
// at a time with prev/next buttons (`isMobile`) instead of scrolling sideways.
// `header` sits beside the pager on mobile and above the table otherwise.
const MOBILE_PAGE_DAYS = 5;

const WA_NUMBER = "918077757951";
// Where this visit came from, for the reception screen's live "viewing now" breakdown. Worked out once
// per tab and kept for the session, so moving around the page doesn't turn it into "direct".
// Order: explicit link tags (?src= / ?ref= / utm_source, ad click ids) → in-app browsers → the referrer.
const SOURCE_ALIASES = {
  wa: "whatsapp", whatsapp: "whatsapp", ig: "instagram", insta: "instagram", instagram: "instagram",
  fb: "facebook", facebook: "facebook", meta: "facebook", google: "google", gads: "google-ads", adwords: "google-ads",
  yt: "youtube", youtube: "youtube", linkedin: "linkedin", li: "linkedin", twitter: "twitter", x: "twitter",
  snapchat: "snapchat", telegram: "telegram", tg: "telegram", email: "email", mail: "email", newsletter: "email",
  sms: "sms", qr: "qr", website: "website", site: "website",
};
function visitSource() {
  if (typeof window === "undefined") return "direct";
  try { const kept = sessionStorage.getItem("cyt_na_src"); if (kept) return kept; } catch { /* storage blocked */ }
  let src = "direct";
  try {
    const q = new URLSearchParams(window.location.search);
    const tag = (q.get("src") || q.get("utm_source") || q.get("source") || "").trim().toLowerCase();
    const ref = (q.get("ref") || q.get("referral") || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 32);
    const ua = navigator.userAgent || "";
    let refHost = "";
    try { refHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "").toLowerCase() : ""; } catch { /* bad referrer */ }
    if (ref) src = `ref:${ref}`;
    else if (tag) src = SOURCE_ALIASES[tag] || (/^[a-z0-9_-]{1,32}$/.test(tag) ? `ref:${tag}` : "other");
    else if (q.get("gclid") || q.get("gbraid") || q.get("wbraid")) src = "google-ads";
    else if (q.get("fbclid")) src = /Instagram/i.test(ua) ? "instagram" : "facebook";
    else if (q.get("igshid")) src = "instagram";
    else if (/Instagram/i.test(ua)) src = "instagram";
    else if (/FBAN|FBAV|FB_IAB/i.test(ua)) src = "facebook";
    else if (/LinkedInApp/i.test(ua)) src = "linkedin";
    else if (/Snapchat/i.test(ua)) src = "snapchat";
    else if (/WhatsApp/i.test(ua)) src = "whatsapp";
    else if (/Telegram/i.test(ua)) src = "telegram";
    else if (refHost) {
      if (/(^|\.)chooseyourtherapist\.in$/.test(refHost)) src = "website";
      else if (/whatsapp\.com$|^wa\.me$/.test(refHost)) src = "whatsapp";
      else if (/instagram\.com$/.test(refHost)) src = "instagram";
      else if (/facebook\.com$|fb\.com$|^m\.me$/.test(refHost)) src = "facebook";
      else if (/googleadservices\.com$|doubleclick\.net$/.test(refHost)) src = "google-ads";
      else if (/(^|\.)google\.[a-z.]+$/.test(refHost)) src = "google";
      else if (/youtube\.com$|youtu\.be$/.test(refHost)) src = "youtube";
      else if (/linkedin\.com$|lnkd\.in$/.test(refHost)) src = "linkedin";
      else if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(refHost)) src = "twitter";
      else if (/telegram\.(org|me)$|^t\.me$/.test(refHost)) src = "telegram";
      else if (/mail\./.test(refHost)) src = "email";
      else src = `site:${refHost.replace(/[^a-z0-9.-]/g, "").slice(0, 44)}`;
    }
  } catch { /* fall back to direct */ }
  try { sessionStorage.setItem("cyt_na_src", src); } catch { /* storage blocked */ }
  return src;
}

const waLink = (text) =>`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

// One consistent icon style everywhere instead of emoji, which render
// differently on every phone.
const Ic = ({ I, s = 16 }) => <I aria-hidden="true" style={{ fontSize: s, verticalAlign: "-0.2em", flexShrink: 0 }} />;

// Same shape as the real table, so nothing jumps when the slots arrive.
const CENTER_ADDRESS = "Choose Your Therapist LLP, Gate No-3, D-137, near LPS Global School, Block D, Sector 51, Noida, Uttar Pradesh 201301";
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Choose+Your+Therapist+LLP+Sector+51+Noida";

function slotEndInstant(dateStr, slotLabel) {
  const start = slotStartInstant(dateStr, slotLabel);
  const endPart = (slotLabel || "").split(" - ")[1];
  if (!endPart) return new Date(start.getTime() + 60 * 60000);
  const [y, m, d] = dateStr.split("-").map(Number);
  const endMin = slotStartMinutes(endPart);
  return new Date(Date.UTC(y, m - 1, d, Math.floor(endMin / 60), endMin % 60) - (5 * 60 + 30) * 60000);
}

const icsStamp = (dt) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsEscape = (t) => String(t || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

function calendarEvent({ date, slot, online }) {
  const start = slotStartInstant(date, slot);
  const end = slotEndInstant(date, slot);
  const title = "Therapy session - Choose Your Therapist";
  const location = online ? "Online session" : CENTER_ADDRESS;
  const details = online
    ? "Your online session with Choose Your Therapist. The center will share the joining link."
    : "Please arrive 10 minutes early. Need to change the time? Use the Reschedule tab on chooseyourtherapist.in/noida-appointment.";
  const google = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + "&text=" + encodeURIComponent(title)
    + "&dates=" + icsStamp(start) + "/" + icsStamp(end)
    + "&details=" + encodeURIComponent(details)
    + "&location=" + encodeURIComponent(location);
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Choose Your Therapist//Noida Booking//EN", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + icsStamp(start) + "-" + Math.random().toString(36).slice(2, 10) + "@chooseyourtherapist.in",
    "DTSTAMP:" + icsStamp(new Date()),
    "DTSTART:" + icsStamp(start),
    "DTEND:" + icsStamp(end),
    "SUMMARY:" + icsEscape(title),
    "LOCATION:" + icsEscape(location),
    "DESCRIPTION:" + icsEscape(details),
    "BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY", "DESCRIPTION:Therapy session in 1 hour", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return { google, ics };
}

function downloadIcs(ics) {
  try {
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "therapy-session.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch { /* ignore — Google Calendar link still works */ }
}

// Animated tick + ticket-style confirmation shared by a fresh booking and a
// reschedule. `format` is "in-person" | "online" | "home-visit" | null (unknown:
// no address / directions shown).
function BookingSuccess({ title, text, dateStr, dateLbl, slot, rows, format, showAddress }) {
  const cal = calendarEvent({ date: dateStr, slot, online: format === "online" });
  const shareText = "My therapy session at Choose Your Therapist"
    + (format === "online" ? " (online)" : ", Sector 51 Noida")
    + ": " + (dateLbl ? dateLbl.weekday + ", " + dateLbl.day + " " + dateLbl.month : dateStr) + ", " + slot;
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(fireConfetti, 350);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="na-success">
      <div className="na-tick" aria-hidden="true">
        <svg viewBox="0 0 52 52">
          <circle className="na-tick-bg" cx="26" cy="26" r="24" />
          <circle className="na-tick-c" cx="26" cy="26" r="24" />
          <path className="na-tick-p" d="M15 27l8 8 14-16" />
        </svg>
      </div>
      <h2>{title}</h2>
      <p>{text}</p>
      <div className="na-ticket">
        <div className="na-ticket-top">
          {dateLbl && (
            <div className="na-ticket-date"><span>{dateLbl.weekday}</span><b>{dateLbl.day}</b><span>{dateLbl.month}</span></div>
          )}
          <div>
            <div className="na-ticket-time">{slot}</div>
            {rows[0] && <div className="na-ticket-sub">{rows[0][1]}</div>}
          </div>
        </div>
        {rows.length > 1 && (
          <>
            <div className="na-ticket-tear" />
            <div className="na-ticket-rows">
              {rows.slice(1).map(([k, v]) => <div className="na-ticket-row" key={k}><span>{k}</span><b>{v}</b></div>)}
            </div>
          </>
        )}
      </div>
      <div className="na-succ-actions">
        <a className="na-succ-btn" href={cal.google} target="_blank" rel="noopener noreferrer"><Ic I={CalendarMonthRounded} s={18} /> Google Calendar</a>
        <button type="button" className="na-succ-btn" onClick={() => downloadIcs(cal.ics)}><Ic I={DownloadRounded} s={18} /> Apple / Outlook</button>
        <a className="na-succ-btn" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"><Ic I={WhatsAppIcon} s={18} /> Share on WhatsApp</a>
      </div>
      {showAddress && (
        <div className="na-address-box">
          <div className="na-address-title"><Ic I={PlaceRounded} /> CYT Noida</div>
          <div className="na-address-text">Choose Your Therapist LLP<br />Gate No-3, D-137, near LPS Global School, Block D, Sector 51, Noida</div>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="na-address-link">Get Directions →</a>
        </div>
      )}
      {showAddress && <p className="na-succ-hint">Please arrive 10 minutes early.</p>}
    </div>
  );
}


// "Which therapist would you like?" — optional; the server only accepts therapists the
// admin offered who are still live. It records a preference, it doesn't lock the slot.
function TherapistPicker({ list, value, onChange, hint }) {
  if (!list || !list.length) return null;
  const initials = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div className="na-th">
      <div className="na-section-label">Therapist <span className="na-th-opt">(optional)</span></div>
      <div className="na-th-row" role="radiogroup" aria-label="Choose a therapist">
        <button type="button" role="radio" aria-checked={!value} className={`na-th-card ${!value ? "on" : ""}`} onClick={() => onChange("")}>
          <span className="na-th-av na-th-any" aria-hidden="true">?</span>
          <span className="na-th-body"><span className="na-th-name">No preference</span><span className="na-th-meta">First available</span></span>
        </button>
        {list.map(t => (
          <button key={t._id} type="button" role="radio" aria-checked={value === t._id} className={`na-th-card ${value === t._id ? "on" : ""}`} onClick={() => onChange(t._id)}>
            <span className="na-th-av" aria-hidden="true">
              {initials(t.name)}
              {t.image && <img src={thPhoto(t.image)} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = "none"; }} />}
            </span>
            <span className="na-th-body">
              <span className="na-th-name">{t.name}</span>
              <span className="na-th-meta">{[t.profileType, expLabel(t.experience)].filter(Boolean).join(" · ") || t.qualification || "Therapist"}</span>
              {t.reviewCount > 0 && <span className="na-th-rate" aria-label={`Rated ${t.rating} out of 5 from ${t.reviewCount} reviews`}><span className="na-th-star" aria-hidden="true">★</span> {t.rating.toFixed(1)} <span className="na-th-cnt">({t.reviewCount})</span></span>}
            </span>
          </button>
        ))}
      </div>
      <div className="na-th-hint">{hint || "We'll do our best to match your choice."}</div>
    </div>
  );
}

// year_of_exp is free text ("1-2 Years", "5") — only add the unit when it's missing.
const expLabel = (e) => (!e ? "" : /yr|year/i.test(e) ? String(e).replace(/years?/i, "yrs") : `${e} yrs`);
const thPhoto = (img) => (!img ? "" : /^https?:/.test(img) ? img : `${imagePath}/${img}`);
const thInitials = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();

function ThAvatar({ t, size }) {
  return (
    <span className="na-team-av" style={{ width: size, height: size, fontSize: size * 0.34 }} aria-hidden="true">
      {thInitials(t.name)}
      {t.image && <img src={thPhoto(t.image)} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = "none"; }} />}
    </span>
  );
}

// New clients meet the CYT Noida team after picking a slot: a list of the psychologists
// the admin offered, each opening a full profile. With therapist choice on they can pick
// one (or "No preference"); with it off the list is just "who you'll see" and Continue.
function TeamModal({ list, canChoose, slotLabel, onDone, onClose }) {
  const [openId, setOpenId] = useState(null);
  const [bioOpen, setBioOpen] = useState(false);
  const [allSkills, setAllSkills] = useState(false);
  const bodyRef = useRef(null);
  const t = list.find(x => x._id === openId) || null;
  const open = (id) => {
    setOpenId(id); setBioOpen(false); setAllSkills(false);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    if (id) track("noida_team_profile_view", { therapist_id: id });
  };
  const first = (n) => String(n || "").trim().split(/\s+/)[0];
  const meta = (x) => [x.profileType, expLabel(x.experience)].filter(Boolean).join(" · ");

  return (
    <div className="na-welcome-overlay" role="dialog" aria-modal="true" aria-label={canChoose ? "Choose your psychologist" : "Meet your psychologists"} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="na-welcome-modal na-team-modal">
        <button type="button" className="na-welcome-close" aria-label="Close" onClick={onClose}><CloseRounded style={{ fontSize: 18 }} /></button>
        {!t ? (
          <>
            <div className="na-team-head">
              <div className="na-welcome-title">{canChoose ? "Choose your psychologist" : "Meet your psychologists"}</div>
              <p className="na-welcome-sub">
                {canChoose ? "Tap a profile to know them better, or let us match you." : "Your session will be with one of our verified psychologists at CYT Noida."}
              </p>
              {slotLabel && <span className="na-team-slot"><Ic I={ScheduleRounded} s={14} /> {slotLabel}</span>}
            </div>
            <div className="na-team-body" ref={bodyRef}>
              {canChoose && (
                <button type="button" className="na-team-card na-team-any" onClick={() => onDone("")}>
                  <span className="na-team-av na-team-av-any" style={{ width: 52, height: 52 }} aria-hidden="true"><Ic I={BoltRounded} s={22} /></span>
                  <span className="na-team-info">
                    <span className="na-team-name">No preference</span>
                    <span className="na-team-meta">First available psychologist</span>
                  </span>
                  <span className="na-team-go" aria-hidden="true">›</span>
                </button>
              )}
              {list.map(x => (
                <button key={x._id} type="button" className="na-team-card" onClick={() => open(x._id)}>
                  <ThAvatar t={x} size={52} />
                  <span className="na-team-info">
                    <span className="na-team-name">{x.name}</span>
                    <span className="na-team-meta">{meta(x) || x.qualification || "Psychologist"}</span>
                    <span className="na-team-sub">
                      {x.reviewCount > 0 && <span className="na-team-rate"><span aria-hidden="true">★</span> {x.rating.toFixed(1)} ({x.reviewCount})</span>}
                      {x.languages?.length > 0 && <span>{x.languages.slice(0, 3).join(", ")}</span>}
                    </span>
                  </span>
                  <span className="na-team-view">View profile</span>
                </button>
              ))}
            </div>
            {!canChoose && (
              <div className="na-team-foot">
                <button type="button" className="na-team-cta" onClick={() => onDone("")}>Continue booking</button>
              </div>
            )}
          </>
        ) : (
          <>
            <button type="button" className="na-team-back" onClick={() => open(null)}><Ic I={ArrowBackRounded} s={18} /> All psychologists</button>
            <div className="na-team-body" ref={bodyRef}>
              <div className="na-team-hero">
                <ThAvatar t={t} size={84} />
                <div className="na-team-hero-txt">
                  <div className="na-team-hero-name">{t.name}</div>
                  <div className="na-team-meta">{t.profileType || "Psychologist"}</div>
                  {t.reviewCount > 0 && <div className="na-team-rate"><span aria-hidden="true">★</span> {t.rating.toFixed(1)} · {t.reviewCount} review{t.reviewCount > 1 ? "s" : ""}</div>}
                </div>
              </div>
              <div className="na-team-facts">
                {t.experience && <div><span>Experience</span><b>{expLabel(t.experience)}</b></div>}
                {t.languages?.length > 0 && <div><span>Languages</span><b>{t.languages.join(", ")}</b></div>}
                {t.qualification && <div className="wide"><span>Qualification</span><b>{t.qualification}</b></div>}
              </div>
              {t.bio && (
                <div className="na-team-sec">
                  <div className="na-team-sec-h">About</div>
                  <p className={`na-team-bio ${bioOpen ? "open" : ""}`}>{t.bio}</p>
                  {t.bio.length > 220 && <button type="button" className="na-team-more" onClick={() => setBioOpen(v => !v)}>{bioOpen ? "Show less" : "Read more"}</button>}
                </div>
              )}
              {t.expertise?.length > 0 && (
                <div className="na-team-sec">
                  <div className="na-team-sec-h">Helps with</div>
                  <div className="na-team-chips">
                    {(allSkills ? t.expertise : t.expertise.slice(0, 8)).map(s => <span key={s}>{s}</span>)}
                    {!allSkills && t.expertise.length > 8 && <button type="button" onClick={() => setAllSkills(true)}>+{t.expertise.length - 8} more</button>}
                  </div>
                </div>
              )}
              <a className="na-team-full" href={profilePath({ _id: t._id, name: t.name, profile_type: t.profileType, state: t.state })} target="_blank" rel="noopener noreferrer">See full profile &amp; reviews ↗</a>
            </div>
            <div className="na-team-foot">
              {canChoose
                ? <button type="button" className="na-team-cta" onClick={() => onDone(t._id)}>Book with {first(t.name)}</button>
                : <button type="button" className="na-team-cta" onClick={() => onDone("")}>Continue booking</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SlotsSkeleton({ cols }) {
  return (
    <div className="na-fullslots-scroll" role="status" aria-label="Loading available slots">
      <table className="na-fullslots-table">
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: cols }).map((_, i) => <th key={i}><span className="na-skel na-skel-head" /></th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }).map((_, r) => (
            <tr key={r}>
              <td className="na-time-col"><span className="na-skel na-skel-time" /></td>
              {Array.from({ length: cols }).map((_, c) => <td key={c}><span className="na-skel na-skel-cell" /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptySlots() {
  return (
    <div className="na-empty">
      <div className="na-empty-ic"><Ic I={EventBusyRounded} s={30} /></div>
      <div className="na-empty-title">No slots are open right now</div>
      <p className="na-empty-text">We open new times regularly. Message us and we'll find one that suits you.</p>
      <a className="na-wa-btn" href={waLink("Hi, I'd like to book a session at CYT Noida.")} target="_blank" rel="noopener noreferrer">
        <Ic I={WhatsAppIcon} s={18} /> WhatsApp us
      </a>
    </div>
  );
}

function istTodayStr() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "10:00 AM" -> "10 AM" (keeps "10:30 AM"), to fit the narrow time column.
function shortTime(label) {
  return label.split(" - ")[0].replace(":00 ", " ");
}

// Quick time-of-day filter so a client can jump to "evenings" instead of scanning every row.
const PERIODS = [
  { key: "morning", label: "Morning", test: (m) => m < 12 * 60 },
  { key: "afternoon", label: "Afternoon", test: (m) => m >= 12 * 60 && m < 17 * 60 },
  { key: "evening", label: "Evening", test: (m) => m >= 17 * 60 },
];

function SlotsTable({ matrix, loading, selected, disableLastMinute, isMobile, isTablet, header, trackAs = "new", fit = false, chipsHost = null, offerAt = null }) {
  // Phones swipe sideways through all the days (wide columns, time column pinned); tablets fit all 10
  // and share the compact header (weekday + day circle) and short time labels.
  const compact = isMobile || isTablet;
  const [swipe, setSwipe] = useState({ first: 0, last: 0 }); // first/last day column currently in view (phones)
  const [period, setPeriod] = useState("");
  const scrollRef = useRef(null);
  const measureSwipe = () => {
    const el = scrollRef.current;
    if (!el || !isMobile) return;
    const ths = Array.from(el.querySelectorAll("thead th")).slice(1);
    if (!ths.length) return;
    const timeW = el.querySelector("thead th").offsetWidth;
    const left = el.scrollLeft;
    const right = left + el.clientWidth;
    let first = ths.findIndex(t => t.offsetLeft + t.offsetWidth > left + timeW + 6);
    if (first < 0) first = ths.length - 1;
    let last = first;
    ths.forEach((t, i) => { if (t.offsetLeft + 6 < right) last = i; });
    setSwipe(sw => (sw.first === first && sw.last === last ? sw : { first, last }));
  };
  const scrollToDate = (d) => {
    const el = scrollRef.current;
    if (!el) return;
    const th = el.querySelectorAll("thead th")[matrix.dates.indexOf(d) + 1];
    if (th) el.scrollTo({ left: Math.max(0, th.offsetLeft - el.querySelector("thead th").offsetWidth), behavior: "smooth" });
  };
  const swipeBy = (dir) => {
    const el = scrollRef.current;
    const th = el && el.querySelector("thead th:nth-child(2)");
    if (el) el.scrollBy({ left: dir * (th ? th.offsetWidth : 90) * 2, behavior: "smooth" });
  };
  useEffect(() => { measureSwipe(); }, [isMobile, loading, period, matrix.dates.length, matrix.times.length]);
  // Fit mode: the parent gives the table a fixed-height box; pick the row height that makes every row fit inside it, no scrolling.
  useEffect(() => {
    if (!fit) return;
    const el = scrollRef.current;
    if (!el) return;
    const calc = () => {
      const rows = el.querySelectorAll("tbody tr").length;
      const table = el.querySelector("table");
      if (!rows || !table) return;
      const head = el.querySelector("thead");
      const spacing = parseFloat(getComputedStyle(table).borderSpacing) || 5;
      const avail = el.clientHeight - (head ? head.offsetHeight : 0) - spacing * (rows + 2);
      const h = Math.floor(avail / rows);
      el.style.setProperty("--na-cell-h", `${Math.max(22, Math.min(56, h))}px`);
    };
    calc();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit, loading, period, matrix.times.length, matrix.dates.length]);
  // `header` is an element, or a function that receives the quick controls so a
  // page can seat them on its own title lines instead of adding a row above the table.
  const inlineQuick = typeof header === "function";
  const renderHeader = (quick) => (inlineQuick ? header(quick) : header);
  if (loading) return <>{renderHeader({})}<SlotsSkeleton cols={isMobile ? MOBILE_PAGE_DAYS : 10} /></>;
  if (!matrix.dates.length) return <>{renderHeader({})}<EmptySlots /></>;

  const visibleDates = matrix.dates;
  const today = istTodayStr();
  const lastIdx = matrix.dates.length - 1;
  const first = dateLabel(visibleDates[isMobile ? Math.min(swipe.first, lastIdx) : 0]);
  const last = dateLabel(visibleDates[isMobile ? Math.min(Math.max(swipe.last, swipe.first), lastIdx) : lastIdx]);
  const rangeLabel = first.month === last.month ? `${first.day} – ${last.day} ${last.month}` : `${first.day} ${first.month} – ${last.day} ${last.month}`;

  // Only offer periods that actually have rows; a stale choice (rows vanished on refresh) falls back to All.
  const periodsPresent = PERIODS.filter(p => matrix.times.some(t => p.test(slotStartMinutes(t))));
  const activePeriod = periodsPresent.find(p => p.key === period);
  const visibleTimes = activePeriod ? matrix.times.filter(t => activePeriod.test(slotStartMinutes(t))) : matrix.times;

  const choosePeriod = (key) => {
    setPeriod(key);
    track("noida_time_filter", { booking_type: trackAs, period: key || "all" });
  };
  const filterChips = periodsPresent.length > 1 && (
    <div className="na-chips" role="group" aria-label="Filter by time of day">
      <button type="button" className={`na-chip ${!activePeriod ? "on" : ""}`} onClick={() => choosePeriod("")}>All</button>
      {periodsPresent.map(p => (
        <button key={p.key} type="button" className={`na-chip ${activePeriod?.key === p.key ? "on" : ""}`} onClick={() => choosePeriod(p.key)}>{p.label}</button>
      ))}
    </div>
  );

  return (
    <>
      {isMobile ? (
        <div className="na-pager-row">
          <div className="na-pager-head"><div className="na-pager-line">{renderHeader({ chips: chipsHost ? null : filterChips })}{!chipsHost && filterChips}</div><div className="na-pager-range">{rangeLabel} · IST{swipe.last < lastIdx ? " · swipe →" : ""}</div></div>
        </div>
      ) : renderHeader({ chips: chipsHost ? null : filterChips })}
    {chipsHost && filterChips ? createPortal(filterChips, chipsHost) : null}
    {!inlineQuick && !chipsHost && !isMobile && filterChips && <div className="na-quick-row">{filterChips}</div>}
    <div className={`na-fullslots-scroll ${fit ? "fit" : ""} ${isMobile ? "swipe" : ""}`} ref={scrollRef} onScroll={isMobile ? measureSwipe : undefined}>
      <table className="na-fullslots-table">
        <thead>
          <tr>
            <th></th>
            {visibleDates.map((d, i) => {
              const lbl = dateLabel(d);
              const isToday = d === today;
              if (!compact) return <th key={d} className={isToday ? "na-th-today" : undefined}>{isToday ? "Today" : lbl.weekday}<br />{lbl.day} {lbl.month}</th>;
              return (
                <th key={d} className={`na-th-m ${isToday ? "na-th-today" : ""}`}>
                  <div className="na-wd">{isToday ? "Today" : lbl.weekday}</div>
                  <div className={`na-dn ${isToday ? "today" : ""}`}>{lbl.day}</div>
                  {(i === 0 || lbl.day === 1) && <div className="na-mo">{lbl.month}</div>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {visibleTimes.map((t, ri) => (
            <tr key={t}>
              <td className="na-time-col">{compact && !isMobile ? shortTime(t) : t.split(" - ")[0]}</td>
              {visibleDates.map((d, ci) => {
                const tdProps = { className: d === today ? "na-td-today" : undefined, style: { "--na-i": ri + ci } };
                const state = matrix.grid[`${d}|${t}`];
                const isSelected = selected && selected.date === d && selected.slot === t;
                if (state === "lastMinute" && disableLastMinute) {
                  return (
                    <td key={d} {...tdProps}>
                      <span className="na-slotcell closed" title="Starting too soon to reschedule into" aria-label="Starting too soon to reschedule into" />
                    </td>
                  );
                }
                if (state === "open" || state === "lastMinute") {
                  const isLM = state === "lastMinute";
                  const hasOffer = !isLM && offerAt && offerAt(d, t);
                  return (
                    <td key={d} {...tdProps}>
                      <button
                        type="button"
                        className={`na-slotcell ${isLM ? "lastminute" : "open"} ${isSelected ? "selected" : ""} ${hasOffer ? "offer" : ""}`}
                        title={isSelected ? `Selected — ${t}` : isLM ? `Request ${t} — starting soon` : hasOffer ? `Book ${t} — offer slot` : `Book ${t}`}
                        onClick={() => {
                          track("noida_slot_click", { booking_type: trackAs, slot_date: d, slot_time: t, last_minute: isLM });
                          haptic();
                          matrix.onPick(d, t, isLM);
                        }}
                      >
                        {isLM ? (isSelected ? <Ic I={CheckRounded} s={16} /> : "!") : <span className="na-wm">cyt<i className="na-wm-dot" aria-hidden="true" /></span>}
                        {hasOffer && <i className="na-offer-tag" aria-hidden="true">%</i>}
                        {!isLM && matrix.lastOne?.[`${d}|${t}`] && <i className="na-left-tag">1 left</i>}
                      </button>
                    </td>
                  );
                }
                // "Booked" is deliberately anonymous for everyone else — but if this is the
                // slot the current visitor themselves has, on their own device, say so.
                const isMine = state === "taken" && matrix.mine && matrix.mine.date === d && matrix.mine.slot === t;
                const label = isMine ? `Your booking${matrix.mine.name ? ` — ${matrix.mine.name.split(" ")[0]}` : ""}` : state === "taken" ? "Booked" : state === "past" ? "Time has passed" : "Not opened";
                return (
                  <td key={d} {...tdProps}>
                    <span className={`na-slotcell ${state || "closed"} ${isMine ? "mine" : ""}`} title={label} aria-label={label}>
                      {isMine ? <span className="na-taken-stamp mine">You{matrix.mine.name ? ` · ${matrix.mine.name.split(" ")[0]}` : ""}</span> : state === "taken" ? <span className="na-taken-stamp">Booked</span> : state === "past" ? <span className="na-past-label">Passed</span> : null}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}


// ── "Why are you leaving?" popup ────────────────────────────────────────
// Shown once per visit when someone presses this page's back button, the browser/phone
// back button, or (desktop) heads for the tab's close button. The reason is one tap; the
// phone number is optional and only for a callback. Answers land in the admin
// (CYT Noida → Needs attention → Exit feedback).
const EXIT_REASONS = [
  ["price_high", "Price is too high"],
  ["no_suitable_slot", "No slot at a time that suits me"],
  ["just_exploring", "Just checking — will book later"],
  ["centre_far", "The centre is too far for me"],
  ["unsure_what_to_book", "Not sure what to book"],
  ["need_more_info", "I have questions before booking"],
  ["payment_issue", "Payment didn't work"],
  ["booking_confusing", "Booking felt confusing"],
  ["other", "Something else"],
];
// Once someone has answered, don't ask again for the rest of their visit (this tab).
// Skipping or choosing "Keep booking" only stops it for the current page load.
const EXIT_ANSWERED_KEY = "cyt_na_exit_answered";
function exitAlreadyAnswered() {
  try { return sessionStorage.getItem(EXIT_ANSWERED_KEY) === "1"; } catch { return false; }
}
function markExitAnswered() {
  try { sessionStorage.setItem(EXIT_ANSWERED_KEY, "1"); } catch { /* storage blocked */ }
}

function ExitFeedbackModal({ trigger, stage, defaultPhone, onSubmit, onStay, onSkip }) {
  const [reason, setReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [phone, setPhone] = useState(defaultPhone || "");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const leaving = trigger !== "exit_intent";

  // put the most likely reason for where they are first
  const reasons = stage === "payment"
    ? [...EXIT_REASONS.filter(([k]) => k === "payment_issue"), ...EXIT_REASONS.filter(([k]) => k !== "payment_issue")]
    : EXIT_REASONS;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onStay(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onStay]);

  const submit = async () => {
    if (!reason) { setErr("Please pick a reason."); return; }
    if (phone && !/^[0-9]{10}$/.test(phone)) { setErr("Enter a 10-digit number, or leave it empty."); return; }
    setErr(""); setSending(true);
    await onSubmit({ reason, otherText: reason === "other" ? otherText.trim() : "", phone });
    setSending(false); setDone(true);
  };

  return (
    <div className="na-exit-overlay" role="dialog" aria-modal="true" aria-labelledby="na-exit-title" onClick={(e) => { if (e.target === e.currentTarget) onStay(); }}>
      <div className="na-exit-modal">
        <button type="button" className="na-welcome-close" aria-label="Close and keep booking" onClick={onStay}><CloseRounded style={{ fontSize: 18 }} /></button>
        {done ? (
          <div className="na-exit-done">
            <span className="na-exit-done-icon"><CheckRounded /></span>
            <div className="na-exit-title">Thank you!</div>
            <p className="na-exit-sub">{phone ? "Our team will call you shortly to help." : "Your answer helps us make booking better."}</p>
          </div>
        ) : (
          <>
            <div id="na-exit-title" className="na-exit-title">Before you go — what stopped you?</div>
            <p className="na-exit-sub">One tap helps us improve. It takes 5 seconds.</p>

            <div className="na-exit-reasons" role="radiogroup" aria-label="Reason for leaving">
              {reasons.map(([key, label]) => (
                <button key={key} type="button" role="radio" aria-checked={reason === key}
                  className={`na-exit-reason ${reason === key ? "on" : ""}`}
                  onClick={() => { setReason(key); setErr(""); }}>
                  {reason === key && <CheckRounded style={{ fontSize: 15 }} />} {label}
                </button>
              ))}
            </div>
            {reason === "other" && (
              <input className="na-exit-input" type="text" maxLength={300} autoFocus placeholder="Tell us briefly (optional)"
                value={otherText} onChange={(e) => setOtherText(e.target.value)} aria-label="Other reason" />
            )}

            <label className="na-exit-label" htmlFor="na-exit-phone">Want a callback? <span>(optional)</span></label>
            <input id="na-exit-phone" className="na-exit-input" type="tel" inputMode="numeric" autoComplete="tel-national"
              placeholder="10-digit mobile number" value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErr(""); }} />
            <p className="na-exit-hint">We'll call once to help you book — no spam.</p>

            {err && <p className="na-exit-err" role="alert">{err}</p>}

            <div className="na-exit-actions">
              <button type="button" className="na-exit-btn primary" disabled={!reason || sending} onClick={submit}>
                {sending ? "Sending…" : phone ? "Submit & request callback" : "Submit"}
              </button>
              <button type="button" className="na-exit-btn ghost" onClick={onStay}>Keep booking</button>
            </div>
            {leaving && <button type="button" className="na-exit-skip" onClick={onSkip}>Skip and leave</button>}
          </>
        )}
      </div>
    </div>
  );
}

// ── Public offers (admin → Coupons → "show on booking page") ─────────────
const OFFER_CODE_KEY = "cyt_na_offer_code";
function offerMatchesSlot(offer, dateStr, slotLabel) {
  if (!offer || offer.appliesTo === "package") return false;
  const [y, mo, d] = String(dateStr || "").split("-").map(Number);
  if (!y) return false;
  const wd = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  if (offer.days?.length && offer.days.length < 7 && !offer.days.includes(wd)) return false;
  const start = slotStartMinutes(slotLabel);
  const hm = (v) => { if (!v || !/^\d{1,2}:\d{2}$/.test(String(v))) return null; const [h, m] = String(v).split(":").map(Number); return h * 60 + m; };
  const f = hm(offer.timeFrom), t = hm(offer.timeTo);
  if (f != null && start < f) return false;
  if (t != null && start >= t) return false;
  return true;
}

function OfferClaimModal({ offer, prefill, onClose, onClaimed }) {
  const [v, setV] = useState({ name: prefill.name || "", phone: prefill.phone || "", email: prefill.email || "", consent: true });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null); // { code, emailed }

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (v.name.trim().length < 2) return setErr("Please enter your name.");
    if (!/^\d{10}$/.test(v.phone)) return setErr("Please enter a valid 10-digit phone number.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) return setErr("Please enter a valid email address.");
    if (!v.consent) return setErr("Please agree to receive the code.");
    setBusy(true);
    try {
      const data = await fetch(`${apiUrl}/noida-appointments/offers/${offer.id}/claim`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: v.name.trim(), phone: v.phone, email: v.email.trim(), consent: v.consent }),
      }).then((r) => r.json());
      if (data?.status) {
        setDone(data.data);
        track("noida_offer_claimed", { offer: offer.title });
        onClaimed({ code: data.data.code, name: v.name.trim(), phone: v.phone, email: v.email.trim() });
      } else setErr(data?.message || "Couldn't get your code. Please try again.");
    } catch {
      setErr("Couldn't get your code. Please try again.");
    }
    setBusy(false);
  };

  return (
    <div className="na-exit-overlay" role="dialog" aria-modal="true" aria-labelledby="na-offer-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="na-exit-modal">
        <button type="button" className="na-welcome-close" aria-label="Close" onClick={onClose}><CloseRounded style={{ fontSize: 18 }} /></button>
        {done ? (
          <div className="na-exit-done">
            <span className="na-exit-done-icon"><CheckRounded /></span>
            <div className="na-exit-title">Here&rsquo;s your code</div>
            <div className="na-offer-code">{done.code}</div>
            <p className="na-exit-sub">
              {done.emailed ? <>We&rsquo;ve also emailed it to <b>{v.email}</b> (check spam if you don&rsquo;t see it).</> : "Save this code — our email may take a few minutes."}
              {" "}It&rsquo;s filled in for you at checkout.
            </p>
            <button type="button" className="na-exit-btn primary" style={{ width: "100%" }} onClick={onClose}>Pick a slot</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="na-offer-pill">{offer.discount}</div>
            <div id="na-offer-title" className="na-exit-title">{offer.title}</div>
            <p className="na-exit-sub">
              {offer.window ? <>For sessions on <b>{offer.window}</b>. </> : null}
              Enter your details and we&rsquo;ll email you a personal code.
            </p>
            <label className="na-exit-label" htmlFor="na-of-name">Name</label>
            <input id="na-of-name" className="na-exit-input" autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
            <label className="na-exit-label" htmlFor="na-of-phone">Phone</label>
            <input id="na-of-phone" className="na-exit-input" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number"
              value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
            <label className="na-exit-label" htmlFor="na-of-email">Email</label>
            <input id="na-of-email" className="na-exit-input" type="email" autoComplete="email" placeholder="you@example.com"
              value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
            <label className="na-offer-consent">
              <input type="checkbox" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} />
              <span>Send me this code and occasional offers from Choose Your Therapist.</span>
            </label>
            {err && <p className="na-exit-err" role="alert">{err}</p>}
            <div className="na-exit-actions">
              <button type="submit" className="na-exit-btn primary" disabled={busy}>{busy ? "Sending…" : "Email me the code"}</button>
            </div>
            <p className="na-exit-hint" style={{ marginTop: 10 }}>Works once, with this phone number{offer.validUntil ? ` · book by ${offer.validUntil}` : ""}.</p>
          </form>
        )}
      </div>
    </div>
  );
}

// "· last session on 28 Sep" after the sessions-left count (from the lookup), so a
// returning client can see their package is counted right.
function lastSessionTxt(cr) {
  if (!cr?.lastUsedAt) return "";
  const d = new Date(cr.lastUsedAt);
  return isNaN(d) ? "" : ` · last session on ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}`;
}

export default function NoidaAppointment({ seoPricing = null, seoReviews = null }) {
  const [bookingType, setBookingType] = useState("new"); // "new" | "followup" | "reschedule"
  const [phase, setPhase] = useState("slots"); // "identify" | "slots" | "form" — meaningful for new/followup
  const [step, setStep] = useState(1);

  // "Why are you here" (new / follow-up / reschedule) prompt — triggered the moment a
  // visitor taps an open slot on the (default) New Client grid without ever having said
  // which they are, not on page load. Using the top tabs directly also counts as having
  // said so, and stops it firing at all for the rest of this visit.
  const [showWelcome, setShowWelcome] = useState(false);
  const [chipsHost, setChipsHost] = useState(null); // slot under the tabs where the time-of-day chips render
  const [intentConfirmed, setIntentConfirmed] = useState(false);
  // dismissWelcome itself is defined further down, once switchTab/handlePickSlot/
  // pendingPick all exist — it needs all three.

  // If this device already has a recognised phone number, find out whether it has an
  // upcoming booking — lets the slots table label that one cell as theirs (instead of
  // the anonymous "Booked" every other taken slot shows) without the public API ever
  // revealing whose booking it is to anyone else.
  const [myUpcoming, setMyUpcoming] = useState(null); // { name, date, slot, type } | null
  // Someone who has booked (or been found) on this device before — greeted by name, and the
  // Follow-up tab comes pre-filled with their number. "Not you?" forgets them.
  const [returning, setReturning] = useState(null); // { phone, name } | null
  useEffect(() => {
    const phone = loadKnownPhone();
    if (!phone) return;
    setReturning({ phone, name: loadKnownName() });
    fetch(`${apiUrl}/noida-appointments/upcoming?phone=${phone}`)
      .then(r => r.json())
      .then(data => {
        if (data?.status && data.data?.found) {
          setMyUpcoming(data.data);
          if (data.data.name) setReturning(r => (r && !r.name ? { ...r, name: data.data.name } : r));
        }
      })
      .catch(() => { /* not critical — the table just won't highlight a cell */ });
  }, []);

  // Phone layout: paged 5-day table and a bottom "Selected → Continue" bar
  // instead of a table that scrolls sideways. Desktop is unchanged.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  // Tablet layout: a touch screen wider than a phone (iPad). Portrait stacks
  // the table above a "Selected" card; landscape puts a "Your booking" panel
  // beside the table. Mouse-driven desktops keep the original layout.
  const [tablet, setTablet] = useState(false);
  const [landscape, setLandscape] = useState(false);
  useEffect(() => {
    const mqT = window.matchMedia("(min-width: 641px) and (min-height: 600px) and (pointer: coarse)");
    const mqL = window.matchMedia("(orientation: landscape)");
    const ua = navigator.userAgent || "";
    const isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const sync = () => { setTablet(mqT.matches || (isIPad && window.innerWidth >= 641)); setLandscape(mqL.matches); };
    sync();
    mqT.addEventListener("change", sync);
    mqL.addEventListener("change", sync);
    return () => { mqT.removeEventListener("change", sync); mqL.removeEventListener("change", sync); };
  }, []);
  const tabletLandscape = tablet && landscape;
  // On phones and tablets a tap only selects a slot; Continue moves on.
  const usePendingPick = true;

  // The site-wide cookie banner is fixed to the bottom of the screen and sits
  // above everything; lift the page's own bottom bars clear of it until it's dismissed.
  const [cookieH, setCookieH] = useState(0);
  useEffect(() => {
    if (!isMobile) { setCookieH(0); return; }
    const read = () => setCookieH(document.getElementById("cyt-cookie-consent-bar")?.offsetHeight || 0);
    read();
    const iv = setInterval(read, 400);
    return () => clearInterval(iv);
  }, [isMobile]);
  // On mobile a tap only selects a slot; the bottom bar's Continue moves on.
  const [pendingPick, setPendingPick] = useState(null); // { date, slot, isLM } | null

  // Live-visitor heartbeat for the reception screen's "viewing now" counter. Sends a random per-tab id,
  // the booking stage, the device class and where the visit came from — nothing personal — while this tab is visible.
  const presenceRef = useRef({ sid: "", stage: "browsing", device: "desktop", source: "" });
  const stageNow = phase === "form" ? (step === 3 ? "payment" : "form") : "browsing";
  const deviceNow = isMobile ? "mobile" : tablet ? "tablet" : "desktop";
  const sendPresence = useCallback((leave = false) => {
    const pr = presenceRef.current;
    if (!leave && typeof document !== "undefined" && document.hidden) return;
    if (!pr.source) pr.source = visitSource();
    if (!pr.sid) {
      try { pr.sid = sessionStorage.getItem("cyt_na_sid") || ""; } catch { /* storage blocked */ }
      if (!pr.sid) {
        const raw = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
        pr.sid = raw.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
        try { sessionStorage.setItem("cyt_na_sid", pr.sid); } catch { /* storage blocked */ }
      }
    }
    fetch(`${apiUrl}/noida-appointments/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid: pr.sid, stage: pr.stage, device: pr.device, source: pr.source, leave: leave || undefined }),
      keepalive: true,
    }).catch(() => {});
  }, []);
  useEffect(() => {
    presenceRef.current.stage = stageNow;
    presenceRef.current.device = deviceNow;
    sendPresence(); // stage/device changed — tell the desk straight away
  }, [stageNow, deviceNow, sendPresence]);
  useEffect(() => {
    const iv = setInterval(() => sendPresence(), 25000);
    const onVis = () => { if (!document.hidden) sendPresence(); };
    const onLeave = () => sendPresence(true);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onLeave);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("pagehide", onLeave); };
  }, [sendPresence]);

  // ── Pricing + packages, fetched once ─────────────────────────────────
  const [pricing, setPricing] = useState(null);
  // The CYT Noida team the admin offered (live therapists only). It's always shown to new
  // clients; picking one is only allowed while the admin's "therapist choice" switch is on.
  const [therapists, setTherapists] = useState([]);
  const [canChooseTherapist, setCanChooseTherapist] = useState(false);
  const [therapistId, setTherapistId] = useState("");
  const selectedTherapist = therapists.find(t => t._id === therapistId) || null;
  const pickerList = canChooseTherapist ? therapists : [];
  // A new client's slot pick waits here while the team modal is up; teamSeen stops it
  // coming back on every re-pick in the same visit.
  const [teamGate, setTeamGate] = useState(null);
  const [teamSeen, setTeamSeen] = useState(false);
  useEffect(() => {
    fetch(`${apiUrl}/noida-appointments/therapists`)
      .then(r => r.json())
      .then(data => {
        setTherapists(data?.status ? (data.data || []) : []);
        setCanChooseTherapist(!!data?.enabled);
      })
      .catch(() => setTherapists([]));
  }, []);
  useEffect(() => { if (therapistId && therapists.length && !therapists.some(t => t._id === therapistId)) setTherapistId(""); }, [therapists, therapistId]);
  // Follow-up: the phone lookup says who this client last booked with — pre-select them
  // (still changeable) as long as that therapist is still offered.
  const [lastTherapistId, setLastTherapistId] = useState(null);
  const lastTherapistRef = useRef(null);
  const lastPickHint = bookingType === "followup" && therapistId && therapistId === lastTherapistId
    ? "Selected: your psychologist from last time. Tap another to change." : undefined;
  useEffect(() => {
    if (bookingType === "followup" && canChooseTherapist && lastTherapistId && therapists.some(t => t._id === lastTherapistId)) {
      setTherapistId(lastTherapistId);
    }
  }, [bookingType, canChooseTherapist, lastTherapistId, therapists]);
  useEffect(() => {
    fetch(`${apiUrl}/noida-appointments/pricing`)
      .then(r => r.json())
      .then(data => setPricing(data?.status ? data.data : null))
      .catch(() => setPricing(null));
  }, []);

  // ── Full-page available-slots table — the primary view for New/Follow-up.
  // Clicking an open cell picks that date+slot and moves straight into the
  // booking form, so there's no separate "pick a date/time" step later.
  const [slotsMatrix, setSlotsMatrix] = useState({ dates: [], times: [], grid: {} });
  const [slotsMatrixLoading, setSlotsMatrixLoading] = useState(true);

  // A slot tapped on mobile can get booked (or pass) before Continue is hit.
  useEffect(() => {
    if (!pendingPick) return;
    const st = slotsMatrix.grid[`${pendingPick.date}|${pendingPick.slot}`];
    if (st !== "open" && st !== "lastMinute") setPendingPick(null);
  }, [slotsMatrix, pendingPick]);

  // Baseline for spotting a slot that flipped open -> booked between two
  // polls, so the confetti only fires for a live booking, never on first load.
  const prevGridRef = useRef(null);

  const loadSlotsMatrix = useCallback(async (type, { silent = false } = {}) => {
    if (type !== "new" && type !== "followup") return;
    if (!silent) setSlotsMatrixLoading(true);
    try {
      const fresh = await fetchSlotsMatrix(type);
      if (hasNewlyBooked(prevGridRef.current, fresh.grid)) fireConfetti();
      prevGridRef.current = fresh.grid;
      setSlotsMatrix(fresh);
    } catch {
      // A silent background poll keeps the last known table on screen
      // instead of blanking it over one dropped request.
      if (!silent) setSlotsMatrix({ dates: [], times: [], grid: {} });
    } finally {
      if (!silent) setSlotsMatrixLoading(false);
    }
  }, []);

  useEffect(() => {
    prevGridRef.current = null;
    loadSlotsMatrix(bookingType);
    const iv = setInterval(() => {
      if (!document.hidden) loadSlotsMatrix(bookingType, { silent: true });
    }, 6000);
    return () => clearInterval(iv);
  }, [bookingType, loadSlotsMatrix]);

  // Impression + funnel events for GTM: how many people saw open slots, and which form step they reach.
  const viewedRef = useRef("");
  useEffect(() => {
    if (phase !== "slots" || slotsMatrixLoading || !slotsMatrix.dates.length) return;
    if (bookingType !== "new" && bookingType !== "followup") return;
    if (viewedRef.current === bookingType) return;
    viewedRef.current = bookingType;
    const open = Object.values(slotsMatrix.grid).filter(v => v === "open" || v === "lastMinute").length;
    track("noida_slots_view", { booking_type: bookingType, open_slots: open });
  }, [phase, bookingType, slotsMatrix, slotsMatrixLoading]);
  useEffect(() => {
    if (phase === "form") track("noida_funnel_step", { booking_type: bookingType, step });
  }, [phase, step, bookingType]);

  // A tab left open on the slots table would otherwise keep running the old
  // build after a deploy. Reload it, but only while idle on the New Client
  // table — never mid-form, and not Follow-up where a typed phone would be lost.
  useEffect(() => {
    if (phase !== "slots" || bookingType !== "new") return;
    const current = window.__NEXT_DATA__?.buildId;
    if (!current) return;
    const iv = setInterval(async () => {
      if (document.hidden) return;
      try {
        const html = await (await fetch(window.location.pathname, { cache: "no-store" })).text();
        const m = html.match(/"buildId":"([^"]+)"/);
        if (m && m[1] !== current) window.location.reload();
      } catch {
        // offline or mid-deploy — try again next tick
      }
    }, 60000);
    return () => clearInterval(iv);
  }, [phase, bookingType]);

  const [sessionMode, setSessionMode] = useState("individual"); // "individual" | "couple" | "package"
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [format, setFormat] = useState("in-person"); // "in-person" | "online" | "home-visit"
  const [address, setAddress] = useState("");

  // "Custom package": the client picks how many sessions; the server prices it (sessions x per-session rate).
  const [customSessions, setCustomSessions] = useState(0);
  const packageOptions = pricing?.packages || [];
  const cp = pricing?.customPackage?.enabled ? pricing.customPackage : null;
  const customN = cp ? Math.min(cp.maxSessions, Math.max(cp.minSessions, customSessions || cp.minSessions)) : 0;
  const isCustomPackage = selectedPackageId === "custom" && !!cp;
  const hasPackages = packageOptions.length > 0 || !!cp;
  const packageCount = packageOptions.length + (cp ? 1 : 0);
  const selectedPackage = isCustomPackage
    ? { _id: "custom", name: `Custom package · ${customN} sessions`, sessionsCount: customN, price: customN * cp.perSessionPrice }
    : packageOptions.find(p => p._id === selectedPackageId);
  const baseAmount = sessionMode === "package"
    ? (selectedPackage?.price ?? 0)
    : (pricing?.[priceFieldFor(sessionMode, format)] ?? 0);
  const platformFee = pricing?.platformFee ?? 20;
  // Coupon: validated on the server; the client only ever sends the code back.
  const [coupon, setCoupon] = useState(null); // { code, discountAmount, description }
  const [couponInput, setCouponInput] = useState("");
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [offers, setOffers] = useState([]);
  const [offerOpen, setOfferOpen] = useState(null); // offer being claimed
  const [claimedCode, setClaimedCode] = useState("");
  useEffect(() => {
    fetch(`${apiUrl}/noida-appointments/offers`).then((r) => r.json()).then((d) => { if (d?.status) setOffers(d.data || []); }).catch(() => {});
    try { const c = localStorage.getItem(OFFER_CODE_KEY); if (c) { setClaimedCode(c); setCouponInput(c); setCouponOpen(true); } } catch { /* storage blocked */ }
  }, []);
  // arriving from the homepage offer badge / strip (?offer=1) opens the claim form straight away
  const offerDeepLinked = useRef(false);
  useEffect(() => {
    if (offerDeepLinked.current || !offers.length) return;
    offerDeepLinked.current = true;
    try {
      if (new URLSearchParams(window.location.search).get("offer") === "1" && !localStorage.getItem(OFFER_CODE_KEY)) setOfferOpen(offers[0]);
    } catch { /* storage blocked */ }
  }, [offers]);
  const slotOffer = offers.find((o) => o.appliesTo !== "package") || null;
  const discountAmount = coupon?.discountAmount || 0;
  const totalAmount = baseAmount - discountAmount + platformFee;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  // ── Last-minute request flow (see LAST_MINUTE_WINDOW_MINUTES backend-side)
  // A slot inside the last-minute window can't be booked outright — the
  // client sends a request, staff accepts it from the admin panel, and only
  // then does payment unlock.
  const [selectedIsLastMinute, setSelectedIsLastMinute] = useState(false);
  const [lastMinuteRequestId, setLastMinuteRequestId] = useState(null);
  const [lastMinuteStatus, setLastMinuteStatus] = useState(null); // null | "pending" | "accepted" | "rejected" | "expired"
  const [lastMinuteExpiresIn, setLastMinuteExpiresIn] = useState(null); // seconds, as of lastMinutePolledAt
  const [lastMinutePolledAt, setLastMinutePolledAt] = useState(null); // ms epoch
  const [lastMinuteSending, setLastMinuteSending] = useState(false);
  const lastMinutePollRef = useRef(null);
  const [nowTick, setNowTick] = useState(Date.now());

  const stopLastMinutePoll = () => {
    if (lastMinutePollRef.current) { clearInterval(lastMinutePollRef.current); lastMinutePollRef.current = null; }
  };
  useEffect(() => () => stopLastMinutePoll(), []);

  // Ticks once a second only while a live countdown is actually on screen.
  useEffect(() => {
    const active = phase === "form" && step === 3 && selectedIsLastMinute && lastMinuteStatus !== "accepted";
    if (!active) return;
    const iv = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(iv);
  }, [phase, step, selectedIsLastMinute, lastMinuteStatus]);

  const resetLastMinute = () => {
    stopLastMinutePoll();
    setSelectedIsLastMinute(false);
    setLastMinuteRequestId(null);
    setLastMinuteStatus(null);
    setLastMinuteExpiresIn(null);
    setLastMinutePolledAt(null);
  };

  // New clients see the team first (once per visit) — see TeamModal.
  const handlePickSlot = (date, slot, isLastMinute) => {
    if (bookingType === "new" && therapists.length > 0 && !teamSeen) {
      track("noida_team_shown", { can_choose: canChooseTherapist, count: therapists.length });
      setTeamGate({ date, slot, isLM: isLastMinute });
      return;
    }
    goToForm(date, slot, isLastMinute);
  };
  const finishTeam = (id) => {
    const gate = teamGate;
    setTeamSeen(true);
    setTeamGate(null);
    if (canChooseTherapist) setTherapistId(id);
    track("noida_team_done", { therapist_id: id || "any", can_choose: canChooseTherapist });
    if (gate) goToForm(gate.date, gate.slot, gate.isLM);
  };
  const goToForm = (date, slot, isLastMinute) => {
    track("noida_slot_confirmed", { booking_type: bookingType, slot_date: date, slot_time: slot, last_minute: !!isLastMinute });
    setSlotNotice("");
    setPendingPick(null);
    resetLastMinute();
    setSelectedDate(date);
    setSelectedSlot(slot);
    setSelectedIsLastMinute(!!isLastMinute);
    setPhase("form");
    // Follow-up already collected phone/name during the identify phase —
    // jump straight to Session. New Client hasn't, so start at You.
    setStep(bookingType === "followup" ? (skipSession ? 3 : 2) : 1);
    setError("");
    setStatus(null);
  };
  // The slot grid's own onPick (New Client tab): highlights the tapped cell as usual,
  // and — the first time, before anything's told us why they're here — brings up the
  // welcome popup right there instead of waiting for Continue.
  const onOpenSlotPick = (date, slot, isLastMinute) => {
    setPendingPick({ date, slot, isLM: isLastMinute });
    haptic();
    if (!intentConfirmed) setShowWelcome(true);
  };

  const pollLastMinuteStatus = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/last-minute-requests/${id}/status`);
      const data = await res.json();
      if (!data?.status) return;
      setLastMinuteStatus(data.data.status);
      setLastMinuteExpiresIn(data.data.expiresInSeconds);
      setLastMinutePolledAt(Date.now());
      if (data.data.status !== "pending") stopLastMinutePoll();
    } catch {
      // transient network error while polling — just try again next tick
    }
  };

  const handleSendLastMinuteRequest = async () => {
    setLastMinuteSending(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/last-minute-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: effectiveName.trim(), age: form.age.trim(), phone: form.phone.trim(),
          email: form.email.trim(), concern: form.concern.trim(),
          date: selectedDate, slot: selectedSlot, type: bookingType,
          sessionMode, format,
          address: format === "home-visit" ? address.trim() : undefined,
          packageId: sessionMode === "package" && selectedPackageId !== "custom" ? selectedPackageId : undefined, customSessions: sessionMode === "package" && isCustomPackage ? customN : undefined, couponCode: coupon?.code, therapistId: (canChooseTherapist && therapistId) || undefined,
        }),
      });
      const data = await res.json();
      if (!data.status) { setError(data.message || "Could not send request. Please try again."); return; }
      setLastMinuteRequestId(data.data._id);
      setLastMinuteStatus(data.data.status);
      setLastMinuteExpiresIn(data.data.status === "pending" ? 10 * 60 : null);
      setLastMinutePolledAt(Date.now());
      if (data.data.status === "pending") {
        lastMinutePollRef.current = setInterval(() => pollLastMinuteStatus(data.data._id), 3000);
      }
    } catch {
      setError("Could not send request. Please try again.");
    } finally {
      setLastMinuteSending(false);
    }
  };

  // ── Follow-up phone lookup ───────────────────────────────────────────
  const [lookupStatus, setLookupStatus] = useState(null); // null | "checking" | "found" | "not-found"
  const [foundName, setFoundName] = useState("");
  const [manualOverride, setManualOverride] = useState(false); // "not you? enter manually"
  const [credit, setCredit] = useState(null); // { available, sessionsRemaining, packageName } | null

  const runLookup = useCallback(async (phone) => {
    if (!/^\d{10}$/.test(phone)) { setLookupStatus(null); setCredit(null); return; }
    setLookupStatus("checking");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/lookup?phone=${phone}`);
      const data = await res.json();
      setCredit(data?.data?.credit?.available ? data.data.credit : null);
      // a different phone: drop the therapist we pre-selected for the previous one
      const last = (data?.status && data.data?.found && data.data.lastTherapistId) || null;
      const prevLast = lastTherapistRef.current;
      setTherapistId(t => (t && t === prevLast && t !== last ? "" : t));
      lastTherapistRef.current = last;
      setLastTherapistId(last);
      if (data?.status && data.data?.found) {
        setFoundName(data.data.name || "");
        setLookupStatus("found");
        saveKnownPhone(phone);
        saveKnownName(data.data.name);
      } else {
        setLookupStatus("not-found");
      }
    } catch {
      setLookupStatus("not-found");
      setCredit(null);
    }
  }, []);

  const usingCredit = bookingType === "followup" && !!credit;


  // ── Reschedule tab — compact single-screen flow: phone → nearest
  // upcoming booking → pick new date/time from the same slots table.
  const [reschedulePhone, setReschedulePhone] = useState("");
  const [rescheduleStatus, setRescheduleStatus] = useState(null); // null | "checking" | "found" | "not-found"
  const [rescheduleInfo, setRescheduleInfo] = useState(null); // { name, date, slot, type, rescheduleLimit, reschedulesUsed, reschedulesLeft }
  // one reschedule per session (server policy) — once used, the client is sent to WhatsApp
  const rescheduleBlocked = !!rescheduleInfo && rescheduleInfo.rescheduleLimit != null && rescheduleInfo.reschedulesLeft === 0;
  const [rescheduleMatrix, setRescheduleMatrix] = useState({ dates: [], times: [], grid: {} });
  const [rescheduleMatrixLoading, setRescheduleMatrixLoading] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleDone, setRescheduleDone] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  const runRescheduleLookup = useCallback(async (phone) => {
    if (!/^\d{10}$/.test(phone)) { setRescheduleStatus(null); setRescheduleInfo(null); return; }
    setRescheduleStatus("checking");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/upcoming?phone=${phone}`);
      const data = await res.json();
      if (data?.status && data.data?.found) {
        setRescheduleInfo(data.data);
        setRescheduleStatus("found");
      } else {
        setRescheduleInfo(null);
        setRescheduleStatus("not-found");
      }
    } catch {
      setRescheduleStatus("not-found");
      setRescheduleInfo(null);
    }
  }, []);

  const handleReschedulePhoneChange = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 10);
    setReschedulePhone(digits);
    setRescheduleDate(""); setRescheduleSlot(""); setRescheduleError("");
    if (digits.length === 10) runRescheduleLookup(digits);
    else { setRescheduleStatus(null); setRescheduleInfo(null); }
  };

  useEffect(() => {
    if (!rescheduleInfo) { setRescheduleMatrix({ dates: [], times: [], grid: {} }); return; }
    setRescheduleMatrixLoading(true);
    setRescheduleDate(""); setRescheduleSlot("");
    let prevGrid = null;
    let cancelled = false;
    const load = async (silent) => {
      try {
        const fresh = await fetchSlotsMatrix(rescheduleInfo.type);
        if (cancelled) return;
        if (hasNewlyBooked(prevGrid, fresh.grid)) fireConfetti();
        prevGrid = fresh.grid;
        setRescheduleMatrix(fresh);
      } catch {
        if (!silent && !cancelled) setRescheduleMatrix({ dates: [], times: [], grid: {} });
      } finally {
        if (!silent && !cancelled) setRescheduleMatrixLoading(false);
      }
    };
    load(false);
    const iv = setInterval(() => { if (!document.hidden) load(true); }, 6000);
    return () => { cancelled = true; clearInterval(iv); };
  }, [rescheduleInfo]);

  const handleReschedulePickSlot = (date, slot) => {
    setRescheduleDate(date);
    setRescheduleSlot(slot);
    setRescheduleError("");
  };

  const rescheduleDateLabel = rescheduleDate ? dateLabel(rescheduleDate) : null;

  const submitReschedule = async () => {
    setRescheduleError("");
    if (!rescheduleDate || !rescheduleSlot) { setRescheduleError("Please select a date and time."); return; }
    setRescheduleSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/noida-appointments/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: reschedulePhone, newDate: rescheduleDate, newSlot: rescheduleSlot }),
      });
      const data = await res.json();
      if (data.status) setRescheduleDone(true);
      else setRescheduleError(data.message || "Could not reschedule. Please try again.");
    } catch {
      setRescheduleError("Could not reschedule. Please try again.");
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  // ── Form ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", concern: "" });

  // Any change to what's being bought makes a validated coupon stale — ask again.
  useEffect(() => {
    setCoupon(null); setCouponError("");
    // eslint-disable-next-line
  }, [sessionMode, selectedPackageId, customN, format, form.phone, selectedDate, selectedSlot]);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponBusy(true); setCouponError("");
    try {
      const data = await fetch(`${apiUrl}/noida-appointments/coupon/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, phone: form.phone.trim(), sessionMode, format, packageId: sessionMode === "package" && selectedPackageId !== "custom" ? selectedPackageId : undefined, customSessions: sessionMode === "package" && isCustomPackage ? customN : undefined, date: selectedDate, slot: selectedSlot }),
      }).then(r => r.json());
      if (data?.status) { setCoupon(data.data); setCouponOpen(false); }
      else setCouponError(data?.message || "That coupon isn't valid.");
    } catch (e) {
      setCouponError(e?.response?.data?.message || "Couldn't check the coupon. Please try again.");
    } finally {
      setCouponBusy(false);
    }
  };
  const removeCoupon = () => { setCoupon(null); setCouponInput(""); setCouponError(""); };
  const [status, setStatus] = useState(null); // null | "loading" | "success"
  const [error, setError] = useState("");
  // Shown above the slots table when a slot was lost while the client was booking it.
  const [slotNotice, setSlotNotice] = useState("");
  // The slot the client was booking when it was taken — used to suggest the closest open ones.
  const [lostSlot, setLostSlot] = useState(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // null | "razorpay"

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (!d || Date.now() - d.t > DRAFT_TTL_MS) { localStorage.removeItem(DRAFT_KEY); return; }
      setForm(f => (f.name || f.phone || f.email ? f : { ...f, name: d.name || "", age: d.age || "", phone: d.phone || "", email: d.email || "" }));
      if (d.name || d.phone || d.email) setDraftRestored(true);
    } catch { /* storage blocked or corrupt — start blank */ }
  }, []);
  useEffect(() => {
    if (!form.name && !form.phone && !form.email) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ name: form.name, age: form.age, phone: form.phone, email: form.email, t: Date.now() }));
    } catch { /* ignore */ }
  }, [form.name, form.age, form.phone, form.email]);
  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setForm({ name: "", age: "", phone: "", email: "", concern: "" });
    setDraftRestored(false);
  };

  // Soft hints while typing (the Continue button still does the real validation).
  const phoneHint = form.phone && form.phone.length < 10 ? <div className="na-fnote">Enter all 10 digits ({form.phone.length}/10)</div> : null;
  const emailHint = form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? <div className="na-fnote">This email looks incomplete — please check it</div> : null;

  const handlePhoneChange = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 10);
    set("phone", digits);
    setManualOverride(false);
    if (digits.length === 10 && bookingType === "followup") runLookup(digits);
    else { setLookupStatus(null); setCredit(null); }
  };

  const switchTab = (type) => {
    setIntentConfirmed(true);
    setSlotNotice("");
    setPendingPick(null);
    resetLastMinute();
    setBookingType(type);
    setPhase(type === "followup" ? "identify" : "slots");
    setStep(1);
    setStatus(null);
    setError("");
    setLookupStatus(null);
    setManualOverride(false);
    setCredit(null);
    const knownPhone = type === "followup" ? loadKnownPhone() : "";
    setForm({ name: "", age: "", phone: knownPhone, email: "", concern: "" });
    if (knownPhone) runLookup(knownPhone);
    setPaymentMethod(null);
    setSelectedDate(""); setSelectedSlot("");
    setReschedulePhone(""); setRescheduleStatus(null); setRescheduleInfo(null);
    setRescheduleDate(""); setRescheduleSlot(""); setRescheduleDone(false); setRescheduleError("");
  };

  const notMe = () => {
    forgetKnownClient();
    setReturning(null);
    setMyUpcoming(null);
    track("noida_returning_not_me", {});
  };

  // The welcome popup's own dismiss handler — defined here (not near its state) because
  // it needs switchTab and handlePickSlot above it, and pendingPick/bookingType from
  // further up the component, all in scope.
  const dismissWelcome = (type) => {
    setShowWelcome(false);
    if (!type) return; // ✕ — leave the slot picked (Continue still works below), just don't advance yet
    setIntentConfirmed(true);
    if (type === bookingType && pendingPick) {
      // The slot they tapped to trigger this popup is still the one they want — go
      // straight to it instead of resetting via switchTab, which would wipe the pick.
      handlePickSlot(pendingPick.date, pendingPick.slot, pendingPick.isLM);
      return;
    }
    switchTab(type);
  };

  const needsFullDetails = bookingType === "new" || lookupStatus === "not-found" || manualOverride;
  const effectiveName = bookingType === "followup" && lookupStatus === "found" && !manualOverride ? foundName : form.name;

  // Landscape tablets pick session + mode in the "Your booking" panel beside
  // the table, so the Session step is skipped unless something still needs
  // filling in (a package to choose, or a home-visit address) or the client
  // is using package credit (which only asks for the mode there).
  const skipSession = tabletLandscape && !usingCredit && sessionMode !== "package" && format !== "home-visit";

  const goToStep2 = () => {
    setError("");
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number."); return;
    }
    if (!effectiveName?.trim()) { setError("Name is required."); return; }
    setStep(skipSession ? 3 : 2);
  };
  const goBackFromPay = () => {
    if (!skipSession) { setStep(2); return; }
    if (bookingType === "followup") { resetLastMinute(); setPhase("slots"); }
    else setStep(1);
  };
  // Follow-up's identify phase — same validation as goToStep2, but moves
  // to the slots table instead of a wizard step.
  const goToIdentifySlots = () => {
    setError("");
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) {
      setError("Please enter a valid 10-digit phone number."); return;
    }
    if (!effectiveName?.trim()) { setError("Name is required."); return; }
    setPhase("slots");
  };
  const goToPayment = () => {
    setError("");
    if (!usingCredit) {
      if (sessionMode === "package" && !selectedPackageId) { setError("Please choose a package."); return; }
      if (format === "home-visit" && !address.trim()) { setError("Please add your address for the home visit."); return; }
    }
    setStep(3);
  };

  const buildPayload = () => ({
    name: effectiveName.trim(),
    age: form.age.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    concern: form.concern.trim(),
    date: selectedDate, slot: selectedSlot, type: bookingType,
    sessionMode, format,
    address: format === "home-visit" ? address.trim() : "",
    packageId: sessionMode === "package" && selectedPackageId !== "custom" ? selectedPackageId : undefined, customSessions: sessionMode === "package" && isCustomPackage ? customN : undefined, couponCode: coupon?.code, therapistId: (canChooseTherapist && therapistId) || undefined,
  });

  // Warm the payment script up as soon as the payment step is showing.
  useEffect(() => {
    if (phase === "form" && step === 3) loadRazorpay();
  }, [phase, step]);

  const finalizeBooking = async (paymentExtra = {}) => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${apiUrl}/noida-appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), ...paymentExtra }),
      });
      const data = await res.json();
      if (data.status) {
        track("noida_booking_complete", { booking_type: bookingType, value: Number(totalAmount) || 0, currency: "INR" });
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        saveKnownPhone(form.phone);
        saveKnownName(effectiveName);
        setReturning({ phone: form.phone, name: effectiveName });
        setMyUpcoming({ name: effectiveName, date: selectedDate, slot: selectedSlot, type: bookingType });
        setStatus("success");
      } else if (data.paymentHandled && data.refunded !== undefined) {
        // Paid, but the slot went before the booking could be made — the server
        // has already refunded (or flagged it for staff). Send them back to
        // pick another slot with the explanation, instead of a dead-end error.
        setLostSlot({ date: selectedDate, slot: selectedSlot });
        track("noida_slot_taken", { booking_type: bookingType, stage: "after_payment" });
        setSlotNotice(data.message);
        setError("");
        setStatus(null);
        resetLastMinute();
        setPhase("slots");
        loadSlotsMatrix(bookingType);
      } else if (data.paymentHandled) {
        setError(data.message);
        setStatus(null);
      } else if (paymentExtra.razorpay_payment_id) {
        setError(`${data.message || "Booking failed after payment."} Please WhatsApp us with payment ID ${paymentExtra.razorpay_payment_id} and we'll sort it out.`);
        setStatus(null);
      } else {
        setError(data.message || "Booking failed. Please try again.");
        setStatus(null);
      }
    } catch {
      if (paymentExtra.razorpay_payment_id) {
        setError("Payment succeeded but we couldn't save the booking. Please WhatsApp us and we'll sort it out.");
      } else {
        setError("Could not save the booking. Please try again.");
      }
      setStatus(null);
    }
  };

  const handleConfirmCredit = () => finalizeBooking();

  const handleRazorpay = async () => {
    loadRazorpay();
    track("noida_payment_start", { booking_type: bookingType, value: Number(totalAmount) || 0, currency: "INR" });
    setPaymentMethod("razorpay");
    setStatus("loading");
    setError("");
    try {
      const orderRes = await fetch(`${apiUrl}/noida-appointments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionMode, format,
          packageId: sessionMode === "package" && selectedPackageId !== "custom" ? selectedPackageId : undefined, customSessions: sessionMode === "package" && isCustomPackage ? customN : undefined, couponCode: coupon?.code, therapistId: (canChooseTherapist && therapistId) || undefined,
          address: format === "home-visit" ? address.trim() : undefined,
          type: bookingType, phone: form.phone.trim(),
          // The whole booking goes with the order so the server can refuse a
          // taken slot before charging, and finish or refund the booking itself
          // if this browser never gets to confirm.
          name: effectiveName.trim(), age: form.age.trim(), email: form.email.trim(), concern: form.concern.trim(),
          date: selectedDate, slot: selectedSlot,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.status) {
        if (orderRes.status === 409) {
          // Someone took the slot while this client was filling in the form — nothing was charged.
          setLostSlot({ date: selectedDate, slot: selectedSlot });
          track("noida_slot_taken", { booking_type: bookingType, stage: "before_payment" });
          setSlotNotice(orderData.message || "That slot was just booked. Please pick another.");
          setError("");
          setStatus(null);
          resetLastMinute();
          setPhase("slots");
          loadSlotsMatrix(bookingType);
          return;
        }
        setError(orderData.message || "Could not start payment. Please try again.");
        setStatus(null);
        return;
      }

      await waitForRazorpay();

      const rzp = new window.Razorpay({
        key: orderData.data.keyId,
        amount: Math.round(orderData.data.amount * 100),
        currency: "INR",
        order_id: orderData.data.orderId,
        name: "Choose Your Therapist",
        description: "CYT Noida Appointment",
        handler: (response) => finalizeBooking({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
        prefill: { name: effectiveName, email: form.email, contact: form.phone },
        theme: { color: "#1a6b3a" },
        modal: {
          ondismiss: () => {
            setStatus(null);
            setError("Payment was cancelled. You can try again whenever you're ready.");
          },
        },
      });
      rzp.on("payment.failed", () => {
        setStatus(null);
        setError("Payment failed. Please try again or use a different payment method.");
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Could not start payment. Please try again.");
      setStatus(null);
    }
  };

  // ── Exit feedback: ask once per visit why they're leaving without booking ──
  const router = useRouter();
  const [exitAsk, setExitAsk] = useState(null); // null | "back_button" | "browser_back" | "exit_intent"
  const exitGuardRef = useRef(false); // true while an extra history entry is waiting to catch the first Back press
  const exitAskedRef = useRef(false); // already shown on this page load
  const canAskRef = useRef(true);
  canAskRef.current = status !== "success" && status !== "loading" && !rescheduleDone;

  const leavePage = useCallback((trigger) => {
    if (trigger === "browser_back") {
      window.history.back();
      // landed here directly (nothing to go back to) — send them home instead
      setTimeout(() => { if (window.location.pathname.startsWith("/noida-appointment")) router.push("/"); }, 700);
    } else {
      router.push("/");
    }
  }, [router]);

  const openExit = useCallback((trigger) => {
    if (!canAskRef.current || exitAskedRef.current || exitAlreadyAnswered()) return false;
    exitAskedRef.current = true;
    setExitAsk(trigger);
    track("noida_exit_prompt", { trigger });
    return true;
  }, []);

  const handleBackButton = () => {
    if (!openExit("back_button")) router.push("/");
  };

  // Browser / phone Back: add one same-URL history entry, so the first Back press stays on
  // this page and opens the popup instead of leaving. Added as soon as the page opens; the
  // first tap/click/keypress re-arms it if needed (Chrome's back button can skip entries a
  // page added before the visitor interacted with it).
  useEffect(() => {
    if (exitAlreadyAnswered()) return undefined;
    const arm = () => {
      if (exitGuardRef.current || exitAskedRef.current || exitAlreadyAnswered()) return;
      if (!window.history.state?.naExitGuard) {
        window.history.pushState({ ...window.history.state, naExitGuard: true }, "", window.location.href);
      }
      exitGuardRef.current = true;
    };
    arm();
    const armEvents = ["pointerdown", "keydown", "touchstart"];
    armEvents.forEach((ev) => window.addEventListener(ev, arm, { once: true, passive: true }));

    // Back landed on this same page (our extra entry was popped) — keep Next's router out of it…
    router.beforePopState((state) => {
      const samePage = (state?.as || "").split("?")[0] === window.location.pathname;
      return !(exitGuardRef.current && samePage && !state?.naExitGuard);
    });
    // …and ask instead of leaving.
    const onPop = (e) => {
      if (!exitGuardRef.current || e.state?.naExitGuard) return;
      exitGuardRef.current = false;
      // nothing to ask (already booked / asked) — carry on to where they were going
      if (!openExit("browser_back")) window.history.back();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      armEvents.forEach((ev) => window.removeEventListener(ev, arm));
      window.removeEventListener("popstate", onPop);
      router.beforePopState(() => true);
    };
  }, [router, openExit]);

  // Desktop: mouse heading out of the top of the window (towards the tab's close button).
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    const since = Date.now();
    const onOut = (e) => {
      if (e.relatedTarget || e.clientY > 0 || Date.now() - since < 8000) return;
      openExit("exit_intent");
    };
    document.addEventListener("mouseout", onOut);
    return () => document.removeEventListener("mouseout", onOut);
  }, [openExit]);

  const submitExit = async ({ reason, otherText, phone }) => {
    markExitAnswered();
    track("noida_exit_feedback", { trigger: exitAsk, reason, callback: !!phone });
    try {
      await fetch(`${apiUrl}/noida-appointments/exit-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason, otherText, phone, wantsCallback: !!phone,
          stage: stageNow, bookingType, trigger: exitAsk, device: deviceNow,
          slotDate: selectedDate || "", slotTime: selectedSlot || "",
        }),
        keepalive: true,
      });
    } catch { /* not critical — never block someone from leaving */ }
    const trigger = exitAsk;
    setTimeout(() => {
      setExitAsk(null);
      if (trigger !== "exit_intent") leavePage(trigger);
    }, 1400);
  };
  const stayOnPage = useCallback(() => {
    if (exitAsk) track("noida_exit_stay", { trigger: exitAsk });
    setExitAsk(null);
  }, [exitAsk]);
  const skipExit = () => {
    track("noida_exit_skip", { trigger: exitAsk });
    const trigger = exitAsk;
    setExitAsk(null);
    leavePage(trigger);
  };

  const pickedDateLabel = selectedDate ? dateLabel(selectedDate) : null;
  const formatLabel = format === "home-visit" ? "Home Visit" : format === "online" ? "Online" : "In-person";
  const modeLabel = sessionMode === "package" ? (selectedPackage?.name || "Package") : sessionMode === "couple" ? "Couple" : "Individual";

  const tabsEl = (
    <div className="na-topbar">
      <div className="na-centre">
        <button type="button" className="na-back" onClick={handleBackButton} aria-label="Back to homepage" title="Back to homepage"><ArrowBackRounded style={{ fontSize: 18 }} /></button>
        <div className="na-centre-mark"><img src="/favicon.png" alt="Choose Your Therapist" width="44" height="44" /></div>
        <div className="na-centre-txt">
          <div className="na-centre-name">Choose Your Therapist | Noida &amp; Delhi</div>
          <div className="na-centre-addr"><Ic I={PlaceRounded} s={13} /> Gate 3, D-137, Block D, Sector 51, Noida</div>
        </div>
        <div className="na-centre-actions">
          <a className="na-centre-btn" href={MAPS_URL} target="_blank" rel="noopener noreferrer" aria-label="Get directions to the centre"><Ic I={DirectionsRounded} s={16} /><span>Directions</span></a>
          <a className="na-centre-btn wa" href={waLink("Hi, I have a question about booking at the Noida centre.")} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"><Ic I={WhatsAppIcon} s={16} /><span>WhatsApp</span></a>
        </div>
      </div>
      <div className="na-topbar-tabs">
        <button type="button" className={`na-topbar-tab ${bookingType === "new" ? "active" : ""}`} onClick={() => switchTab("new")}>New Client</button>
        <button type="button" className={`na-topbar-tab ${bookingType === "followup" ? "active" : ""}`} onClick={() => switchTab("followup")}>Follow-up</button>
        <button type="button" className={`na-topbar-tab ${bookingType === "reschedule" ? "active" : ""}`} onClick={() => switchTab("reschedule")}>Reschedule</button>
      </div>
      <div className="na-chips-host" ref={setChipsHost} />
    </div>
  );
  // The slots table is pinned to one screen (no scrolling) on tablet and desktop.
  const fitSlots = phase === "slots" && bookingType !== "reschedule";
  const fromPrices = [pricing?.individual_inperson, pricing?.individual_online, pricing?.individual_homevisit].map(Number).filter(n => n > 0);
  const fromPriceText = fromPrices.length && !usingCredit ? `From ₹${Math.min(...fromPrices)} per session${platformFee ? ` + ₹${platformFee} platform fee` : ""}` : "";

  return (
    <>
      <Head>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={PAGE_URL} />
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content="Noida" />
        <meta name="geo.position" content="28.5821626;77.3716335" />
        <meta name="ICBM" content="28.5821626, 77.3716335" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSeoGraph(seoPricing)) }} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Choose Your Therapist" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content="https://www.chooseyourtherapist.in/og-noida-appointment-v3.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Choose Your Therapist — pick a slot and book a psychologist in-person, online or at home in Noida" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESC} />
        <meta name="twitter:image" content="https://www.chooseyourtherapist.in/og-noida-appointment-v3.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: `
        .na-page { font-family: 'Inter', sans-serif; background: #f4f6f5; min-height: 100vh; display: flow-root; }
        .na-page.na-blurred { filter: blur(6px); pointer-events: none; user-select: none; }

        .na-welcome-overlay { position: fixed; inset: 0; z-index: 100000; /* above the cookie bar (99998), which otherwise hides the modal buttons on phones */ display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(15,23,20,.38); animation: naWelcomeFade .2s ease; }
        @keyframes naWelcomeFade { from { opacity: 0; } to { opacity: 1; } }
        .na-welcome-modal { position: relative; width: 100%; max-width: 460px; background: #fff; border-radius: 22px; box-shadow: 0 30px 70px rgba(15,61,34,.28); padding: 32px 28px 28px; font-family: 'Inter', sans-serif; animation: naWelcomePop .22s cubic-bezier(.2,.9,.3,1.2); }
        @keyframes naWelcomePop { from { opacity: 0; transform: translateY(10px) scale(.97); } to { opacity: 1; transform: none; } }
        .na-welcome-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border-radius: 50%; border: none; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .na-welcome-close:hover { background: #e2e8f0; color: #334155; }
        .na-welcome-title { font-size: 21px; font-weight: 800; color: #0f172a; letter-spacing: -.3px; }
        .na-welcome-sub { margin: 6px 0 22px; font-size: 13.5px; color: #64748b; line-height: 1.5; }
        .na-welcome-options { display: flex; flex-direction: column; gap: 10px; }
        .na-welcome-opt { display: flex; align-items: center; gap: 14px; width: 100%; text-align: left; padding: 14px 16px; border: 1.5px solid #e2e8f0; border-radius: 14px; background: #fff; cursor: pointer; font-family: inherit; transition: all .15s; }
        .na-welcome-opt:hover { border-color: #1a6b3a; background: #f6fbf8; transform: translateY(-1px); }
        .na-welcome-opt-icon { flex-shrink: 0; width: 42px; height: 42px; border-radius: 12px; background: #f0fdf4; color: #166534; display: flex; align-items: center; justify-content: center; }
        .na-welcome-opt-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .na-welcome-opt-label { font-size: 14.5px; font-weight: 800; color: #0f172a; }
        .na-welcome-opt-sub { font-size: 12px; color: #64748b; }
        @media (max-width: 480px) {
          .na-welcome-overlay { align-items: flex-end; padding: 0; }
          .na-welcome-modal { max-width: none; border-radius: 22px 22px 0 0; padding: 30px 18px calc(18px + env(safe-area-inset-bottom)); animation: naSheetUp .28s cubic-bezier(.2,.9,.3,1); }
          .na-welcome-title { font-size: 18px; }
        }
        /* phones: sheets slide up from the bottom with a grab handle, like a native app */
        @keyframes naSheetUp { from { transform: translateY(100%); } to { transform: none; } }
        @media (max-width: 480px) {
          .na-welcome-modal::before, .na-exit-modal::before { content: ""; position: absolute; top: 9px; left: 50%; width: 40px; height: 4px; margin-left: -20px; border-radius: 4px; background: #d8e0dc; }
          .na-exit-modal { animation: naSheetUp .28s cubic-bezier(.2,.9,.3,1); }
        }
        @media (prefers-reduced-motion: reduce) { .na-welcome-modal, .na-exit-modal { animation: none !important; } }

        /* Team modal — new clients meet the Noida psychologists after picking a slot */
        .na-team-modal { max-width: 520px; padding: 0; display: flex; flex-direction: column; max-height: min(86vh, 760px); overflow: hidden; }
        .na-team-modal .na-welcome-close { z-index: 2; }
        .na-team-head { padding: 28px 26px 12px; }
        .na-team-head .na-welcome-sub { margin: 6px 0 0; }
        .na-team-slot { display: inline-flex; align-items: center; gap: 5px; margin-top: 10px; padding: 5px 10px; border-radius: 999px; background: #f0fdf4; color: #166534; font-size: 12.5px; font-weight: 700; }
        .na-team-body { flex: 1; overflow-y: auto; padding: 4px 26px 18px; overscroll-behavior: contain; }
        .na-team-card { display: flex; align-items: center; gap: 13px; width: 100%; text-align: left; padding: 12px 14px; margin-bottom: 9px; border: 1.5px solid #e2e8f0; border-radius: 16px; background: #fff; cursor: pointer; font-family: inherit; transition: border-color .15s, background .15s, transform .15s; }
        .na-team-card:hover { border-color: #1a6b3a; background: #f6fbf8; }
        .na-team-card:active { transform: scale(.985); }
        .na-team-any { border-style: dashed; }
        .na-team-av { position: relative; flex-shrink: 0; border-radius: 50%; overflow: hidden; background: #e7f5ec; color: #166534; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .na-team-av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .na-team-av-any { background: #fef3c7; color: #b45309; }
        .na-team-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .na-team-name { font-size: 15px; font-weight: 800; color: #0f172a; }
        .na-team-meta { font-size: 12.5px; color: #475569; }
        .na-team-sub { display: flex; flex-wrap: wrap; gap: 4px 10px; font-size: 11.5px; color: #64748b; }
        .na-team-rate { color: #b45309; font-weight: 700; font-size: 12px; }
        .na-team-view { flex-shrink: 0; font-size: 12px; font-weight: 700; color: #1a6b3a; padding: 6px 10px; border-radius: 999px; background: #f0fdf4; }
        .na-team-go { flex-shrink: 0; font-size: 22px; color: #94a3b8; }
        .na-team-back { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; margin: 18px 0 4px 20px; padding: 6px 10px; border: none; border-radius: 10px; background: #f1f5f9; color: #334155; font: 700 13px 'Inter', sans-serif; cursor: pointer; }
        .na-team-hero { display: flex; align-items: center; gap: 16px; padding: 10px 0 14px; }
        .na-team-hero-txt { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .na-team-hero-name { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -.3px; }
        .na-team-facts { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
        .na-team-facts > div { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border-radius: 12px; background: #f6f8f7; }
        .na-team-facts > div.wide { grid-column: 1 / -1; }
        .na-team-facts span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; color: #94a3b8; }
        .na-team-facts b { font-size: 13.5px; font-weight: 600; color: #0f172a; }
        .na-team-sec { margin-bottom: 14px; }
        .na-team-sec-h { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
        .na-team-bio { margin: 0; font-size: 13.5px; line-height: 1.6; color: #334155; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
        .na-team-bio.open { display: block; }
        .na-team-more { margin-top: 4px; padding: 0; border: none; background: none; color: #1a6b3a; font: 700 13px 'Inter', sans-serif; cursor: pointer; }
        .na-team-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .na-team-chips span, .na-team-chips button { padding: 5px 10px; border-radius: 999px; background: #f0fdf4; color: #166534; font: 600 12px 'Inter', sans-serif; border: 1px solid #dcfce7; }
        .na-team-chips button { background: #fff; color: #1a6b3a; cursor: pointer; }
        .na-team-full { display: inline-block; font-size: 13px; font-weight: 700; color: #1a6b3a; text-decoration: none; }
        .na-team-full:hover { text-decoration: underline; }
        .na-team-foot { padding: 12px 26px calc(16px + env(safe-area-inset-bottom)); border-top: 1px solid #eef2f0; background: #fff; }
        .na-team-cta { width: 100%; padding: 14px; border: none; border-radius: 14px; background: #1a6b3a; color: #fff; font: 800 15px 'Inter', sans-serif; cursor: pointer; box-shadow: 0 8px 18px -10px rgba(26,107,58,.7); }
        .na-team-cta:hover { background: #155a30; }
        @media (max-width: 600px) {
          .na-team-modal { max-width: none; padding: 0; max-height: 90vh; }
          .na-team-head { padding: 26px 18px 10px; }
          .na-team-body { padding: 4px 16px 16px; }
          .na-team-back { margin-left: 14px; }
          .na-team-foot { padding: 10px 16px calc(14px + env(safe-area-inset-bottom)); }
          .na-team-view { padding: 5px 8px; font-size: 11.5px; }
        }

        .na-back { flex-shrink: 0; width: 34px; height: 34px; border-radius: 10px; border: 1px solid #d5e3da; background: #fff; color: #1a6b3a; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; transition: all .15s; }
        .na-back:hover { background: #f0fdf4; border-color: #86efac; }
        .na-back:focus-visible { outline: 2px solid #1a6b3a; outline-offset: 2px; }
        @media (max-width: 640px) { .na-back { width: 30px; height: 30px; border-radius: 9px; } }

        .na-exit-overlay { position: fixed; inset: 0; z-index: 210; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(15,23,20,.45); animation: naWelcomeFade .2s ease; }
        .na-exit-modal { position: relative; width: 100%; max-width: 480px; max-height: calc(100vh - 32px); overflow-y: auto; background: #fff; border-radius: 22px; box-shadow: 0 30px 70px rgba(15,61,34,.28); padding: 28px 26px 22px; font-family: 'Inter', sans-serif; animation: naWelcomePop .22s cubic-bezier(.2,.9,.3,1.2); }
        .na-exit-title { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -.3px; padding-right: 30px; }
        .na-exit-sub { margin: 6px 0 16px; font-size: 13.5px; color: #64748b; line-height: 1.5; }
        .na-exit-reasons { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .na-exit-reason { display: inline-flex; align-items: center; gap: 4px; padding: 8px 13px; border-radius: 999px; border: 1.5px solid #e2e8f0; background: #fff; font-family: inherit; font-size: 13px; font-weight: 600; color: #334155; cursor: pointer; transition: all .15s; text-align: left; }
        .na-exit-reason:hover { border-color: #86efac; }
        .na-exit-reason.on { border-color: #1a6b3a; background: #f0fdf4; color: #166534; }
        .na-exit-label { display: block; margin: 8px 0 6px; font-size: 13px; font-weight: 800; color: #0f172a; }
        .na-exit-label span { font-weight: 500; color: #94a3b8; }
        .na-exit-input { width: 100%; height: 44px; box-sizing: border-box; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 12px; font-family: inherit; font-size: 14px; color: #0f172a; outline: none; background: #f8fafc; margin-bottom: 6px; }
        .na-exit-input:focus { border-color: #1a6b3a; background: #fff; }
        .na-exit-hint { margin: 0 0 14px; font-size: 12px; color: #94a3b8; }
        .na-exit-err { margin: -6px 0 12px; font-size: 12.5px; color: #dc2626; font-weight: 600; }
        .na-exit-actions { display: flex; gap: 8px; }
        .na-exit-btn { flex: 1; height: 46px; border-radius: 12px; font-family: inherit; font-size: 14px; font-weight: 800; cursor: pointer; transition: all .15s; }
        .na-exit-btn.primary { border: none; background: #1a6b3a; color: #fff; }
        .na-exit-btn.primary:disabled { background: #a7c4b2; cursor: not-allowed; }
        .na-exit-btn.ghost { border: 1.5px solid #d5e3da; background: #fff; color: #1a6b3a; }
        .na-exit-btn.ghost:hover { background: #f0fdf4; }
        .na-exit-skip { display: block; margin: 12px auto 0; border: none; background: none; font-family: inherit; font-size: 12.5px; color: #94a3b8; text-decoration: underline; cursor: pointer; }
        .na-exit-done { text-align: center; padding: 18px 0 10px; }
        .na-exit-done-icon { width: 52px; height: 52px; border-radius: 50%; background: #f0fdf4; color: #166534; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .na-exit-done .na-exit-title { padding-right: 0; }
        @media (max-width: 480px) {
          .na-exit-overlay { align-items: flex-end; padding: 0; }
          .na-exit-modal { max-width: none; border-radius: 20px 20px 0 0; padding: 24px 18px calc(18px + env(safe-area-inset-bottom)); max-height: 92vh; }
          .na-exit-title { font-size: 18px; }
          .na-exit-actions { flex-direction: column; }
          .na-exit-btn { flex: none; width: 100%; }
        }

        .na-offerbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 4px 20px 6px; padding: 9px 12px; border-radius: 12px; background: linear-gradient(90deg, #fff7ed, #fffbeb); border: 1px solid #fde68a; }
        .na-offerbar-gift { font-size: 18px; }
        .na-offerbar-txt { flex: 1; min-width: 180px; font-size: 13.5px; color: #78350f; }
        .na-offerbar-txt b { color: #7c2d12; }
        .na-offerbar-note { color: #92400e; }
        .na-offerbar-btn { border: none; background: #c2410c; color: #fff; font-weight: 800; font-size: 13px; padding: 8px 14px; border-radius: 9px; cursor: pointer; font-family: inherit; white-space: nowrap; }
        .na-offerbar-btn:hover { background: #9a3412; }
        button.na-slotcell.offer, button.na-slotcell.open { position: relative; }
        .na-offer-tag { position: absolute; top: -5px; right: -5px; width: 16px; height: 16px; border-radius: 50%; background: #dc2626; color: #fff; font-size: 10px; font-weight: 900; font-style: normal; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 2px #fff; pointer-events: none; }
        .na-offer-tag.inline { position: static; display: inline-flex; vertical-align: -3px; box-shadow: none; }
        .na-offer-pill { display: inline-block; background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; font-weight: 800; font-size: 12.5px; padding: 4px 10px; border-radius: 999px; margin-bottom: 10px; }
        .na-offer-code { font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #166534; border: 2px dashed #16a34a; border-radius: 12px; padding: 12px; margin: 10px 0 12px; user-select: all; }
        .na-offer-consent { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; color: #475569; margin: 6px 0 12px; cursor: pointer; }
        .na-offer-consent input { margin-top: 2px; }
        .na-coupon-hint { font-size: 12.5px; color: #c2410c; font-weight: 700; margin-top: 6px; }
        @media (max-width: 640px) { .na-offerbar { margin: 4px 10px 6px; padding: 8px 10px; flex-wrap: nowrap; } .na-offerbar-txt { min-width: 0; font-size: 12.5px; line-height: 1.35; } .na-offerbar-note { display: none; } .na-offerbar-gift { display: none; } .na-offerbar-btn { padding: 8px 11px; font-size: 12.5px; } }

        .na-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        .na-topbar { max-width: 1100px; margin: 0 auto; padding: 18px 20px 4px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .na-topbar-tabs { display: flex; gap: 6px; background: #fff; border-radius: 12px; padding: 5px; box-shadow: 0 4px 16px rgba(15,61,34,.08); }
        .na-topbar-tab { border: none; background: none; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 800; color: #64748b; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .na-topbar-tab.active { background: #1a6b3a; color: #fff; }
        .na-centre { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1 1 320px; }
        .na-centre-mark { flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px; background: #fff; border: 1px solid #d9e7de; padding: 6px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(15,61,34,.08); }
        .na-centre-mark img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .na-centre-txt { min-width: 0; flex: 0 1 auto; }
        .na-centre-name { font-size: 14px; font-weight: 800; color: #0f2a1d; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .na-centre-addr { font-size: 12px; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .na-centre-actions { display: flex; gap: 6px; flex-shrink: 0; margin-left: 4px; }
        .na-centre-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 8px; border: 1px solid #d5e3da; background: #fff; color: #1a6b3a; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; }
        .na-centre-btn:hover { background: #f0fdf4; border-color: #86efac; }
        .na-centre-btn.wa { color: #15803d; }
        .na-chips-host { flex: 1 1 100%; display: flex; justify-content: flex-end; }
        .na-chips-host:empty { display: none; }
        .na-chips-host .na-chip { padding: 5px 12px; font-size: 12.5px; }
        @media (min-width: 641px) and (max-width: 900px) {
          .na-centre { flex: 1 1 100%; }
          .na-centre-txt { flex: 1 1 0; }
        }
        @media (max-width: 640px) {
          /* the phone topbar is a wrapping column — without nowrap its line grows to the text's max-content and pushes the buttons off-screen */
          .na-topbar { flex-wrap: nowrap; }
          .na-chips-host { flex: 0 0 auto; justify-content: flex-end; }
          .na-chips-host .na-chips { justify-content: flex-end; flex-wrap: wrap; }
          .na-centre { flex: 0 0 auto; width: 100%; gap: 10px; }
          .na-centre-txt { flex: 1 1 0; }
          .na-centre-actions { margin-left: 0; }
          .na-centre-mark { width: 38px; height: 38px; border-radius: 10px; padding: 5px; }
          .na-centre-name { font-size: 13px; white-space: normal; overflow: visible; text-overflow: clip; }
          .na-centre-btn span { display: none; }
          .na-centre-btn { padding: 7px 9px; }
        }
        .na-shell { max-width: 1100px; margin: 8px auto 0; background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14); overflow: hidden; overflow: clip; }
        .na-shell .na-fullslots-wrap, .na-shell .na-centerwrap { max-width: none; }
        .na-shell .na-fullslots-wrap { padding-top: 6px; padding-bottom: 16px; }
        .na-shell .na-fullslots-wrap.na-tab { padding: 8px 10px 20px; }
        .na-shell .na-fullslots-wrap.has-bar { padding-bottom: calc(140px + var(--na-ck, 0px)); }
        .na-shell .na-fullslots-card, .na-shell .na-card { background: transparent; box-shadow: none; border-radius: 0; }
        .na-wa-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 16px; border-radius: 999px; background: #fff; border: 1.5px solid #bbf7d0; color: #166534; font-size: 13px; font-weight: 800; text-decoration: none; cursor: pointer; transition: all .15s; font-family: inherit; }
        .na-wa-btn:hover { background: #f0fdf4; border-color: #1a6b3a; }
        .na-skel { display: block; border-radius: 8px; background: linear-gradient(90deg, #e8eeeb 25%, #f6f8f7 37%, #e8eeeb 63%); background-size: 400% 100%; animation: naShimmer 1.4s ease infinite; }
        /* the site's bottom navigation reserves 75px of body padding up to 1200px wide; let the grey footer fill it */
        @media (max-width: 1200px) { .na-page { margin-bottom: -75px; } .na-foot-in { padding-bottom: 75px; } }
        .na-seo { background: transparent; padding: 26px 14px 0; }
        .na-left-tag { position: absolute; left: 50%; bottom: 3px; transform: translateX(-50%); font-style: normal; font-size: 9px; font-weight: 800; color: #9a6f22; background: #fbf3e2; border-radius: 999px; padding: 0 5px; line-height: 14px; white-space: nowrap; pointer-events: none; }
        .na-rv { margin: 22px 0 6px; }
        .na-rv-sum { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 0 0 14px; font-size: 13.5px; color: #64748b; }
        .na-rv-sum b { font-size: 30px; font-weight: 800; color: #14532d; line-height: 1; }
        .na-rv-stars { color: #d4a24c; letter-spacing: 1px; font-size: 16px; }
        .na-rv-stars i { font-style: normal; color: #e2e8e4; }
        .na-rv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
        .na-rv-card { margin: 0; padding: 16px; border-radius: 16px; background: #f6faf7; border: 1px solid #e2ece5; display: flex; flex-direction: column; gap: 8px; }
        .na-seo .na-rv-card blockquote { margin: 0; font-size: 14.5px; line-height: 1.6; color: #1f2937; }
        .na-rv-card figcaption { font-size: 12.5px; color: #64748b; }
        .na-rv-card figcaption b { color: #0b1712; }
        .na-rv-more { margin-top: 12px; border: 1px solid #bfe0cc; background: #fff; color: #14532d; border-radius: 999px; padding: 8px 16px; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
        .na-seo-in { max-width: 980px; margin: 0 auto; background: #fff; border-radius: 20px; box-shadow: 0 10px 34px rgba(15,61,34,.10); padding: 32px 36px 28px; color: #334155; font-size: 15px; line-height: 1.7; }
        /* desktop/tablet: same width as the slots card above (it is 100% - 28px, up to 1480px) */
        @media (min-width: 641px) { .na-seo-in { max-width: 1480px; } }
        .na-seo h2 { font-size: 24px; font-weight: 800; color: #0f2a1d; margin: 0 0 12px; line-height: 1.25; }
        .na-seo h3 { font-size: 18px; font-weight: 800; color: #0f2a1d; margin: 28px 0 10px; }
        .na-seo .na-seo-in p, .na-seo .na-seo-in li, .na-seo .na-seo-in address, .na-seo .na-seo-in summary { font-size: 15px; line-height: 1.7; color: #334155; font-family: inherit; }
        .na-seo .na-seo-in summary { color: #0f2a1d; font-weight: 700; }
        .na-seo .na-seo-in p { margin: 0 0 12px; }
        .na-seo .na-seo-in .na-seo-note { font-size: 13px; color: #64748b; }
        .na-seo .na-seo-in .na-seo-links { font-size: 14px; color: #64748b; }
        .na-seo .na-seo-in table, .na-seo .na-seo-in td, .na-seo .na-seo-in th { font-size: 14px; color: #334155; }
        .na-seo .na-seo-in th { color: #0f2a1d; }
        .na-seo a { color: #166534; font-weight: 600; }
        .na-seo-table-wrap { overflow-x: auto; }
        .na-seo-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .na-seo-table th, .na-seo-table td { text-align: left; padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
        .na-seo-table th { background: #f0f5f2; color: #0f2a1d; font-weight: 800; }
        .na-seo-note { font-size: 13px; color: #64748b; margin-top: 10px !important; }
        .na-seo-steps { margin: 0 0 12px; padding-left: 20px; } .na-seo-steps li { margin-bottom: 6px; }
        .na-seo-addr { font-style: normal; background: #f6f9f7; border: 1px solid #e2eae5; border-radius: 10px; padding: 14px 16px; }
        .na-seo-faq details { border: 1px solid #e2e8f0; border-radius: 10px; padding: 0 16px; margin-bottom: 8px; background: #fff; }
        .na-seo-faq summary { cursor: pointer; padding: 13px 0; font-weight: 700; color: #0f2a1d; }
        .na-seo-faq details[open] summary { border-bottom: 1px solid #eef2f6; margin-bottom: 10px; }
        .na-seo-faq details p { margin: 0 0 14px; }
        .na-seo-links { margin-top: 22px !important; font-size: 14px; color: #64748b; }
        @media (max-width: 640px) { .na-seo { padding: 16px 8px 0; } .na-seo-in { padding: 22px 16px 18px; border-radius: 16px; } .na-seo h2 { font-size: 20px; } .na-seo h3 { font-size: 16.5px; } .na-seo-in { font-size: 14.5px; } }
        .na-foot { background: #e9edeb; margin-top: 44px; padding: 44px 20px 40px; }
        .na-foot-in { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 32px; align-items: center; }
        .na-foot-in > :not(.na-foot-help) { grid-column: 1; }
        .na-foot-help { grid-column: 2; grid-row: 1 / span 5; align-self: center; width: 300px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; padding-left: 32px; border-left: 1px solid #d5dcd8; }
        .na-foot-help-title { font-size: 17px; font-weight: 800; color: #334155; }
        .na-foot-help-text { margin: 0; font-size: 13px; line-height: 1.55; color: #5b6b64; }
        .na-foot-help .na-wa-btn { margin-top: 4px; }
        .na-foot-big { font-size: clamp(30px, 6.4vw, 60px); font-weight: 800; line-height: 1.08; letter-spacing: -1.2px; color: #c5cec9; }
        .na-foot-tag { margin: 22px 0 0; font-size: 14px; line-height: 1.5; color: #5b6b64; }
        .na-foot-list { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 22px; }
        .na-foot-list li { margin: 0; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #475569; }
        .na-foot-list li svg { color: #5b6b64; }
        .na-foot-note { margin: 14px 0 0; display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; line-height: 1.5; color: #5b6b64; }
        .na-foot-note svg { flex: 0 0 auto; margin-top: 2px; }
        .na-foot-brand { grid-column: 1 / -1 !important; margin-top: 26px; padding-top: 16px; border-top: 1px solid #d5dcd8; font-size: 12px; font-weight: 700; color: #7b8a83; }
        .na-skel-chip { width: 170px; height: 14px; }
        .na-skel-head { width: 40px; height: 34px; margin: 0 auto; }
        .na-skel-time { width: 36px; height: 12px; }
        .na-skel-cell { height: 44px; border-radius: 12px; }
        @keyframes naShimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
        @media (prefers-reduced-motion: reduce) { .na-skel { animation: none; } }
        .na-empty { text-align: center; padding: 44px 16px; }
        .na-empty-ic { width: 60px; height: 60px; border-radius: 50%; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .na-empty-title { font-size: 16px; font-weight: 800; color: #0f172a; }
        .na-empty-text { font-size: 13.5px; color: #64748b; line-height: 1.6; margin: 6px auto 18px; max-width: 340px; }

        .na-centerwrap { max-width: 1100px; margin: 0 auto; padding: 20px 20px 60px; }
        .na-card-inner { max-width: 560px; margin: 0 auto; }
        .na-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14); padding: 28px 24px 32px; }

        .na-picked-banner { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; border-radius: 12px; padding: 10px 14px; font-size: 13px; font-weight: 700; margin-bottom: 18px; }
        .na-picked-change { background: none; border: none; color: #1a6b3a; font-size: 12px; font-weight: 800; text-decoration: underline; cursor: pointer; flex-shrink: 0; padding: 12px 10px; margin: -12px -10px; font-family: inherit; }

        .na-fullslots-wrap { max-width: 1100px; margin: 0 auto; padding: 20px 20px 60px; }
        .na-fullslots-card { background: #fff; border-radius: 20px; box-shadow: 0 20px 50px rgba(15,61,34,.14); padding: 26px 26px 22px; }
        .na-fullslots-title { font-size: 16px; font-weight: 800; color: #0f172a; }
        .na-fullslots-sub { font-size: 12.5px; color: #64748b; margin-top: 3px; margin-bottom: 18px; }
        .na-fullslots-scroll { overflow-x: auto; }
        .na-fullslots-table { width: 100%; border-collapse: separate; border-spacing: 6px; }
        .na-fullslots-table th, .na-fullslots-table td, .na-fullslots-table tr { border: 0; }
        .na-fullslots-table th { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; padding: 6px 5px 10px; text-align: center; white-space: nowrap; line-height: 1.4; }
        .na-fullslots-table td { padding: 0; text-align: center; }
        .na-fullslots-table td.na-time-col { text-align: center; font-size: 13px; font-weight: 800; color: #1e293b; white-space: nowrap; background: #eef3f0; border-radius: 12px; padding: 0 12px; width: 104px; letter-spacing: .1px; }
        .na-fullslots-table th:first-child { width: 104px; }
        .na-slotcell { display: flex; align-items: center; justify-content: center; width: 100%; min-width: 68px; height: 44px; border-radius: 12px; border: 1.5px solid transparent; font-size: 13px; font-weight: 800; cursor: default; box-sizing: border-box; font-family: inherit; }
        button.na-slotcell.open { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; cursor: pointer; transition: all .15s; }
        button.na-slotcell.open:hover { background: #1a6b3a; border-color: #1a6b3a; color: #fff; transform: translateY(-1px); }
        button.na-slotcell.open.selected { background: #1a6b3a; border-color: #1a6b3a; color: #fff; box-shadow: 0 0 0 3px rgba(26,107,58,.2); }
        button.na-slotcell.open.selected:hover { transform: none; }
        button.na-slotcell.lastminute { background: #fffbeb; border-color: #fde68a; color: #b45309; cursor: pointer; transition: all .15s; }
        button.na-slotcell.lastminute:hover { background: #b45309; border-color: #b45309; color: #fff; transform: translateY(-1px); }
        button.na-slotcell.lastminute.selected { background: #b45309; border-color: #b45309; color: #fff; box-shadow: 0 0 0 3px rgba(245,158,11,.25); }
        button.na-slotcell.lastminute.selected:hover { transform: none; }
        .na-slotcell.taken { background: #fef2f2; border-color: #fecaca; color: #fca5a5; overflow: hidden; }
        .na-wm { display: inline-flex; align-items: flex-end; font-size: 16px; font-weight: 800; letter-spacing: -.3px; text-transform: lowercase; line-height: 1; }
        .na-wm-dot { display: inline-block; flex-shrink: 0; width: 6px; height: 6px; margin: 0 0 1px 2px; border-radius: 50%; background: #f5b301; }
        .na-past-label { font-size: 9px; font-weight: 700; letter-spacing: .4px; color: #64748b; text-transform: uppercase; }
        .na-slotcell.taken { flex-direction: column; gap: 2px; padding: 0 4px; }
        .na-taken-stamp { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-size: 12px; font-weight: 500; letter-spacing: .1px; color: #b91c1c; white-space: nowrap; line-height: 1.1; }
        .na-slotcell.taken.mine { background: #eff6ff; border-color: #bfdbfe; }
        .na-taken-stamp.mine { color: #1d4ed8; font-weight: 800; }
        .na-slotcell.closed { background: repeating-linear-gradient(135deg, #f8fafc 0 6px, #eef2f6 6px 12px); border-color: #eef2f6; }
        .na-slotcell.past { background: #f8fafc; color: #e2e8f0; }
        .na-sw-open { background: #f0fdf4; border: 1.5px solid #bbf7d0; }
        .na-sw-lm { background: #fffbeb; border: 1.5px solid #fde68a; }
        .na-sw-taken { background: #fef2f2; border: 1.5px solid #fecaca; }
        .na-sw-mine { background: #eff6ff; border: 1.5px solid #bfdbfe; }
        .na-sw-past { background: #f1f5f9; }
        .na-sw-closed { background: repeating-linear-gradient(135deg, #f8fafc 0 3px, #dbe2ea 3px 6px); border: 1px solid #e2e8f0; }
        .na-fullslots-table th.na-th-today { color: #166534; background: #e7f5ec; border-radius: 12px; }
        .na-th-m.na-th-today { background: transparent; }
        .na-td-today button.na-slotcell.open { border-color: #86efac; }
        .na-foot-link { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
        .na-foot-link:hover { color: #166534; }
        .na-hd { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; column-gap: 12px; row-gap: 2px; margin-bottom: 10px; }
        .na-hd .na-fullslots-sub { margin: 0; }
        .na-hd-r { justify-self: end; min-width: 0; }
        .na-hd .na-next-btn { padding: 5px 11px; font-size: 12px; }
        .na-hd .na-chip { padding: 4px 10px; font-size: 12px; }
        .na-fnote { margin-top: 5px; font-size: 12px; font-weight: 600; color: #b45309; }
        .na-draft-note { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 12px; margin-bottom: 14px; padding: 10px 14px; border-radius: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 13px; font-weight: 600; }
        .na-linkbtn { background: none; border: none; padding: 0; color: #166534; font-size: 13px; font-weight: 800; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; font-family: inherit; }
        .na-alts { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: -4px 0 14px; }
        .na-alts-k { font-size: 12.5px; font-weight: 700; color: #475569; }
        .na-alt { padding: 7px 14px; border-radius: 999px; border: 1.5px solid #86efac; background: #f0fdf4; color: #166534; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit; }
        .na-alt:hover { background: #dcfce7; border-color: #4ade80; }
        .na-perks .na-help-link { margin: 0; font-size: 12px; }
        .na-selbar-btn:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
        .na-selbar.inflow { position: static; animation: none; box-shadow: none; background: transparent; border-top: 1px solid #e2e8f0; padding: 10px 6px 0; margin-top: 8px; }
        .na-selbar.inflow .na-selbar-btn { height: 46px; }

        /* Tablet + desktop: the tabs sit in the card and the slots screen is exactly one viewport tall — no page or table scrolling. */
        .na-page.na-fit .na-topbar { max-width: none; margin: 0; align-self: stretch; padding: 12px 22px 0; justify-content: space-between; }
        .na-page.na-fit .na-topbar-tabs { background: #f1f5f3; box-shadow: none; }
        /* the card IS the page: edge to edge, full viewport height */
        .na-page.na-fit { background: #f1f5f3; }
        .na-page.na-fit .na-shell { max-width: none; width: 100%; margin: 0; border-radius: 0; box-shadow: none; min-height: calc(100vh - var(--na-ck, 0px)); min-height: calc(100dvh - var(--na-ck, 0px)); }
        .na-page.na-fit.is-tablet .na-shell { margin: 0; }
        .na-page.na-fit .na-shell:not(.fit-slots) { display: flex; flex-direction: column; }
        .na-page.na-fit .na-shell:not(.fit-slots) > .na-centerwrap { flex: 1; display: flex; flex-direction: column; margin: 0; width: 100%; box-sizing: border-box; padding-bottom: 24px; }
        .na-page.na-fit .na-shell:not(.fit-slots) > .na-centerwrap > .na-card { margin: auto; width: 100%; max-width: 700px; }
        .na-page.na-fit .na-shell.fit-slots { height: calc(100vh - var(--na-ck, 0px)); height: calc(100dvh - var(--na-ck, 0px)); display: flex; flex-direction: column; }
        .na-page.na-fit .na-shell.fit-slots, .na-page.na-fit.is-tablet .na-shell.fit-slots { width: calc(100% - 28px); max-width: 1480px; margin: 12px auto 0; border-radius: 20px; box-shadow: 0 10px 34px rgba(15,61,34,.12); height: calc(100vh - var(--na-ck, 0px) - 24px); height: calc(100dvh - var(--na-ck, 0px) - 24px); min-height: 0; }
        @media (max-width: 640px) { .na-page.na-fit .na-shell.fit-slots, .na-page.na-fit.is-tablet .na-shell.fit-slots { width: calc(100% - 16px); margin-top: 8px; border-radius: 16px; height: calc(100vh - var(--na-ck, 0px) - 16px); height: calc(100dvh - var(--na-ck, 0px) - 16px); } }
        .na-page.na-fit .na-shell.fit-slots > .na-fullslots-wrap { margin: 0; width: 100%; box-sizing: border-box; flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 2px 22px 14px; }
        .na-page.na-fit .na-shell.fit-slots .na-tab-cols { flex: 1; min-height: 0; display: flex; gap: 16px; align-items: stretch; }
        .na-page.na-fit .na-shell.fit-slots .na-tab-main { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: column; padding: 4px 6px 0; }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll { flex: 1; min-height: 0; overflow: hidden; }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.fit .na-slotcell { height: var(--na-cell-h, 36px); min-width: 0; }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-table { table-layout: fixed; }
        .na-page.na-fit .na-shell.fit-slots .na-skel-cell { height: 30px; }
        /* phones: swipe sideways through the days — wide columns (~3.4 visible), time column pinned on the left */
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe { overflow-x: auto; overflow-y: hidden; scroll-snap-type: x proximity; scroll-padding-left: 82px; overscroll-behavior-x: contain; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .na-fullslots-scroll.swipe::-webkit-scrollbar { display: none; }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-fullslots-table { table-layout: auto; width: max-content; min-width: 100%; }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th:not(:first-child), .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe td:not(.na-time-col) { min-width: calc((100vw - 100px) / 3.2); }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe thead th:not(:first-child) { scroll-snap-align: start; }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th:first-child, .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe td.na-time-col { position: sticky; left: 0; z-index: 3; }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th:first-child { background: #fff; }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe td.na-time-col { box-shadow: 6px 0 8px -6px rgba(15, 61, 34, .22); }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th:first-child, .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe td.na-time-col { width: 78px; min-width: 78px; }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe td.na-time-col { font-size: 12.5px; font-weight: 800; padding: 0 4px; border-radius: 10px; letter-spacing: 0; }
        @media (max-width: 640px) and (max-height: 700px) {
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-legend, .na-page.na-fit .na-shell.fit-slots .na-pager-range { display: none; }
          .na-page.na-fit .na-selbar.inflow .na-selbar-h { display: none; }
        }
        @media (max-width: 640px) {
          .na-page.na-fit .na-topbar { padding: 8px 10px 0; }
          /* plain day headers on phones: no green block, small circle for today */
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-table th.na-th-today { background: transparent; }
          .na-page.na-fit .na-shell.fit-slots .na-th-m { padding: 0 0 4px !important; }
          .na-page.na-fit .na-shell.fit-slots .na-th-m .na-dn { width: 24px; height: 24px; border-radius: 12px; font-size: 13px; margin-top: 2px; }
          .na-page.na-fit .na-shell.fit-slots .na-th-m .na-mo { font-size: 9px; }
          .na-page.na-fit .na-topbar-tabs { width: 100%; }
          .na-page.na-fit .na-shell.fit-slots > .na-fullslots-wrap { padding: 2px 8px 8px; }
          .na-page.na-fit .na-shell.fit-slots .na-tab-main { padding: 2px 0 0; }
          .na-page.na-fit .na-shell.fit-slots .na-pager-row { margin-bottom: 4px; }
          .na-page.na-fit .na-shell.fit-slots .na-quick-row { gap: 6px 8px; margin-bottom: 6px; }
          .na-page.na-fit .na-shell.fit-slots .na-next-btn { padding: 5px 11px; font-size: 12px; }
          .na-page.na-fit .na-shell.fit-slots .na-chip { padding: 4px 10px; font-size: 12px; }
          .na-page.na-fit .na-shell.fit-slots .na-perks { display: none; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-legend { margin-top: 4px; padding-top: 6px; gap: 3px 10px; }
          .na-page.na-fit .na-selbar.inflow { padding: 6px 2px 0; margin-top: 4px; gap: 10px; }
          .na-page.na-fit .na-selbar.inflow .na-selbar-k { display: none; }
          .na-page.na-fit .na-selbar.inflow .na-selbar-v { font-size: 14px; }
          .na-page.na-fit .na-selbar.inflow .na-selbar-btn { height: 42px; padding: 0 18px; font-size: 14px; }
        }
        .na-page.na-fit .na-shell.fit-slots .na-fullslots-legend { margin-top: 6px; padding-top: 8px; gap: 4px 14px; flex-shrink: 0; }
        .na-page.na-fit .na-shell.fit-slots .na-perks { margin-top: 8px; padding: 7px 12px; gap: 4px 16px; flex-shrink: 0; }
        .na-page.na-fit .na-shell.fit-slots .na-perks span { font-size: 11.5px; }
        .na-page.na-fit .na-shell.fit-slots .na-tab-panel { min-height: 0; overflow-y: auto; }
        .na-page.na-fit .na-shell.fit-slots .na-tab-selcard { position: static; padding: 12px 18px; flex-shrink: 0; }
        @media (max-height: 820px) { .na-page.na-fit .na-shell.fit-slots .na-perks span:not(.na-perk-price) { display: none; } }
        @media (max-height: 780px) {
          .na-page.na-fit:not(.is-tablet) .na-topbar { padding: 8px 22px 0; }
          .na-page.na-fit:not(.is-tablet) .na-topbar-tab { padding: 6px 16px; }
          .na-page.na-fit:not(.is-tablet) .na-shell.fit-slots .na-hd { grid-template-columns: minmax(0, 1fr) auto auto; margin-bottom: 6px; }
          .na-page.na-fit:not(.is-tablet) .na-shell.fit-slots .na-hd .na-fullslots-sub { display: none; }
          .na-page.na-fit:not(.is-tablet) .na-shell.fit-slots .na-perks { display: none; }
          .na-page.na-fit:not(.is-tablet) .na-shell.fit-slots .na-fullslots-legend { margin-top: 4px; padding-top: 6px; }
          .na-page.na-fit:not(.is-tablet) .na-selbar.inflow { padding-top: 6px; margin-top: 4px; }
          .na-page.na-fit:not(.is-tablet) .na-selbar.inflow .na-selbar-k { display: none; }
          .na-page.na-fit:not(.is-tablet) .na-selbar.inflow .na-selbar-btn { height: 40px; }
        }
        .na-quick-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; margin: 0 0 12px; }
        .na-chips { display: inline-flex; gap: 6px; flex-wrap: wrap; }
        .na-chip { padding: 7px 13px; border-radius: 999px; border: 1.5px solid #e2e8f0; background: #fff; color: #475569; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all .15s; }
        .na-chip:hover { border-color: #94a3b8; }
        .na-chip.on { background: #166534; border-color: #166534; color: #fff; }
        button.na-slotcell.recommended:not(.selected) { box-shadow: 0 0 0 3px rgba(34,197,94,.28); animation: naRecPulse 2.2s ease-in-out infinite; }
        @keyframes naRecPulse { 0%, 100% { box-shadow: 0 0 0 2px rgba(34,197,94,.22); } 50% { box-shadow: 0 0 0 5px rgba(34,197,94,.32); } }
        .na-perks { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 16px; padding: 12px 14px; border-radius: 12px; background: #f8fafc; border: 1px solid #eef2f6; }
        .na-perks span { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #475569; }
        .na-perks svg { color: #166534; }
        .na-perks .na-perk-price { color: #0f172a; font-weight: 800; }
        .na-help-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; font-size: 12.5px; font-weight: 700; color: #166534; text-decoration: none; }
        .na-help-link:hover { text-decoration: underline; }
        .na-next-btn { display: inline-flex; align-items: center; gap: 8px; margin: 0; padding: 8px 14px; border-radius: 999px; border: 1.5px solid #86efac; background: #f0fdf4; color: #166534; font-size: 12.5px; font-weight: 600; cursor: pointer; text-align: left; transition: background .15s, border-color .15s; }
        .na-next-btn:hover { background: #dcfce7; border-color: #4ade80; }
        /* phones: compact app bar — no logo tile, name + address on one line each, slimmer tabs and offer bar */
        @media (max-width: 640px) {
          .na-page .na-centre-mark { display: none; }
          .na-page .na-centre { gap: 10px; }
          .na-page .na-centre-name { font-size: 14.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .na-page .na-centre-addr { font-size: 11.5px; }
          .na-page .na-centre-btn { width: 36px; height: 36px; padding: 0; justify-content: center; border-radius: 11px; }
          .na-page .na-topbar-tabs { padding: 3px; border-radius: 12px; }
          .na-page .na-topbar .na-topbar-tab { height: 38px; font-size: 13px; border-radius: 9px; }
          .na-page .na-offerbar { padding: 7px 8px 7px 12px; border-radius: 12px; }
          .na-page .na-offerbar-txt { white-space: normal; overflow: visible; font-size: 12px; line-height: 1.4; }
          .na-page .na-offerbar { align-items: center; }
          .na-page .na-offerbar-btn { padding: 7px 11px; font-size: 12px; border-radius: 9px; }
        }
        /* ── phones: full-screen app layout — edge-to-edge sheet, green app bar, 4+ days per screen ── */
        @media (max-width: 640px) {
          .na-page.na-fit .na-shell.fit-slots, .na-page.na-fit.is-tablet .na-shell.fit-slots { width: 100%; margin: 0; border-radius: 0; box-shadow: none; height: calc(100vh - var(--na-ck, 0px)); height: calc(100dvh - var(--na-ck, 0px)); }
          .na-page.na-fit .na-topbar { background: linear-gradient(160deg, #1f7a45, #145c32); padding: 10px 12px 12px !important; gap: 10px; }
          .na-page .na-topbar .na-centre-name { color: #fff; }
          .na-page .na-topbar .na-centre-addr { color: rgba(255,255,255,.78); }
          .na-page .na-topbar .na-centre-addr svg { color: rgba(255,255,255,.78); }
          .na-page .na-topbar .na-back, .na-page .na-topbar .na-centre-btn { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.22); color: #fff; }
          .na-page .na-topbar .na-topbar-tabs { background: rgba(0,0,0,.16) !important; box-shadow: none; }
          .na-page .na-topbar .na-topbar-tab { color: rgba(255,255,255,.82); }
          .na-page .na-topbar .na-topbar-tab.active { background: #fff; color: #145c32; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
          .na-page.na-fit .na-shell.fit-slots .na-offerbar { margin: 10px 10px 4px; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th:not(:first-child), .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe td:not(.na-time-col) { min-width: calc((100vw - 74px) / 4.3) !important; width: calc((100vw - 74px) / 4.3); }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th:first-child, .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe td.na-time-col { width: 58px !important; min-width: 58px !important; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe td.na-time-col { font-size: 11px !important; padding: 0 2px !important; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-fullslots-table { border-spacing: 5px; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-slotcell { border-radius: 11px; border-width: 1px; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe button.na-slotcell.open::after { font-size: 11px; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-taken-stamp { font-size: 10.5px; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-offer-tag { width: 14px; height: 14px; font-size: 9px; top: -4px; right: -3px; }
        }
        /* ── phones: the slots table, dressed like an app — day cards on top, soft rounded tiles, quiet booked cells ── */
        @media (max-width: 640px) {
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-fullslots-table { border-spacing: 6px; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th.na-th-m { padding: 4px 0 !important; background: #fff; border: 1px solid #e6ece8; border-radius: 10px; line-height: 1.15; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th.na-th-m .na-wd { font-size: 9.5px; letter-spacing: .3px; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th.na-th-m .na-dn { display: block !important; width: auto !important; height: auto !important; margin: 0; font-size: 13.5px; line-height: 1.15; text-align: center !important; background: none !important; color: #0f172a; border-radius: 0; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th.na-th-m .na-mo { font-size: 8.5px; font-weight: 700; color: #94a3b8; line-height: 1.1; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th.na-th-m.na-th-today { background: #1a6b3a !important; border-color: #1a6b3a; box-shadow: 0 4px 10px -5px rgba(26,107,58,.5); }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th.na-th-m.na-th-today .na-wd, .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th.na-th-m.na-th-today .na-dn, .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th.na-th-m.na-th-today .na-mo { color: #fff; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe th:first-child { background: #fff; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe td.na-time-col { background: #fff; color: #334155; font-size: 12px; box-shadow: -8px 0 0 #fff, 0 -6px 0 #fff, 6px 0 8px -7px rgba(15,61,34,.25); border-radius: 0; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-slotcell { border-radius: 14px; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe button.na-slotcell.open { background: #f0fdf4; border-color: #c7eed5; color: #15803d; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe button.na-slotcell.open .na-wm { display: none; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe button.na-slotcell.open::after { content: "Available"; font-size: 12px; font-weight: 800; letter-spacing: .2px; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe button.na-slotcell.open.selected::after { content: "✓"; font-size: 20px; line-height: 1; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe button.na-slotcell.open.selected { background: #1a6b3a; border-color: #1a6b3a; color: #fff; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe button.na-slotcell:active { transform: scale(.95); }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-slotcell.taken { background: #fef2f2; border-color: #fecaca; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-taken-stamp { color: #dc2626; font-size: 11.5px; font-weight: 600; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-slotcell.taken.mine { background: #eef2ff; border-color: #c7d2fe; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-taken-stamp.mine { color: #4338ca; font-weight: 800; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-slotcell.past { background: #fafbfb; border-color: #f1f4f2; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-past-label { color: #cbd5e1; }
          .na-page.na-fit .na-shell.fit-slots .na-fullslots-scroll.swipe .na-slotcell.closed { background: #fafbfb; border-color: #f1f4f2; }
          .na-page .na-fullslots-legend span { font-size: 11px; }
          .na-page .na-fullslots-legend .na-sw-past, .na-page .na-fullslots-legend .na-sw-closed { background: #fafbfb; border: 1px solid #eef1ef; }
        }
        .na-fullslots-legend { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 18px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
        .na-fullslots-legend span { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: #64748b; font-weight: 600; }
        .na-fullslots-legend i { display: inline-block; width: 11px; height: 11px; border-radius: 3px; }
        .na-fullslots-empty { font-size: 13px; color: #64748b; padding: 40px 0; text-align: center; }

        .na-steps { display: flex; align-items: center; gap: 6px; margin-bottom: 22px; }
        .na-step-dot { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .na-step-circle { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; border: 2px solid #cbd5e1; color: #64748b; background: #fff; transition: all .2s; }
        .na-step-dot.done .na-step-circle { background: #1a6b3a; border-color: #1a6b3a; color: #fff; }
        .na-step-dot.active .na-step-circle { border-color: #1a6b3a; color: #1a6b3a; }
        .na-step-label { font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .4px; }
        .na-step-dot.active .na-step-label, .na-step-dot.done .na-step-label { color: #1a6b3a; }
        .na-step-line { position: relative; overflow: hidden; flex: 1.4; height: 2px; background: #e2e8f0; margin-top: -22px; }
        .na-step-line::after { content: ""; position: absolute; inset: 0; background: #1a6b3a; transform: scaleX(0); transform-origin: left center; transition: transform .45s ease; }
        .na-step-line.done::after { transform: scaleX(1); }
        .na-step-dot.active .na-step-circle { box-shadow: 0 0 0 4px rgba(26,107,58,.14); }
        .na-step-dot.done .na-step-circle svg { animation: naPop .35s ease; }

        .na-section-label { font-size: 11.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px; }

        .na-pill-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .na-pill { flex: 1; min-width: 90px; padding: 10px 8px; border-radius: 10px; text-align: center; border: 1.5px solid #e2e8f0; background: #fff; cursor: pointer; transition: all .15s; font-size: 12.5px; font-weight: 700; color: #334155; }
        .na-pill:hover { border-color: #94a3b8; }
        .na-pill.active { background: #f0fdf4; border-color: #1a6b3a; color: #15803d; }
        .na-pill-price { display: block; font-size: 10.5px; font-weight: 600; color: #64748b; margin-top: 2px; }
        .na-pill.active .na-pill-price { color: #15803d; }

        .na-pkg-card-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .na-pkg-custom { flex-wrap: wrap; gap: 10px 12px; }
        .na-stepper { display: inline-flex; align-items: center; gap: 4px; margin-left: auto; }
        .na-stepper button { width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid #cbd5e1; background: #fff; color: #1a6b3a; font-size: 20px; line-height: 1; cursor: pointer; padding: 0; display: inline-flex; align-items: center; justify-content: center; font-family: inherit; }
        .na-stepper button:disabled { opacity: .35; cursor: default; }
        .na-stepper span { min-width: 28px; text-align: center; font-size: 16px; font-weight: 600; color: #0f172a; }
        .na-pkg-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; transition: all .15s; }
        .na-pkg-card:hover { border-color: #94a3b8; }
        .na-pkg-card.active { background: #f0fdf4; border-color: #1a6b3a; }
        .na-pkg-card-name { font-size: 13px; font-weight: 700; color: #0f172a; }
        .na-pkg-card-meta { font-size: 11.5px; color: #64748b; margin-top: 2px; }
        .na-pkg-card-price { font-size: 14px; font-weight: 800; color: #1a6b3a; }

        .na-inp { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 11px 13px; font-size: 14px; color: #0f172a; outline: none; background: #f8fafc; box-sizing: border-box; font-family: inherit; transition: border-color .15s; }
        .na-inp:focus { border-color: #1a6b3a; background: #fff; }
        .na-textarea { resize: vertical; min-height: 70px; line-height: 1.6; }
        .na-lbl { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .5px; display: block; margin-bottom: 6px; }
        .na-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        @media (max-width: 480px) { .na-row { grid-template-columns: 1fr; } }

        .na-btn-row { display: flex; gap: 10px; margin-top: 10px; }
        .na-btn-back { flex: 0 0 auto; padding: 15px 20px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; color: #475569; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .15s; }
        .na-btn-back:hover { border-color: #94a3b8; }
        .na-submit { display: block; width: 100%; flex: 1; padding: 15px 0; border: none; border-radius: 12px; background: linear-gradient(135deg, #166534, #1a6b3a); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; transition: all .2s; box-shadow: 0 6px 18px rgba(22,101,52,.28); }
        .na-submit:disabled { opacity: .6; cursor: not-allowed; }

        .na-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 13px; font-weight: 600; padding: 10px 14px; border-radius: 10px; margin-bottom: 16px; }

        .na-lookup-box { border-radius: 12px; padding: 12px 14px; margin-bottom: 18px; font-size: 13px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .na-lookup-checking { background: #f8fafc; color: #64748b; }
        .na-lookup-found { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-weight: 700; }
        .na-lookup-notfound { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
        .na-lookup-link { background: none; border: none; color: inherit; text-decoration: underline; font-size: 12px; font-weight: 700; cursor: pointer; padding: 0; flex-shrink: 0; }

        .na-review { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; font-size: 13.5px; color: #334155; line-height: 2; margin-bottom: 20px; }
        .na-review strong { color: #0f172a; }
        .na-th { margin: 2px 0 14px; }
        .na-th-opt { font-weight: 400; text-transform: none; letter-spacing: 0; color: #94a3b8; }
        .na-th-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; }
        .na-th-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; text-align: left; font-family: inherit; min-width: 0; transition: all .15s; }
        .na-th-card:hover { border-color: #94a3b8; }
        .na-th-card.on { background: #f0fdf4; border-color: #1a6b3a; }
        .na-th-av { position: relative; width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; background: #e2e8f0; color: #475569; font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .na-th-av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .na-th-any { background: #f1f5f9; color: #64748b; font-size: 17px; }
        .na-th-body { display: flex; flex-direction: column; min-width: 0; }
        .na-th-name { font-size: 13.5px; font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .na-th-meta { font-size: 11.5px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .na-th-rate { display: flex; align-items: center; gap: 3px; margin-top: 2px; font-size: 11.5px; font-weight: 600; color: #92400e; }
        .na-th-star { color: #f59e0b; font-size: 13px; line-height: 1; }
        .na-th-cnt { font-weight: 400; color: #64748b; }
        .na-th-hint { margin-top: 6px; font-size: 12px; color: #64748b; }
        @media (max-width: 640px) {
          .na-th-row { display: flex; overflow-x: auto; scroll-snap-type: x proximity; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
          .na-th-card { flex: 0 0 212px; scroll-snap-align: start; min-height: 60px; }
        }
        .na-coupon { padding: 4px 0 10px; }
        .na-coupon-link { background: none; border: none; color: #1a6b3a; font-size: 13px; font-weight: 600; text-decoration: underline; cursor: pointer; padding: 10px 0; font-family: inherit; }
        .na-coupon-row { display: flex; gap: 8px; padding-top: 6px; }
        .na-coupon-row .na-inp { flex: 1; min-width: 0; text-transform: uppercase; letter-spacing: .5px; }
        .na-coupon-btn { height: 46px; padding: 0 18px; border-radius: 10px; border: 1.5px solid #1a6b3a; background: #fff; color: #1a6b3a; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .na-coupon-btn:disabled { opacity: .55; cursor: default; }
        .na-coupon-err { margin-top: 8px; font-size: 12.5px; color: #b91c1c; }
        .na-coupon-applied { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 6px; padding: 10px 12px; border-radius: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; font-size: 13px; }
        .na-coupon-applied button { background: none; border: none; color: inherit; text-decoration: underline; font-size: 12.5px; font-weight: 600; cursor: pointer; padding: 6px 0 6px 8px; font-family: inherit; }
        .na-price-breakdown { border-top: 1px dashed #cbd5e1; margin-top: 8px; padding-top: 8px; }
        .na-price-total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #1a6b3a; margin-top: 4px; }

        .na-lastmin-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 18px; margin-top: 4px; }
        .na-lastmin-title { font-size: 14px; font-weight: 800; color: #92400e; margin-bottom: 6px; }
        .na-lastmin-text { font-size: 13px; color: #78350f; line-height: 1.6; }

        .na-success { text-align: center; padding: 20px 4px; }
        .na-success-icon { width: 72px; height: 72px; border-radius: 50%; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 34px; }
        .na-success h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
        .na-success p { font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 20px; }
        .na-summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; text-align: left; font-size: 13.5px; color: #334155; line-height: 2; }
        .na-address-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 18px; text-align: left; margin-top: 12px; }
        .na-address-title { font-size: 12.5px; font-weight: 800; color: #166534; margin-bottom: 6px; }
        .na-address-text { font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 10px; }
        .na-address-link { font-size: 12.5px; font-weight: 700; color: #1a6b3a; text-decoration: none; }
        .na-address-link:hover { text-decoration: underline; }

        .na-pager-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; padding: 0 2px; }
        .na-pager-range { font-size: 12px; color: #64748b; margin-top: 2px; }
        .na-pager-head { flex: 1; min-width: 0; }
        .na-pager-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .na-pager-line .na-chips { flex-wrap: nowrap; gap: 4px; flex-shrink: 0; margin-left: auto; }
        .na-page.na-fit .na-shell.fit-slots .na-pager-line .na-chip { padding: 5px 9px; font-size: 12px; }
        .na-pager-line .na-fullslots-title { white-space: nowrap; flex-shrink: 0; }
        .na-pager-line .na-chips { min-width: 0; overflow-x: auto; scrollbar-width: none; }
        @media (max-width: 380px) { .na-page.na-fit .na-shell.fit-slots .na-pager-line .na-chip { padding: 4px 6px; font-size: 11px; } .na-pager-line .na-chips { gap: 3px; } }
        @media (max-width: 340px) { .na-page.na-fit .na-shell.fit-slots .na-pager-line .na-chip { padding: 4px 4px; font-size: 10px; } .na-pager-line .na-fullslots-title { font-size: 13px; } }
        /* breathing room between the tabs above and the title/chips line */
        @media (max-width: 640px) { .na-page .na-shell .na-pager-row { margin-top: 10px; } }
        .na-pager-btns { display: flex; gap: 6px; flex-shrink: 0; }
        .na-pager-btn { width: 40px; height: 40px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; color: #1a6b3a; font-size: 22px; font-weight: 800; line-height: 1; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; font-family: inherit; }
        .na-pager-btn:disabled { color: #cbd5e1; background: #f8fafc; cursor: default; }
        .na-th-m { padding: 0 0 6px !important; }
        .na-wd { font-size: 10px; font-weight: 800; letter-spacing: .5px; color: #64748b; text-transform: uppercase; }
        .na-dn { margin: 3px auto 0; width: 26px; height: 26px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #0f172a; }
        .na-dn.today { background: #1a6b3a; color: #fff; }
        .na-mo { font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 1px; }
        .na-selbar { position: fixed; left: 0; right: 0; bottom: var(--na-ck, 0px); z-index: 50; display: flex; align-items: center; gap: 12px; padding: 12px 16px calc(14px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #e2e8f0; box-shadow: 0 -8px 24px rgba(15,61,34,.10); }
        @media (min-width: 641px) { .na-selbar { padding-left: max(16px, calc((100vw - 1100px) / 2 + 26px)); padding-right: max(16px, calc((100vw - 1100px) / 2 + 26px)); } }
        .na-selbar-info { flex: 1; min-width: 0; }
        .na-selbar-k { font-size: 10.5px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: #64748b; }
        .na-selbar-v { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 1px; }
        .na-selbar-h { font-size: 12px; color: #64748b; margin-top: 1px; }
        .na-selbar-btn { flex-shrink: 0; height: 52px; padding: 0 22px; border: none; border-radius: 12px; background: linear-gradient(135deg, #166534, #1a6b3a); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 6px 18px rgba(22,101,52,.28); font-family: inherit; }
        .na-fullslots-wrap.has-bar { padding-bottom: calc(140px + var(--na-ck, 0px)); }
        .na-rv { display: flex; justify-content: space-between; gap: 16px; font-size: 14px; color: #334155; padding: 9px 0; }
        .na-rv + .na-rv { border-top: 1px solid #eef2f6; }
        .na-rv b { font-weight: 700; color: #0f172a; text-align: right; }
        .na-secure { text-align: center; font-size: 12px; color: #64748b; margin-top: 10px; }
        .na-resched-policy { margin: 10px 0 12px; padding: 10px 12px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; font-size: 12.5px; line-height: 1.5; }
        .na-resched-policy.over { background: #fff7ed; border-color: #fed7aa; color: #9a3412; display: flex; flex-direction: column; gap: 10px; align-items: flex-start; font-size: 13px; }
        .na-resched-policy.over .na-wa-btn { margin: 0; }

        /* ── Tablet (touch, wider than a phone) ─────────────────────────── */
        .na-tab .na-tab-cols { display: flex; gap: 20px; align-items: stretch; }
        .na-tab.port .na-tab-cols { flex-direction: column; }
        .is-tablet .na-topbar { padding: 24px 20px 4px; max-width: none; }
        .is-tablet .na-topbar-tabs { width: 400px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; padding: 5px; border-radius: 14px; }
        .is-tablet .na-topbar-tab { height: 46px; padding: 0; font-size: 14px; border-radius: 10px; }
        .is-tablet .na-foot { padding: 48px 24px 44px; }
        .is-tablet .na-shell { margin: 8px 16px 0; }
        .na-tab .na-skel-cell { height: 52px; }
        .na-tab.land .na-skel-cell { height: 44px; }
        .na-fullslots-wrap.na-tab, .na-centerwrap.na-tab { padding: 24px 32px 48px; max-width: none; }
        .na-tab .na-fullslots-card { padding: 20px 14px 18px; }
        .na-tab .na-tab-main { flex: 1; min-width: 0; }
        .na-tab .na-fullslots-scroll { overflow-x: visible; }
        .na-tab .na-fullslots-table { table-layout: fixed; }
        .na-tab .na-fullslots-table { border-spacing: 5px; }
        .na-tab .na-fullslots-table th:first-child { width: 84px; }
        .na-tab .na-fullslots-table td.na-time-col { width: 84px; font-size: 13px; padding: 0 6px; }
        .na-tab .na-slotcell { min-width: 0; height: 52px; font-size: 14px; }
        .na-tab.land .na-slotcell { height: 44px; }
        .na-tab .na-th-m { padding: 0 0 6px !important; }
        .na-tab .na-dn { width: 30px; height: 30px; border-radius: 15px; font-size: 15px; }
        .na-tab-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 14px; }
        .na-tab-legend { margin: 0; padding: 0; border: none; max-width: 300px; justify-content: flex-end; gap: 8px 16px; }
        .na-tab-selcard { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 20px 24px; background: #fff; border-radius: 22px; box-shadow: 0 20px 50px rgba(15,61,34,.12); position: sticky; bottom: 10px; z-index: 5; }
        .na-tab-selv { font-size: 21px; font-weight: 800; color: #0f172a; margin-top: 3px; }
        .na-tab-cta { flex-shrink: 0; height: 56px; padding: 0 40px; border: none; border-radius: 14px; background: linear-gradient(135deg, #166534, #1a6b3a); color: #fff; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 22px rgba(22,101,52,.28); font-family: inherit; }
        .na-tab-cta:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }
        .na-tab-cta-dock { position: sticky; bottom: 0; z-index: 2; margin: 0 -22px -22px; padding: 12px 22px 22px; background: linear-gradient(to bottom, rgba(255,255,255,0), #fff 22%); border-radius: 0 0 22px 22px; }
        .na-tab-panel { flex-shrink: 0; width: 330px; box-sizing: border-box; padding: 22px; background: #fff; border-radius: 22px; box-shadow: 0 20px 50px rgba(15,61,34,.12); display: flex; flex-direction: column; gap: 14px; }
        .na-tab-panel-title { font-size: 20px; font-weight: 800; color: #0f172a; }
        .na-tab-slotbox { padding: 16px 18px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; }
        .na-tab-slotbox-k { font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #166534; }
        .na-tab-slotbox-v { font-size: 18px; font-weight: 800; color: #14532d; margin-top: 4px; }
        .na-tab-slotbox-t { font-size: 15px; font-weight: 600; color: #166534; margin-top: 2px; }
        .na-tab-pills { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; }
        .na-tab-pill { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; height: 56px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: #fff; color: #334155; font-size: 14px; font-weight: 700; padding: 0; cursor: pointer; font-family: inherit; }
        .na-tab-pill.short { height: 48px; font-size: 13px; }
        .na-tab-pill small { font-size: 12px; font-weight: 600; color: #64748b; }
        .na-tab-pill.on { background: #f0fdf4; border-color: #1a6b3a; color: #15803d; }
        .na-tab-pill.on small { color: #15803d; }
        .na-tab-price { padding: 4px 16px 12px; border: 1px solid #e2e8f0; border-radius: 14px; }
        .na-centerwrap.na-tab .na-card { max-width: 700px; margin: 0 auto; padding: 32px 36px 36px; }
        .na-tab .na-card-inner { max-width: none; }
        .na-tab input.na-inp { height: 52px; font-size: 16px; border-radius: 12px; }
        .na-tab textarea.na-inp { font-size: 16px; border-radius: 12px; }
        .na-tab .na-submit, .na-tab .na-btn-back { height: 56px; padding-top: 0; padding-bottom: 0; border-radius: 14px; font-size: 16px; }
        .na-tab .na-pill { padding: 14px 8px; font-size: 14px; }
        .na-tab .na-step-circle { width: 30px; height: 30px; }

        @media (max-width: 640px) {
          .na-shell { margin: 8px 8px 0; border-radius: 16px; }
          .na-foot { margin-top: 32px; padding: 32px 16px 32px; }
          .na-foot-in { grid-template-columns: 1fr; }
          .na-foot-in > :not(.na-foot-help) { grid-column: 1; }
          .na-foot-help { grid-column: 1; grid-row: auto; order: 5; width: auto; padding: 18px 0 0; margin-top: 20px; border-left: 0; border-top: 1px solid #d5dcd8; }
          .na-foot-brand { order: 6; }
          .na-foot-big { letter-spacing: -.8px; }
          .na-foot-tag { margin-top: 16px; font-size: 13px; }
          .na-topbar { padding: 10px 12px 4px; flex-direction: column; align-items: stretch; }
          .na-skel-cell { height: 44px; }
          .na-topbar-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; }
          .na-topbar-tab { padding: 0; height: 44px; font-size: 13px; }
          .na-centerwrap, .na-fullslots-wrap { padding: 8px 6px 20px; }
          .na-card { padding: 16px 14px 18px; }
          .na-fullslots-card { padding: 12px 4px 12px; }
          .na-fullslots-scroll { overflow-x: visible; }
          .na-fullslots-table { table-layout: fixed; }
          .na-fullslots-table { border-spacing: 4px; }
          .na-fullslots-table th:first-child { width: 50px; }
          .na-fullslots-table td.na-time-col { width: 50px; padding: 0 2px; font-size: 11px; border-radius: 10px; }
          .na-slotcell { min-width: 0; height: 44px; border-radius: 10px; }
          .na-inp { font-size: 16px; }
          input.na-inp { height: 48px; }
          .na-textarea { min-height: 76px; }
          .na-btn-row { position: sticky; bottom: var(--na-ck, 0px); z-index: 5; margin: 18px -14px -18px; padding: 12px 14px calc(14px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #e2e8f0; border-radius: 0 0 20px 20px; }
          .na-btn-back { height: 52px; padding: 0 20px; }
          .na-submit { height: 52px; padding: 0; }
          .na-fullslots-legend { gap: 8px 14px; }
        }

        /* ── motion ─────────────────────────────────────────────────── */
        @keyframes naPop { 0% { transform: scale(.9); } 55% { transform: scale(1.07); } 100% { transform: scale(1); } }
        @keyframes naSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes naFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes naRing { 0% { box-shadow: 0 0 0 0 rgba(26,107,58,.35); } 100% { box-shadow: 0 0 0 14px rgba(26,107,58,0); } }
        @keyframes naDraw { to { stroke-dashoffset: 0; } }
        @keyframes naSpin { to { transform: rotate(360deg); } }
        .na-fullslots-table td .na-slotcell { animation: naCellIn .4s ease backwards; animation-delay: calc(var(--na-i, 0) * 14ms); }
        @keyframes naCellIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        button.na-slotcell.selected { animation: naPop .32s ease; }
        .na-selbar { animation: naSlideUp .28s ease; }
        .na-selbar-v, .na-tab-selv { animation: naFadeUp .28s ease; }
        .na-tab-slotbox { animation: naRing .7s ease-out; }
        .na-tab-slotbox-v, .na-tab-slotbox-t { animation: naFadeUp .3s ease; }
        .na-submit[data-busy]::before { content: ""; display: inline-block; width: 14px; height: 14px; margin-right: 9px; vertical-align: -2px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: naSpin .7s linear infinite; }

        /* ── booking confirmation ───────────────────────────────────── */
        .na-tick { width: 84px; height: 84px; margin: 0 auto 18px; }
        .na-tick svg { width: 100%; height: 100%; display: block; }
        .na-tick-bg { fill: #dcfce7; transform-origin: 26px 26px; animation: naPop .5s ease; }
        .na-tick-c { fill: none; stroke: #16a34a; stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 152; stroke-dashoffset: 152; animation: naDraw .6s ease .1s forwards; }
        .na-tick-p { fill: none; stroke: #16a34a; stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 40; stroke-dashoffset: 40; animation: naDraw .35s ease .55s forwards; }
        .na-ticket { margin-top: 18px; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; text-align: left; overflow: hidden; box-shadow: 0 8px 24px rgba(15,61,34,.08); }
        .na-ticket-top { display: flex; align-items: center; gap: 16px; padding: 18px; }
        .na-ticket-date { flex: 0 0 auto; width: 68px; border-radius: 14px; background: #1a6b3a; color: #fff; text-align: center; padding: 8px 0 9px; line-height: 1.1; }
        .na-ticket-date span { display: block; font-size: 11px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; opacity: .85; }
        .na-ticket-date b { display: block; font-size: 26px; font-weight: 800; margin: 2px 0; }
        .na-ticket-time { font-size: 17px; font-weight: 800; color: #0f172a; }
        .na-ticket-sub { font-size: 13px; color: #64748b; margin-top: 3px; }
        .na-ticket-tear { border-top: 2px dashed #e2e8f0; margin: 0 16px; }
        .na-ticket-rows { padding: 10px 18px 14px; }
        .na-ticket-row { display: flex; justify-content: space-between; gap: 14px; font-size: 13px; color: #475569; padding: 5px 0; }
        .na-ticket-row b { color: #0f172a; font-weight: 700; text-align: right; overflow-wrap: anywhere; }
        .na-succ-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin-top: 14px; }
        .na-succ-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 46px; padding: 0 12px; border-radius: 12px; border: 1.5px solid #bbf7d0; background: #f0fdf4; color: #166534; font-size: 13px; font-weight: 800; text-decoration: none; cursor: pointer; font-family: inherit; transition: all .15s; }
        .na-succ-btn:hover { border-color: #1a6b3a; background: #e3f8ea; }
        .na-succ-hint { font-size: 12.5px; color: #64748b; margin: 14px 0 0 !important; }
        @media (prefers-reduced-motion: reduce) {
          .na-fullslots-table td .na-slotcell, button.na-slotcell.selected, button.na-slotcell.recommended, .na-selbar, .na-selbar-v, .na-tab-selv, .na-tab-slotbox, .na-tab-slotbox-v, .na-tab-slotbox-t, .na-tick-bg, .na-step-dot.done .na-step-circle svg { animation: none; }
          .na-tick-c, .na-tick-p { animation: none; stroke-dashoffset: 0; }
          .na-step-line::after { transition: none; }
        }

        /* ════ app look on tablet + desktop: "Available" tiles, red booked ════ */
        @media (min-width: 641px) {
          .na-page .na-shell .na-fullslots-table button.na-slotcell.open .na-wm { display: none; }
          .na-page .na-shell .na-fullslots-table button.na-slotcell.open::after { content: "Available"; font-size: 13px; font-weight: 700; letter-spacing: .1px; }
          .na-page .na-shell .na-fullslots-table button.na-slotcell.open.selected::after { content: "✓ Selected"; }
          .na-page .na-shell .na-fullslots-table .na-slotcell { border-radius: 12px; }
          .na-page .na-shell .na-fullslots-table .na-taken-stamp { color: #dc2626; font-weight: 600; }
        }

        /* ════ desktop (mouse): green app bar + date cards ════ */
        @media (min-width: 641px) {
          .na-page:not(.is-tablet) .na-topbar { background: linear-gradient(160deg, #1f7a45, #145c32); max-width: none; margin: 0; padding: 14px 22px 14px !important; }
          .na-page:not(.is-tablet) .na-topbar .na-centre-name { color: #fff; }
          .na-page:not(.is-tablet) .na-topbar .na-centre-addr, .na-page:not(.is-tablet) .na-topbar .na-centre-addr svg { color: rgba(255,255,255,.78); }
          .na-page:not(.is-tablet) .na-topbar .na-centre-mark { background: rgba(255,255,255,.95); border-color: transparent; }
          .na-page:not(.is-tablet) .na-topbar .na-back, .na-page:not(.is-tablet) .na-topbar .na-centre-btn { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.24); color: #fff; }
          .na-page:not(.is-tablet) .na-topbar .na-back:hover, .na-page:not(.is-tablet) .na-topbar .na-centre-btn:hover { background: rgba(255,255,255,.24); }
          .na-page:not(.is-tablet) .na-topbar .na-topbar-tabs { background: rgba(0,0,0,.16) !important; box-shadow: none; }
          .na-page:not(.is-tablet) .na-topbar .na-topbar-tab { color: rgba(255,255,255,.85); }
          .na-page:not(.is-tablet) .na-topbar .na-topbar-tab.active { background: #fff; color: #145c32; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
          .na-page:not(.is-tablet) .na-topbar .na-chip { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.26); color: #fff; }
          .na-page:not(.is-tablet) .na-topbar .na-chip.on { background: #fff; border-color: #fff; color: #145c32; }
          .na-page:not(.is-tablet) .na-shell.fit-slots .na-offerbar { margin-top: 12px; }
          .na-page:not(.is-tablet) .na-shell .na-fullslots-table thead th:not(:first-child) { background: #fff; border: 1px solid #e6ece8; border-radius: 12px; padding: 6px 4px !important; color: #334155; }
          .na-page:not(.is-tablet) .na-shell .na-fullslots-table thead th.na-th-today { background: #1a6b3a !important; border-color: #1a6b3a; color: #fff; box-shadow: 0 6px 14px -6px rgba(26,107,58,.5); }
          .na-page:not(.is-tablet) .na-shell .na-fullslots-table td.na-time-col { background: #f4f7f5; }
        }

        /* ════ iPad: iOS app look — SF font, grouped grey background, translucent nav bar, iOS segmented control ════ */
        .na-page.is-tablet, .na-page.is-tablet button, .na-page.is-tablet input, .na-page.is-tablet textarea, .na-page.is-tablet select {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .na-page.is-tablet { background: #f2f2f7; }
        .na-page.is-tablet .na-shell, .na-page.na-fit.is-tablet .na-shell.fit-slots { background: #f2f2f7; box-shadow: none; }
        .na-page.is-tablet .na-topbar { background: linear-gradient(160deg, #1f7a45, #145c32); border-bottom: none; max-width: none; margin: 0; padding: 12px 20px 12px !important; position: sticky; top: 0; z-index: 20; }
        .na-page.is-tablet .na-centre-mark { border: none; box-shadow: none; border-radius: 12px; background: #fff; }
        .na-page.is-tablet .na-centre-name { font-size: 17px; font-weight: 600; color: #fff; letter-spacing: -.2px; }
        .na-page.is-tablet .na-centre-addr, .na-page.is-tablet .na-centre-addr svg { font-size: 13px; color: rgba(255,255,255,.78); }
        .na-page.is-tablet .na-back { border: none; background: rgba(255,255,255,.14); color: #fff; width: 34px; }
        .na-page.is-tablet .na-centre-btn { border: none; background: rgba(255,255,255,.16); color: #fff; border-radius: 999px; padding: 7px 14px; font-weight: 600; font-size: 13px; }
        .na-page.is-tablet .na-topbar-tabs { background: rgba(0,0,0,.18) !important; box-shadow: none; padding: 2px; border-radius: 9px; gap: 0; }
        .na-page.is-tablet .na-topbar .na-topbar-tab { height: 34px; border-radius: 7px; font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,.9); letter-spacing: -.1px; }
        .na-page.is-tablet .na-topbar .na-topbar-tab.active { background: #fff; color: #145c32; box-shadow: 0 3px 8px rgba(0,0,0,.15), 0 3px 1px rgba(0,0,0,.04); }
        .na-page.is-tablet .na-chip { background: rgba(118,118,128,.12); border: none; color: #000; font-weight: 600; }
        .na-page.is-tablet .na-chip.on { background: #1a6b3a; color: #fff; }
        .na-page.is-tablet .na-topbar .na-chip { background: rgba(255,255,255,.14); color: #fff; }
        .na-page.is-tablet .na-topbar .na-chip.on { background: #fff; color: #145c32; }
        .na-page.is-tablet .na-offerbar { border-radius: 14px; border: none; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
        .na-page.is-tablet .na-tab-main { background: #fff; border-radius: 18px; padding: 12px 12px 10px !important; }
        .na-page.is-tablet .na-tab-panel, .na-page.is-tablet .na-tab-selcard { border-radius: 18px; box-shadow: none; }
        .na-page.is-tablet .na-fullslots-title { font-size: 22px !important; font-weight: 700; color: #000; letter-spacing: -.3px; }
        .na-page.is-tablet .na-fullslots-sub { color: #8e8e93; }
        .na-page.is-tablet .na-fullslots-table th { color: #8e8e93; font-weight: 600; }
        .na-page.is-tablet .na-fullslots-table th.na-th-today { background: transparent !important; }
        .na-page.is-tablet .na-dn { color: #000; font-weight: 600; }
        .na-page.is-tablet .na-dn.today { background: #1a6b3a; color: #fff; }
        .na-page.is-tablet .na-fullslots-table td.na-time-col { background: transparent; color: #8e8e93; font-weight: 600; }
        .na-page.is-tablet .na-fullslots-table .na-slotcell { border: none; border-radius: 10px; }
        .na-page.is-tablet .na-fullslots-table button.na-slotcell.open { background: rgba(52,199,89,.13); color: #1b7a3a; }
        .na-page.is-tablet .na-fullslots-table button.na-slotcell.open.selected { background: #1a6b3a; color: #fff; }
        .na-page.is-tablet .na-fullslots-table button.na-slotcell.lastminute { background: rgba(255,149,0,.14); color: #b25000; }
        .na-page.is-tablet .na-fullslots-table .na-slotcell.taken { background: rgba(255,59,48,.1); }
        .na-page.is-tablet .na-fullslots-table .na-taken-stamp { color: #d70015; }
        .na-page.is-tablet .na-fullslots-table .na-slotcell.past { background: rgba(118,118,128,.07); }
        .na-page.is-tablet .na-fullslots-table .na-past-label { color: #aeaeb2; }
        .na-page.is-tablet .na-fullslots-table .na-slotcell.closed { background: rgba(118,118,128,.05); }
        .na-page.is-tablet .na-offer-tag { background: #ff3b30; }
        .na-page.is-tablet .na-fullslots-legend { border-top-color: rgba(60,60,67,.12); }
        .na-page.is-tablet .na-shell .na-card { background: #fff; border-radius: 18px; padding: 24px 24px 26px; }
        .na-page.is-tablet .na-shell .na-card input, .na-page.is-tablet .na-shell .na-card textarea { background: #f2f2f7; border-color: transparent; }

        /* returning client greeting */
        .na-wb { display: flex; align-items: center; gap: 10px; margin: 8px 20px 4px; padding: 9px 10px 9px 14px; border-radius: 14px; background: #eef7f1; border: 1px solid #cfe9d8; }
        .na-wb-hi { font-size: 18px; }
        .na-wb-txt { flex: 1; min-width: 0; font-size: 13px; color: #1f3d2c; line-height: 1.4; }
        .na-wb-txt b { color: #14532d; }
        .na-wb-btn { flex-shrink: 0; border: none; background: #1a6b3a; color: #fff; font-family: inherit; font-weight: 700; font-size: 12.5px; padding: 8px 12px; border-radius: 10px; cursor: pointer; white-space: nowrap; }
        .na-wb-x { flex-shrink: 0; border: none; background: none; color: #64748b; font-family: inherit; font-size: 12px; text-decoration: underline; cursor: pointer; padding: 4px; }
        @media (max-width: 640px) { .na-wb { margin: 8px 10px 2px; flex-wrap: wrap; } .na-wb-hi { display: none; } .na-wb-txt { flex-basis: 100%; font-size: 12.5px; } .na-wb-btn { flex: 1; } }
        .na-page.is-tablet .na-wb { background: #fff; border: none; }

        /* tap feedback: a quick press-in on every tappable slot, the pop + tick on the chosen one */
        button.na-slotcell { -webkit-tap-highlight-color: transparent; }
        button.na-slotcell:active { transform: scale(.94) !important; transition: transform .08s ease; }
        @keyframes naTick { 0% { opacity: 0; transform: translateY(3px) scale(.8); } 100% { opacity: 1; transform: none; } }
        .na-page .na-shell .na-fullslots-table button.na-slotcell.selected::after { display: inline-block; animation: naTick .28s ease; }

        /* app-style loading skeleton — rounded day cards and tiles, same shape as the real table */
        .na-skel-head { width: 100%; max-width: 92px; height: 42px; border-radius: 12px; }
        .na-skel-cell { border-radius: 12px; }
        .na-skel-time { width: 42px; height: 11px; border-radius: 6px; }
        @media (prefers-reduced-motion: reduce) { button.na-slotcell:active { transform: none !important; } .na-page .na-shell .na-fullslots-table button.na-slotcell.selected::after { animation: none; } }
      ` }} />

      {showWelcome && (
        <div className="na-welcome-overlay" role="dialog" aria-modal="true" aria-label="What brings you here today?">
          <div className="na-welcome-modal">
            <button type="button" className="na-welcome-close" aria-label="Close" onClick={() => dismissWelcome(null)}><CloseRounded style={{ fontSize: 18 }} /></button>
            <div className="na-welcome-title">What brings you here today?</div>
            <p className="na-welcome-sub">Pick one and we'll take you straight there.</p>
            <div className="na-welcome-options">
              <button type="button" className="na-welcome-opt" onClick={() => dismissWelcome("new")}>
                <span className="na-welcome-opt-icon"><PersonAddAlt1Rounded /></span>
                <span className="na-welcome-opt-text">
                  <span className="na-welcome-opt-label">New here</span>
                  <span className="na-welcome-opt-sub">First time booking a session</span>
                </span>
              </button>
              <button type="button" className="na-welcome-opt" onClick={() => dismissWelcome("followup")}>
                <span className="na-welcome-opt-icon"><EventRepeatRounded /></span>
                <span className="na-welcome-opt-text">
                  <span className="na-welcome-opt-label">Follow-up</span>
                  <span className="na-welcome-opt-sub">Already a client, booking my next session</span>
                </span>
              </button>
              <button type="button" className="na-welcome-opt" onClick={() => dismissWelcome("reschedule")}>
                <span className="na-welcome-opt-icon"><UpdateRounded /></span>
                <span className="na-welcome-opt-text">
                  <span className="na-welcome-opt-label">Reschedule</span>
                  <span className="na-welcome-opt-sub">Change the time of an existing appointment</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {teamGate && (
        <TeamModal
          list={therapists}
          canChoose={canChooseTherapist}
          slotLabel={(() => {
            const d = new Date(`${teamGate.date}T00:00:00`);
            const day = isNaN(d) ? "" : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
            return [day, shortTime(teamGate.slot)].filter(Boolean).join(" · ");
          })()}
          onDone={finishTeam}
          onClose={() => setTeamGate(null)}
        />
      )}

      {offerOpen && (
        <OfferClaimModal
          offer={offerOpen}
          prefill={{ name: form.name, phone: form.phone, email: form.email }}
          onClose={() => setOfferOpen(null)}
          onClaimed={({ code, name, phone, email }) => {
            setClaimedCode(code); setCouponInput(code); setCouponOpen(true);
            try { localStorage.setItem(OFFER_CODE_KEY, code); } catch { /* ignore */ }
            setForm((f) => ({ ...f, name: f.name || name, phone: f.phone || phone, email: f.email || email }));
          }}
        />
      )}

      {exitAsk && (
        <ExitFeedbackModal
          trigger={exitAsk}
          stage={stageNow}
          defaultPhone={/^[0-9]{10}$/.test(form.phone || "") ? form.phone : (loadKnownPhone() || "")}
          onSubmit={submitExit}
          onStay={stayOnPage}
          onSkip={skipExit}
        />
      )}

      <div className={`na-page ${tablet ? "is-tablet" : ""} na-fit ${showWelcome || exitAsk || teamGate ? "na-blurred" : ""}`} style={{ "--na-ck": `${cookieH}px` }}>
        <h1 className="na-sr">Psychologist in Noida — book in-person, online or home visit at our Sector 51 centre</h1>

        <div className={`na-shell ${fitSlots ? "fit-slots" : ""}`}>
        {tabsEl}
        {returning && phase === "slots" && bookingType === "new" && (
          <div className="na-wb">
            <span className="na-wb-hi" aria-hidden="true">👋</span>
            <span className="na-wb-txt">
              <b>Welcome back{returning.name ? `, ${returning.name.split(" ")[0]}` : ""}!</b>
              {myUpcoming?.date ? <> Your next session: {(() => { const l = dateLabel(myUpcoming.date); return `${l.weekday} ${l.day} ${l.month}`; })()} · {String(myUpcoming.slot || "").split(" - ")[0]}</> : <> Booking your next session?</>}
            </span>
            <button type="button" className="na-wb-btn" onClick={() => { track("noida_returning_followup", {}); switchTab("followup"); }}>Book follow-up</button>
            <button type="button" className="na-wb-x" onClick={notMe}>Not you?</button>
          </div>
        )}
        {offers.length > 0 && bookingType !== "reschedule" && (
          <div className="na-offerbar">
            <span className="na-offerbar-gift" aria-hidden="true">🎁</span>
            <span className="na-offerbar-txt"><b>{offers[0].title}</b>{offers[0].window ? <> · {offers[0].window}</> : null}{slotOffer && offers[0] === slotOffer ? <span className="na-offerbar-note"> · slots marked <i className="na-offer-tag inline">%</i></span> : null}</span>
            <button type="button" className="na-offerbar-btn" onClick={() => { setOfferOpen(offers[0]); track("noida_offer_open", { offer: offers[0].title }); }}>{claimedCode ? "Show my code" : "Get code"}</button>
          </div>
        )}
        {bookingType === "reschedule" ? (
          <div className={`na-centerwrap ${tablet ? "na-tab" : ""}`}>
            <div className="na-card">
              <div className="na-card-inner">
                {rescheduleDone ? (
                  <BookingSuccess
                    title="All set!"
                    text="Your appointment has been moved to the new time. We've sent a confirmation to your email if you gave us one."
                    dateStr={rescheduleDate}
                    dateLbl={rescheduleDateLabel}
                    slot={rescheduleSlot}
                    rows={[["Time", "New appointment time"]]}
                    format={null}
                    showAddress={false}
                  />
                ) : (
                  <>
                    <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: rescheduleStatus ? 10 : 14 }}>
                      <div>
                        <label className="na-lbl">Phone Number *</label>
                        <input className="na-inp" value={reschedulePhone} onChange={e => handleReschedulePhoneChange(e.target.value)} placeholder="10-digit mobile you booked with" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} />
                      </div>
                    </div>

                    {rescheduleStatus === "checking" && <div className="na-lookup-box na-lookup-checking">Checking…</div>}
                    {rescheduleStatus === "not-found" && (
                      <div className="na-lookup-box na-lookup-notfound">No upcoming appointment found for this number — check it, or WhatsApp us for help.</div>
                    )}
                    {rescheduleStatus === "found" && rescheduleInfo && (
                      <>
                        <div className="na-lookup-box na-lookup-found">
                          <span><Ic I={CalendarMonthRounded} /> Currently: {rescheduleInfo.date} at {rescheduleInfo.slot}</span>
                        </div>

                        {rescheduleBlocked ? (
                          <div className="na-resched-policy over">
                            <b>This session has already been rescheduled once.</b> Our policy allows one reschedule per session, so it can't be moved again online.
                            <a className="na-wa-btn" href={waLink(`Hi, I'd like to change my CYT Noida appointment on ${rescheduleInfo.date} at ${rescheduleInfo.slot}.`)} target="_blank" rel="noopener noreferrer">
                              <Ic I={WhatsAppIcon} s={18} /> WhatsApp us to change it
                            </a>
                          </div>
                        ) : (
                        <>
                        {rescheduleInfo.rescheduleLimit != null && (
                          <div className="na-resched-policy">You can reschedule this session <b>once</b> — pick your new time carefully. After that, changes go through WhatsApp.</div>
                        )}
                        <SlotsTable
                          matrix={{ ...rescheduleMatrix, onPick: handleReschedulePickSlot }}
                          trackAs="reschedule"
                          loading={rescheduleMatrixLoading}
                          isMobile={isMobile}
                          isTablet={tablet}
                          selected={rescheduleDate && rescheduleSlot ? { date: rescheduleDate, slot: rescheduleSlot } : null}
                          header={<div className="na-section-label" style={{ marginBottom: isMobile ? 0 : 12 }}>Pick a new date &amp; time</div>}
                          disableLastMinute
                        />
                        {rescheduleDate && rescheduleSlot && (
                          <div className="na-lookup-box na-lookup-found" style={{ marginTop: 14, marginBottom: 0 }}>
                            <span>New time: {rescheduleDateLabel.weekday}, {rescheduleDateLabel.day} {rescheduleDateLabel.month} · {rescheduleSlot}</span>
                          </div>
                        )}
                        </>
                        )}
                      </>
                    )}

                    {rescheduleError && <div className="na-error" style={{ marginTop: 12 }}><Ic I={WarningAmberRounded} /> {rescheduleError}</div>}

                    {rescheduleStatus === "found" && !rescheduleBlocked && (
                      <button type="button" className="na-submit" style={{ marginTop: 10 }} disabled={rescheduleSubmitting || !rescheduleSlot} onClick={submitReschedule}>
                        {rescheduleSubmitting ? "Rescheduling…" : "Confirm New Time"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : phase === "identify" ? (
          <div className={`na-centerwrap ${tablet ? "na-tab" : ""}`}>
            <div className="na-card">
              <div className="na-card-inner">
                <div className="na-section-label" style={{ marginBottom: 16 }}>Let's find you first</div>
                <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: lookupStatus ? 10 : 14 }}>
                  <div>
                    <label className="na-lbl">Phone Number *</label>
                    <input className="na-inp" value={form.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="10-digit mobile you booked with before" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} />{phoneHint}
                  </div>
                </div>
                {lookupStatus === "checking" && <div className="na-lookup-box na-lookup-checking">Checking…</div>}
                {lookupStatus === "found" && !manualOverride && (
                  <div className="na-lookup-box na-lookup-found">
                    <span>
                      <Ic I={WavingHandRounded} /> Welcome back, {foundName}!
                      {usingCredit && ` You have ${credit.sessionsRemaining} session(s) left${credit.packageName ? ` on ${credit.packageName}` : ""}${lastSessionTxt(credit)} — no payment needed.`}
                    </span>
                    <button type="button" className="na-lookup-link" onClick={() => setManualOverride(true)}>Not you?</button>
                  </div>
                )}
                {(lookupStatus === "not-found" || (lookupStatus === "found" && manualOverride)) && (
                  <div className="na-lookup-box na-lookup-notfound">
                    {lookupStatus === "not-found" ? "New here — please add your details below." : "No problem, please add your details below."}
                  </div>
                )}
                {needsFullDetails && form.phone.length === 10 && (
                  <div className="na-row">
                    <div>
                      <label className="na-lbl">Full Name *</label>
                      <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" autoComplete="name" autoCapitalize="words" enterKeyHint="next" />
                    </div>
                    <div>
                      <label className="na-lbl">Age</label>
                      <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                    </div>
                  </div>
                )}
                {form.phone.length === 10 && (
                  <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#64748b" }}>(optional, for confirmation)</span></label>
                      <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" enterKeyHint="next" />{emailHint}
                    </div>
                  </div>
                )}
                {form.phone.length === 10 && (
                  <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                    <div>
                      <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#64748b" }}>(optional)</span></label>
                      <textarea className="na-inp na-textarea" rows={2} value={form.concern} onChange={e => set("concern", e.target.value)} placeholder="Briefly describe what you're going through…" />
                    </div>
                  </div>
                )}

                {error && <div className="na-error"><Ic I={WarningAmberRounded} /> {error}</div>}
                <div className="na-btn-row"><button type="button" className="na-submit" onClick={goToIdentifySlots}>Continue →</button></div>
              </div>
            </div>
          </div>
        ) : phase === "slots" ? (
          <div className={`na-fullslots-wrap ${tablet ? `na-tab ${landscape ? "land" : "port"}` : ""}`}>
            <div className="na-tab-cols">
            <div className="na-fullslots-card na-tab-main">
              {slotNotice && (
                <div className="na-error" role="alert" style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start", justifyContent: "space-between" }}>
                  <span><Ic I={WarningAmberRounded} /> {slotNotice}</span>
                  <button type="button" aria-label="Dismiss" onClick={() => setSlotNotice("")} style={{ background: "none", border: "none", color: "inherit", fontSize: 18, lineHeight: 1, cursor: "pointer", padding: "0 4px", fontFamily: "inherit" }}><Ic I={CloseRounded} s={18} /></button>
                </div>
              )}
              {slotNotice && lostSlot && (() => {
                const target = slotStartInstant(lostSlot.date, lostSlot.slot).getTime();
                const alts = Object.keys(slotsMatrix.grid || {})
                  .filter(k => slotsMatrix.grid[k] === "open" && k !== `${lostSlot.date}|${lostSlot.slot}`)
                  .map(k => { const [d, t] = k.split("|"); return { d, t, diff: Math.abs(slotStartInstant(d, t).getTime() - target) }; })
                  .sort((a, b) => a.diff - b.diff)
                  .slice(0, 3);
                if (!alts.length) return null;
                return (
                  <div className="na-alts" role="group" aria-label="Closest open slots">
                    <span className="na-alts-k">Closest open slots:</span>
                    {alts.map(a => {
                      const l = dateLabel(a.d);
                      return (
                        <button key={a.d + a.t} type="button" className="na-alt" onClick={() => {
                          track("noida_alt_slot_click", { booking_type: bookingType, slot_date: a.d, slot_time: a.t });
                          setSlotNotice("");
                          setPendingPick({ date: a.d, slot: a.t, isLM: false });
                        }}>
                          {l.weekday} {l.day} {l.month} · {shortTime(a.t)}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
              <SlotsTable
                matrix={{ ...slotsMatrix, mine: myUpcoming, onPick: usePendingPick ? onOpenSlotPick : handlePickSlot }}
                loading={slotsMatrixLoading}
                isMobile={isMobile}
                isTablet={tablet}
                trackAs={bookingType}
                fit
                chipsHost={isMobile ? null : chipsHost}
                offerAt={slotOffer ? (d, t) => offerMatchesSlot(slotOffer, d, t) : null}
                selected={usePendingPick ? pendingPick : (selectedDate && selectedSlot ? { date: selectedDate, slot: selectedSlot } : null)}
                header={isMobile ? (
                  <div className="na-fullslots-title">Pick a slot</div>
                ) : (q) => (
                  <div className="na-hd">
                    <div className="na-fullslots-title" style={tablet ? { fontSize: 20 } : undefined}>{tablet ? "Pick an open slot" : "Pick an open slot to start booking"}</div>
                    <div className="na-fullslots-sub">{bookingType === "followup" ? "Follow-up" : "New client"}{tablet ? ` · next ${MATRIX_DAYS} open days · times in IST` : ` availability — next ${MATRIX_DAYS} open days`}</div>
                    {q.chips && <div className="na-hd-r">{q.chips}</div>}
                  </div>
                )}
              />

              {(
                <div className="na-fullslots-legend">
                  <span><i className="na-sw na-sw-open" /> Available{isMobile || tablet ? "" : " — tap to book"}</span>
                  <span><i className="na-sw na-sw-lm" /> Starting soon{isMobile || tablet ? "" : " — needs a quick OK from us"}</span>
                  <span><i className="na-sw na-sw-taken" /> Booked</span>
                  {myUpcoming && <span><i className="na-sw na-sw-mine" /> Your booking</span>}
                  <span><i className="na-sw na-sw-past" /> Passed</span>
                  <span><i className="na-sw-closed" /> Not open</span>
                </div>
              )}

              <div className="na-perks">
                {(() => {
                  const prices = [pricing?.individual_inperson, pricing?.individual_online, pricing?.individual_homevisit].map(Number).filter(n => n > 0);
                  if (!prices.length || usingCredit) return null;
                  return <span className="na-perk-price"><Ic I={CurrencyRupeeRounded} s={15} /> From ₹{Math.min(...prices)} per session{platformFee ? ` + ₹${platformFee} platform fee` : ""}</span>;
                })()}
                <span><Ic I={ScheduleRounded} s={15} /> 50–60 min session</span>
                <span><Ic I={PlaceRounded} s={15} /> Sector 51, Noida</span>
                <span><Ic I={LockRounded} s={15} /> Secure online payment</span>
                <span><Ic I={CalendarMonthRounded} s={15} /> Easy rescheduling</span>
                <a className="na-help-link" href={waLink("Hi, I need help choosing a slot at CYT Noida.")} target="_blank" rel="noopener noreferrer" onClick={() => track("noida_whatsapp_help_click", { booking_type: bookingType })}>
                <Ic I={WhatsAppIcon} s={16} /> Not sure which slot? Chat with us on WhatsApp
                </a>
              </div>
            </div>

            {tablet && (() => {
              const lbl = pendingPick ? dateLabel(pendingPick.date) : null;
              const go = () => pendingPick && handlePickSlot(pendingPick.date, pendingPick.slot, pendingPick.isLM);
              const cta = pendingPick?.isLM ? "Send request" : "Continue →";
              if (!landscape) {
                if (!pendingPick) return null; // nothing to continue with yet — the card appears once a slot is picked
                return (
                  <div className="na-tab-selcard">
                    <div>
                      <div className="na-selbar-k">Selected</div>
                      <div className="na-tab-selv" key={pendingPick ? pendingPick.date + pendingPick.slot : "none"}>{lbl ? `${lbl.weekday}, ${lbl.day} ${lbl.month} · ${pendingPick.slot}` : "Tap an open slot to continue"}</div>
                      <div className="na-selbar-h">{pendingPick?.isLM ? "Starts within 15 min — the center confirms first" : pendingPick ? "Tap Continue — next: your details & payment" : "50–60 min session · Sector 51, Noida"}</div>
                    </div>
                    <button type="button" className="na-tab-cta" disabled={!pendingPick} onClick={go}>{cta}</button>
                  </div>
                );
              }
              return (
                <div className="na-tab-panel">
                  <div className="na-tab-panel-title">Your booking</div>
                  <div className="na-tab-slotbox" key={pendingPick ? pendingPick.date + pendingPick.slot : "none"}>
                    <div className="na-tab-slotbox-k">Selected slot</div>
                    {lbl ? (
                      <>
                        <div className="na-tab-slotbox-v">{lbl.weekday}, {lbl.day} {lbl.month}</div>
                        <div className="na-tab-slotbox-t">{pendingPick.slot}</div>
                      </>
                    ) : (
                      <div className="na-tab-slotbox-t" style={{ marginTop: 6 }}>Tap an open slot in the table</div>
                    )}
                  </div>

                  {usingCredit ? (
                    <div className="na-lookup-box na-lookup-found" style={{ marginBottom: 0 }}>
                      <span><Ic I={ConfirmationNumberRounded} /> Uses 1 of your {credit.sessionsRemaining} remaining session(s) — no payment.</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="na-section-label" style={{ marginBottom: 8 }}>Session · 50–60 min</div>
                        <div className="na-tab-pills">
                          <button type="button" className={`na-tab-pill ${sessionMode === "individual" ? "on" : ""}`} onClick={() => setSessionMode("individual")}>Individual<small>₹{pricing?.[priceFieldFor("individual", format)] ?? "—"}</small></button>
                          <button type="button" className={`na-tab-pill ${sessionMode === "couple" ? "on" : ""}`} onClick={() => setSessionMode("couple")}>Couple<small>₹{pricing?.[priceFieldFor("couple", format)] ?? "—"}</small></button>
                          {hasPackages && (
                            <button type="button" className={`na-tab-pill ${sessionMode === "package" ? "on" : ""}`} onClick={() => setSessionMode("package")}>Package<small>{packageCount} available</small></button>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="na-section-label" style={{ marginBottom: 8 }}>Mode</div>
                        <div className="na-tab-pills">
                          <button type="button" className={`na-tab-pill short ${format === "in-person" ? "on" : ""}`} onClick={() => setFormat("in-person")}>In-person</button>
                          <button type="button" className={`na-tab-pill short ${format === "online" ? "on" : ""}`} onClick={() => setFormat("online")}>Online</button>
                          <button type="button" className={`na-tab-pill short ${format === "home-visit" ? "on" : ""}`} onClick={() => setFormat("home-visit")}>Home Visit</button>
                        </div>
                      </div>
                      {pickerList.length > 0 && (
                        <div style={{ maxHeight: 240, overflowY: "auto" }}>
                          <TherapistPicker list={pickerList} value={therapistId} onChange={setTherapistId} hint={lastPickHint} />
                        </div>
                      )}
                      <div className="na-tab-price">
                        {sessionMode === "package" && !selectedPackage ? (
                          <div className="na-selbar-h" style={{ padding: "10px 0 6px" }}>You'll choose a package in the next step.</div>
                        ) : (
                          <>
                            <div className="na-rv"><span>{sessionMode === "package" ? selectedPackage?.name : `${sessionMode === "couple" ? "Couple" : "Individual"} session`}</span><b>₹{baseAmount}</b></div>
                            <div className="na-rv" style={{ borderTop: "none", paddingTop: 0 }}><span>Platform fee</span><b>₹{platformFee}</b></div>
                            <div className="na-price-total" style={{ fontSize: 22, alignItems: "baseline", borderTop: "1px dashed #cbd5e1", paddingTop: 10 }}><span>Total</span><span>₹{totalAmount}</span></div>
                          </>
                        )}
                        {format === "home-visit" && <div className="na-selbar-h" style={{ marginTop: 8 }}>Home visit charges may increase with distance.</div>}
                      </div>
                    </>
                  )}

                  <div style={{ flexGrow: 1 }} />
                  {/* Sticks to the bottom of the screen: the panel is as tall as the table, so a plain bottom button sat below the fold. */}
                  {pendingPick && (
                    <div className="na-tab-cta-dock">
                      <div className="na-selbar-h" style={{ textAlign: "center", margin: "0 0 8px" }}>
                        {pendingPick.isLM ? "Starts within 15 min — the center confirms first" : "Tap Continue — next: your details & payment"}
                      </div>
                      <button type="button" className="na-tab-cta" style={{ width: "100%" }} onClick={go}>{cta}</button>
                    </div>
                  )}
                </div>
              );
            })()}
            </div>
            {!tablet && pendingPick && (() => {
              const lbl = pendingPick ? dateLabel(pendingPick.date) : null;
              return (
                <div className="na-selbar inflow" role="region" aria-label="Selected slot">
                  <div className="na-selbar-info">
                    <div className="na-selbar-k">Selected</div>
                    <div className="na-selbar-v" key={pendingPick ? pendingPick.date + pendingPick.slot : "none"}>
                      {lbl ? `${lbl.weekday}, ${lbl.day} ${lbl.month} · ${shortTime(pendingPick.slot)}` : "Pick an open slot to continue"}
                    </div>
                    <div className="na-selbar-h">{pendingPick?.isLM ? "Starts within 15 min — the center confirms first" : pendingPick ? "Tap Continue — next: your details & payment" : (fromPriceText ? `${fromPriceText} · 50–60 min · Sector 51, Noida` : "50–60 min session · Sector 51, Noida")}</div>
                  </div>
                  <button type="button" className="na-selbar-btn" disabled={!pendingPick} onClick={() => pendingPick && handlePickSlot(pendingPick.date, pendingPick.slot, pendingPick.isLM)}>
                    {pendingPick?.isLM ? "Send request" : "Continue →"}
                  </button>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className={`na-centerwrap ${tablet ? "na-tab" : ""}`}>
            <div className="na-card">
              <div className="na-card-inner">
                {status === "success" ? (
                  <BookingSuccess
                    title={`You're all set, ${(effectiveName || "there").split(" ")[0]}!`}
                    text="Your appointment at CYT Noida is confirmed. We'll see you there."
                    dateStr={selectedDate}
                    dateLbl={pickedDateLabel}
                    slot={selectedSlot}
                    rows={[
                      ["Session", `${modeLabel} · ${formatLabel}`],
                      ...(selectedTherapist ? [["Therapist", selectedTherapist.name]] : []),
                      [usingCredit ? "Payment" : "Amount paid", usingCredit ? `Package session used (${credit.sessionsRemaining - 1} remaining)` : `₹${totalAmount}`],
                      ...(form.email ? [["Confirmation sent to", form.email]] : []),
                    ]}
                    format={format}
                    showAddress={format !== "online"}
                  />
                ) : (
                  <>
                    <div className="na-picked-banner">
                      <span><Ic I={CalendarMonthRounded} /> {pickedDateLabel ? `${pickedDateLabel.weekday}, ${pickedDateLabel.day} ${pickedDateLabel.month}` : selectedDate} · {selectedSlot}{selectedIsLastMinute && <> · <Ic I={BoltRounded} /> Last-minute</>}{canChooseTherapist && selectedTherapist && <> · with {selectedTherapist.name}</>}</span>
                      <button type="button" className="na-picked-change" onClick={() => { resetLastMinute(); setPhase("slots"); }}>Change</button>
                    </div>

                    <div className="na-steps">
                      {STEP_LABELS.map((label, i) => {
                        const n = i + 1;
                        const state = n < step ? "done" : n === step ? "active" : "";
                        return (
                          <React.Fragment key={label}>
                            <div className={`na-step-dot ${state}`}>
                              <div className="na-step-circle">{n < step ? <Ic I={CheckRounded} s={15} /> : n}</div>
                              <div className="na-step-label">{label}</div>
                            </div>
                            {i < STEP_LABELS.length - 1 && <div className={`na-step-line ${n < step ? "done" : ""}`} />}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {step === 1 && (
                      <>
                        {bookingType === "followup" ? (
                          <>
                            <div className="na-row" style={{ gridTemplateColumns: "1fr", marginBottom: lookupStatus ? 10 : 14 }}>
                              <div>
                                <label className="na-lbl">Phone Number *</label>
                                <input className="na-inp" value={form.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="10-digit mobile you booked with before" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} />{phoneHint}
                              </div>
                            </div>
                            {lookupStatus === "checking" && <div className="na-lookup-box na-lookup-checking">Checking…</div>}
                            {lookupStatus === "found" && !manualOverride && (
                              <div className="na-lookup-box na-lookup-found">
                                <span><Ic I={WavingHandRounded} /> Welcome back, {foundName}!{usingCredit && ` You have ${credit.sessionsRemaining} session(s) left${credit.packageName ? ` on ${credit.packageName}` : ""}${lastSessionTxt(credit)} — no payment needed.`}</span>
                                <button type="button" className="na-lookup-link" onClick={() => setManualOverride(true)}>Not you?</button>
                              </div>
                            )}
                            {(lookupStatus === "not-found" || (lookupStatus === "found" && manualOverride)) && (
                              <div className="na-lookup-box na-lookup-notfound">New here — please add your details below.</div>
                            )}
                            {needsFullDetails && form.phone.length === 10 && (
                              <div className="na-row">
                                <div>
                                  <label className="na-lbl">Full Name *</label>
                                  <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" autoComplete="name" autoCapitalize="words" enterKeyHint="next" />
                                </div>
                                <div>
                                  <label className="na-lbl">Age</label>
                                  <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                                </div>
                              </div>
                            )}
                            {form.phone.length === 10 && (
                              <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                                <div>
                                  <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#64748b" }}>(optional)</span></label>
                                  <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" enterKeyHint="next" />{emailHint}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {draftRestored && (
                              <div className="na-draft-note">
                                <span>Welcome back — we've filled in your details from earlier.</span>
                                <button type="button" className="na-linkbtn" onClick={clearDraft}>Not you? Clear</button>
                              </div>
                            )}
                            <div className="na-row">
                              <div>
                                <label className="na-lbl">Full Name *</label>
                                <input className="na-inp" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Priya Sharma" autoComplete="name" autoCapitalize="words" enterKeyHint="next" />
                              </div>
                              <div>
                                <label className="na-lbl">Age</label>
                                <input className="na-inp" value={form.age} onChange={e => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 27" inputMode="numeric" />
                              </div>
                            </div>
                            <div className="na-row">
                              <div>
                                <label className="na-lbl">Phone Number *</label>
                                <input className="na-inp" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} />{phoneHint}
                              </div>
                              <div>
                                <label className="na-lbl">Email <span style={{ fontWeight: 400, textTransform: "none", color: "#64748b" }}>(optional)</span></label>
                                <input className="na-inp" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" enterKeyHint="next" />{emailHint}
                              </div>
                            </div>
                          </>
                        )}

                        {(bookingType === "new" || form.phone.length === 10) && (
                          <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                            <div>
                              <label className="na-lbl">Major Concern <span style={{ fontWeight: 400, textTransform: "none", color: "#64748b" }}>(optional)</span></label>
                              <textarea className="na-inp na-textarea" rows={2} value={form.concern} onChange={e => set("concern", e.target.value)} placeholder="Briefly describe what you're going through…" />
                            </div>
                          </div>
                        )}

                        {error && <div className="na-error"><Ic I={WarningAmberRounded} /> {error}</div>}
                        <div className="na-btn-row"><button type="button" className="na-submit" onClick={goToStep2}>Continue →</button></div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        {usingCredit ? (
                          <div className="na-lookup-box na-lookup-found" style={{ marginBottom: 18 }}>
                            <span><Ic I={ConfirmationNumberRounded} /> Using 1 of your {credit.sessionsRemaining} remaining session(s){credit.packageName ? ` on ${credit.packageName}` : ""} — no payment for this booking.</span>
                          </div>
                        ) : (
                          <>
                            <div className="na-section-label">Choose Format (50–60 min session)</div>
                            <div className="na-pill-row">
                              <div className={`na-pill ${sessionMode === "individual" ? "active" : ""}`} onClick={() => setSessionMode("individual")}>
                                Individual
                                <span className="na-pill-price">₹{pricing?.[priceFieldFor("individual", format)] ?? "—"}</span>
                              </div>
                              <div className={`na-pill ${sessionMode === "couple" ? "active" : ""}`} onClick={() => setSessionMode("couple")}>
                                Couple
                                <span className="na-pill-price">₹{pricing?.[priceFieldFor("couple", format)] ?? "—"}</span>
                              </div>
                              {hasPackages && (
                                <div className={`na-pill ${sessionMode === "package" ? "active" : ""}`} onClick={() => setSessionMode("package")}>
                                  Package
                                  <span className="na-pill-price">{packageCount} available</span>
                                </div>
                              )}
                            </div>

                            {sessionMode === "package" && (
                              <div className="na-pkg-card-row">
                                {packageOptions.map(pkg => (
                                  <div
                                    key={pkg._id}
                                    className={`na-pkg-card ${selectedPackageId === pkg._id ? "active" : ""}`}
                                    onClick={() => setSelectedPackageId(pkg._id)}
                                  >
                                    <div>
                                      <div className="na-pkg-card-name">{pkg.name}</div>
                                      <div className="na-pkg-card-meta">{pkg.sessionsCount} sessions</div>
                                    </div>
                                    <div className="na-pkg-card-price">₹{pkg.price}</div>
                                  </div>
                                ))}
                                {cp && (
                                  <div className={`na-pkg-card na-pkg-custom ${isCustomPackage ? "active" : ""}`} onClick={() => setSelectedPackageId("custom")}>
                                    <div>
                                      <div className="na-pkg-card-name">Custom package</div>
                                      <div className="na-pkg-card-meta">Choose your own number of sessions · ₹{cp.perSessionPrice} each</div>
                                    </div>
                                    <div className="na-stepper" onClick={e => e.stopPropagation()}>
                                      <button type="button" aria-label="Fewer sessions" disabled={customN <= cp.minSessions} onClick={() => { setSelectedPackageId("custom"); setCustomSessions(customN - 1); }}>−</button>
                                      <span aria-live="polite">{customN}</span>
                                      <button type="button" aria-label="More sessions" disabled={customN >= cp.maxSessions} onClick={() => { setSelectedPackageId("custom"); setCustomSessions(customN + 1); }}>+</button>
                                    </div>
                                    <div className="na-pkg-card-price">₹{customN * cp.perSessionPrice}</div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        <div className="na-section-label">Mode</div>
                        <div className="na-pill-row">
                          <div className={`na-pill ${format === "in-person" ? "active" : ""}`} onClick={() => setFormat("in-person")}>In-person</div>
                          <div className={`na-pill ${format === "online" ? "active" : ""}`} onClick={() => setFormat("online")}>Online</div>
                          <div className={`na-pill ${format === "home-visit" ? "active" : ""}`} onClick={() => setFormat("home-visit")}>Home Visit</div>
                        </div>

                        <TherapistPicker list={pickerList} value={therapistId} onChange={setTherapistId} hint={lastPickHint} />

                        {format === "home-visit" && (
                          <div className="na-row" style={{ gridTemplateColumns: "1fr" }}>
                            <div>
                              <label className="na-lbl">Address in Noida *</label>
                              <textarea className="na-inp na-textarea" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Flat / House no., Street, Sector, Landmark…" />
                            </div>
                            <div className="na-lookup-box na-lookup-notfound" style={{ marginTop: 10, marginBottom: 0 }}>
                              <span><Ic I={InfoOutlined} /> Home visit charges may increase depending on distance from CYT Noida — we'll confirm the final amount with you before your session.</span>
                            </div>
                          </div>
                        )}

                        {error && <div className="na-error"><Ic I={WarningAmberRounded} /> {error}</div>}
                        <div className="na-btn-row">
                          <button type="button" className="na-btn-back" onClick={() => bookingType === "followup" ? setPhase("slots") : setStep(1)}>Back</button>
                          <button type="button" className="na-submit" onClick={goToPayment}>Continue →</button>
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <div className="na-section-label">Review &amp; pay</div>
                        <div className="na-review" style={{ lineHeight: 1.5, padding: "6px 16px" }}>
                          <div className="na-rv"><span>Name</span><b>{effectiveName || "—"}</b></div>
                          <div className="na-rv"><span>Phone</span><b>{form.phone}</b></div>
                          <div className="na-rv"><span>Session</span><b>{modeLabel} · {formatLabel}</b></div>
                          {selectedTherapist && <div className="na-rv"><span>Therapist</span><b>{selectedTherapist.name}</b></div>}
                          {format === "home-visit" && <div className="na-rv"><span>Address</span><b>{address}</b></div>}
                          <div className="na-rv"><span>Date</span><b>{pickedDateLabel ? `${pickedDateLabel.weekday}, ${pickedDateLabel.day} ${pickedDateLabel.month}` : selectedDate}</b></div>
                          <div className="na-rv"><span>Time</span><b>{selectedSlot}</b></div>
                          {form.concern && <div className="na-rv"><span>Concern</span><b>{form.concern}</b></div>}
                          {usingCredit ? (
                            <div className="na-price-breakdown">
                              <div className="na-rv"><span>Package session</span><b>1 of {credit.sessionsRemaining} remaining</b></div>
                              <div className="na-price-total"><span>Amount due</span><span>₹0</span></div>
                            </div>
                          ) : (
                            <div className="na-price-breakdown" style={{ paddingBottom: 10 }}>
                              <div className="na-coupon">
                                {coupon ? (
                                  <div className="na-coupon-applied"><span><b>{coupon.code}</b> applied — you save ₹{coupon.discountAmount}</span><button type="button" onClick={removeCoupon}>Remove</button></div>
                                ) : couponOpen ? (
                                  <>
                                    <div className="na-coupon-row">
                                      <input className="na-inp" aria-label="Coupon code" placeholder="Coupon code" value={couponInput} autoCapitalize="characters" maxLength={20}
                                        onChange={e => { setCouponInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "")); setCouponError(""); }}
                                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }} />
                                      <button type="button" className="na-coupon-btn" disabled={couponBusy || !couponInput.trim()} onClick={applyCoupon}>{couponBusy ? "Checking…" : "Apply"}</button>
                                    </div>
                                    {couponError && <div className="na-coupon-err">{couponError}</div>}
                                    {!couponError && claimedCode && couponInput === claimedCode && <div className="na-coupon-hint">Your offer code is filled in — tap Apply.</div>}
                                  </>
                                ) : (
                                  <button type="button" className="na-coupon-link" onClick={() => setCouponOpen(true)}>Have a coupon code?</button>
                                )}
                              </div>
                              <div className="na-rv"><span>{modeLabel === "Package" ? selectedPackage?.name : `${modeLabel} session`}</span><b>₹{baseAmount}</b></div>
                              {discountAmount > 0 && <div className="na-rv" style={{ borderTop: "none", paddingTop: 0, color: "#15803d" }}><span>Coupon ({coupon.code})</span><b style={{ color: "#15803d" }}>−₹{discountAmount}</b></div>}
                              <div className="na-rv" style={{ borderTop: "none", paddingTop: 0 }}><span>Platform fee</span><b>₹{platformFee}</b></div>
                              <div className="na-price-total" style={{ fontSize: 18, alignItems: "baseline" }}><span>Total</span><span>₹{totalAmount}</span></div>
                            </div>
                          )}
                        </div>

                        {error && <div className="na-error"><Ic I={WarningAmberRounded} /> {error}</div>}

                        {selectedIsLastMinute && lastMinuteStatus !== "accepted" ? (
                          <>
                            <div className="na-lastmin-box">
                              {lastMinuteStatus === "pending" ? (
                                <>
                                  <div className="na-lastmin-title"><Ic I={HourglassTopRounded} /> Waiting for the center to confirm</div>
                                  <div className="na-lastmin-text">
                                    We'll unlock payment the moment they accept — expires in{" "}
                                    {mmss(Math.max(0, (lastMinuteExpiresIn ?? 0) - (lastMinutePolledAt ? (nowTick - lastMinutePolledAt) / 1000 : 0)))}.
                                  </div>
                                </>
                              ) : lastMinuteStatus === "rejected" || lastMinuteStatus === "expired" ? (
                                <>
                                  <div className="na-lastmin-title">
                                    {lastMinuteStatus === "rejected" ? "This request wasn't accepted" : "This request timed out"}
                                  </div>
                                  <div className="na-lastmin-text">Please pick another slot.</div>
                                  <button type="button" className="na-btn-back" style={{ marginTop: 12 }} onClick={() => { resetLastMinute(); setPhase("slots"); }}>Choose another slot</button>
                                </>
                              ) : (
                                <>
                                  <div className="na-lastmin-title"><Ic I={BoltRounded} /> This slot starts very soon</div>
                                  <div className="na-lastmin-text">
                                    It's inside our last-minute window, so we need the center to confirm they can take you before you pay.
                                    {(() => {
                                      const secondsToStart = Math.round((slotStartInstant(selectedDate, selectedSlot).getTime() - nowTick) / 1000);
                                      return secondsToStart <= 120 && secondsToStart > 0 ? (
                                        <strong style={{ color: "#b91c1c", display: "block", marginTop: 6 }}>
                                          Closing in {mmss(secondsToStart)} — send your request now.
                                        </strong>
                                      ) : null;
                                    })()}
                                  </div>
                                  <button type="button" className="na-submit" style={{ marginTop: 12 }} disabled={lastMinuteSending} onClick={handleSendLastMinuteRequest}>
                                    {lastMinuteSending ? "Sending…" : "Send Request"}
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="na-btn-row">
                              <button type="button" className="na-btn-back" onClick={goBackFromPay}>Back</button>
                            </div>
                          </>
                        ) : usingCredit ? (
                          <>
                          <div className="na-resched-policy">Reschedule policy: you can reschedule this session once (Reschedule tab). Further changes via WhatsApp.</div>
                          <div className="na-btn-row">
                            <button type="button" className="na-btn-back" onClick={goBackFromPay}>Back</button>
                            <button type="button" className="na-submit" data-busy={status === "loading" ? "1" : undefined} disabled={status === "loading"} onClick={handleConfirmCredit}>
                              {status === "loading" ? "Booking…" : "Confirm Booking"}
                            </button>
                          </div>
                          </>
                        ) : (
                          <>
                          <div className="na-resched-policy">Reschedule policy: each session can be rescheduled once (Reschedule tab){sessionMode === "package" ? " — that's one per session in your package" : ""}. Further changes via WhatsApp.</div>
                          <div className="na-secure">Secure checkout by Razorpay — UPI, cards &amp; netbanking</div>
                          <div className="na-btn-row">
                            <button type="button" className="na-btn-back" onClick={goBackFromPay}>Back</button>
                            <button type="button" className="na-submit" data-busy={status === "loading" ? "1" : undefined} disabled={status === "loading"} onClick={handleRazorpay}>
                              {status === "loading" ? "Opening payment…" : `Pay ₹${totalAmount} & Confirm`}
                            </button>
                          </div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        </div>

        {fitSlots && <NoidaSeoContent pricing={seoPricing} reviews={seoReviews} />}

        <footer className="na-foot">
          <div className="na-foot-in">
            <div className="na-foot-help">
              <div className="na-foot-help-title">Need help booking?</div>
              <p className="na-foot-help-text">Stuck at any step or unsure which session fits? Message us and we'll sort it out.</p>
              <a className="na-wa-btn" href={waLink("Hi, I need help with booking at CYT Noida.")} target="_blank" rel="noopener noreferrer"><Ic I={WhatsAppIcon} s={18} /> Chat on WhatsApp</a>
            </div>
            <div className="na-foot-big" aria-hidden="true">In-person therapy,<br />confirmed instantly.</div>
            <p className="na-foot-tag">CYT Noida. Pick a slot, pay, and your session is booked.</p>
            <ul className="na-foot-list">
              <li><Ic I={ScheduleRounded} /> 50–60 min session</li>
              <li>
                {pricing
                  ? <><Ic I={CurrencyRupeeRounded} /> Individual ₹{pricing.individual_inperson} · Couple ₹{pricing.couple_inperson}</>
                  : <span className="na-skel na-skel-chip" aria-hidden="true" />}
              </li>
              <li><Ic I={PlaceRounded} /> Sector 51, Noida</li>
              <li><Ic I={DirectionsRounded} /> <a className="na-foot-link" href={MAPS_URL} target="_blank" rel="noopener noreferrer">Get directions</a></li>
            </ul>
            <p className="na-foot-note"><Ic I={PlaceRounded} s={15} /> Gate No-3, D-137, near LPS Global School, Block D, Sector 51, Noida 201301</p>
            <p className="na-foot-note"><Ic I={InfoOutlined} s={15} /> Need a different time? Use the Reschedule tab. To cancel, WhatsApp us.</p>
            <div className="na-foot-brand">Choose Your Therapist · Know Expertise Before Choose</div>
          </div>
        </footer>

      </div>
    </>
  );
}

// What clients said after their session here — approved by the centre, newest first.
function NoidaReviews({ data }) {
  const [all, setAll] = useState(false);
  const list = all ? data.reviews : data.reviews.slice(0, 6);
  const stars = (n) => "★★★★★".slice(0, n);
  return (
    <div className="na-rv">
      <h3>What clients say</h3>
      <div className="na-rv-sum">
        <b>{data.summary.average.toFixed(1)}</b>
        <span className="na-rv-stars" aria-hidden="true">{stars(Math.round(data.summary.average))}<i>{"★★★★★".slice(Math.round(data.summary.average))}</i></span>
        <span>from {data.summary.count} client review{data.summary.count === 1 ? "" : "s"} after their session at the centre</span>
      </div>
      <div className="na-rv-grid">
        {list.map(r => (
          <figure key={r.id} className="na-rv-card">
            <div className="na-rv-stars" aria-label={`${r.rating} out of 5`}>{stars(r.rating)}<i>{"★★★★★".slice(r.rating)}</i></div>
            {r.text && <blockquote>{r.text}</blockquote>}
            <figcaption><b>{r.name}</b>{r.therapistName ? <span> · session with {r.therapistName}</span> : null}</figcaption>
          </figure>
        ))}
      </div>
      {data.reviews.length > 6 && !all && <button type="button" className="na-rv-more" onClick={() => setAll(true)}>Show all {data.reviews.length} reviews</button>}
    </div>
  );
}

// Real, readable text for people, Google and AI assistants: what the centre is, what it costs, how booking works, FAQs.
function NoidaSeoContent({ pricing, reviews }) {
  const faq = seoFaq(pricing);
  const rows = [
    ["Individual", "In-person (Sector 51)", pricing?.individual_inperson],
    ["Individual", "Online", pricing?.individual_online],
    ["Individual", "Home visit", pricing?.individual_homevisit],
    ["Couple", "In-person (Sector 51)", pricing?.couple_inperson],
    ["Couple", "Online", pricing?.couple_online],
    ["Couple", "Home visit", pricing?.couple_homevisit],
  ].filter(r => Number(r[2]) > 0);
  return (
    <section className="na-seo" aria-labelledby="na-seo-h">
      <div className="na-seo-in">
        <h2 id="na-seo-h">Psychologist in Noida — Choose Your Therapist, Sector 51</h2>
        <p>
          Choose Your Therapist runs a therapy centre in Sector 51, Noida where you can book a psychologist for
          individual or couple sessions — in person at the centre, online from home, or as a home visit. Open slots
          are shown live above: pick one, pay securely, and your appointment is confirmed instantly. Sessions last
          50–60 minutes and are open to anyone in Noida, Delhi NCR and beyond (online).
        </p>

        {reviews?.reviews?.length > 0 && <NoidaReviews data={reviews} />}

        {rows.length > 0 && (
          <>
            <h3>Session fees in Noida</h3>
            <div className="na-seo-table-wrap">
              <table className="na-seo-table">
                <thead><tr><th>Session</th><th>Mode</th><th>Fee</th></tr></thead>
                <tbody>{rows.map(([a, b, c]) => <tr key={a + b}><td>{a}</td><td>{b}</td><td>{inr(c)}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="na-seo-note">{pricing?.platformFee ? `A ${inr(pricing.platformFee)} platform fee applies per booking. ` : ""}Multi-session packages are available while booking. Home-visit charges may increase with distance.</p>
          </>
        )}

        <h3>How to book</h3>
        <ol className="na-seo-steps">
          <li><b>Pick a slot</b> — choose any open date and time in the table above.</li>
          <li><b>Tell us about you</b> — name, phone and a line about what you'd like help with.</li>
          <li><b>Choose your session</b> — individual or couple, in-person, online or home visit.</li>
          <li><b>Pay securely</b> — UPI, card or netbanking; confirmation is instant.</li>
        </ol>
        <p>Already a client? Use the <b>Follow-up</b> tab. Need a different time? Use the <b>Reschedule</b> tab.</p>

        <h3>Find the Noida centre</h3>
        <address className="na-seo-addr">
          Choose Your Therapist LLP<br />
          Gate No-3, D-137, near LPS Global School, Block D, Sector 51, Noida, Uttar Pradesh 201301<br />
          Phone / WhatsApp: <a href="tel:+918077757951">+91 80777 57951</a> · <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">Get directions on Google Maps</a>
        </address>

        <h3>Frequently asked questions</h3>
        <div className="na-seo-faq">
          {faq.map(f => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <p className="na-seo-links">
          Explore more: <a href="/psychologist-in-noida-delhi">Psychologist in Noida &amp; Delhi</a> ·{" "}
          <a href="/view-all-therapist">Browse all therapists</a> · <a href="/self-assessment">Free self-assessment</a> ·{" "}
          <a href="/privacy-policy">Privacy policy</a>
        </p>
      </div>
    </section>
  );
}

// Static page, refreshed hourly: the fee table and FAQ answers are written into the HTML (not just fetched in the
// browser) so search engines and AI assistants can read the current prices.
export async function getStaticProps() {
  let seoPricing = null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${apiUrl}/noida-appointments/pricing`, { signal: ctrl.signal });
    clearTimeout(t);
    const data = await res.json();
    if (data?.status && data.data) {
      const d = data.data;
      seoPricing = {
        individual_inperson: d.individual_inperson ?? null, individual_online: d.individual_online ?? null, individual_homevisit: d.individual_homevisit ?? null,
        couple_inperson: d.couple_inperson ?? null, couple_online: d.couple_online ?? null, couple_homevisit: d.couple_homevisit ?? null,
        platformFee: d.platformFee ?? null,
        packages: Array.isArray(d.packages) ? d.packages.map(k => ({ name: k.name, sessionsCount: k.sessionsCount, price: k.price })) : [],
      };
    }
  } catch (e) { /* build/ISR must never fail because pricing was unreachable — the page still works, just without the fee table */ }
  let seoReviews = null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${apiUrl}/noida-reviews`, { signal: ctrl.signal });
    clearTimeout(t);
    const data = await res.json();
    if (data?.status && data.data?.reviews?.length) seoReviews = data.data;
  } catch (e) { /* reviews are optional — the page builds without them */ }
  return { props: { seoPricing, seoReviews }, revalidate: 3600 };
}
