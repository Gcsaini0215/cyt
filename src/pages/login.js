import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import { isValidMail, sanitizeOtp } from "../utils/validators";
import { apiErrorMessage } from "../utils/api-error";
import { loginUrl, verifyOtpUrl } from "../utils/url";
import { getDecodedToken, setToken } from "../utils/jwt";
import { postData } from "../utils/actions";
import { safeNext } from "../utils/safe-next";
import OtpInput from "../components/global/otp-input";
import CanvasCaptcha from "../components/global/canvas-captcha";
import { GBP_URL } from "../components/about/visit-centre";

// Sign in with a one-time code sent by email (no passwords).
// - ?next=/some/page brings people back to where they were after signing in.
// - The security code only appears after a couple of failed tries (the API rate-limits
//   OTP requests per user and per IP); first-time visitors just type their email.
// - An email with no account gets a "create account" option right here.
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;
const FAILS_KEY = "cyt_login_fails";
const CAPTCHA_AFTER = 2;

const readFails = () => { try { return Number(sessionStorage.getItem(FAILS_KEY) || 0); } catch { return 0; } };
const writeFails = (n) => { try { sessionStorage.setItem(FAILS_KEY, String(n)); } catch {} };

// "Open Gmail" etc. for the code step, picked from the email's domain
const inboxFor = (email) => {
  const d = String(email.split("@")[1] || "").toLowerCase();
  if (/gmail|googlemail/.test(d)) return { name: "Gmail", url: "https://mail.google.com/mail/u/0/#search/Choose+Your+Therapist" };
  if (/outlook|hotmail|live\.|msn/.test(d)) return { name: "Outlook", url: "https://outlook.live.com/mail/0/" };
  if (/yahoo|ymail|rocketmail/.test(d)) return { name: "Yahoo Mail", url: "https://mail.yahoo.com/" };
  if (/icloud|me\.com|mac\.com/.test(d)) return { name: "iCloud Mail", url: "https://www.icloud.com/mail" };
  return null;
};

export default function Login() {
  const router = useRouter();
  const [who, setWho] = useState("client"); // client | therapist — wording only, same sign-in
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpView, setOtpView] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [noAccount, setNoAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [fails, setFails] = useState(0);
  const captchaRef = useRef(null);
  const submittingRef = useRef(false);
  const next = safeNext(router.query.next);
  const needCaptcha = fails >= CAPTCHA_AFTER;

  useEffect(() => { setFails(readFails()); }, []);
  useEffect(() => {
    if (router.isReady && router.query.as === "therapist") setWho("therapist");
  }, [router.isReady]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((p) => (p <= 1 ? 0 : p - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // already signed in
  useEffect(() => {
    if (!router.isReady) return;
    const data = getDecodedToken();
    if (data) router.replace(next || (data.role === 1 ? "/therapist-dashboard" : "/my-dashboard"));
  }, [router.isReady]);

  const fail = () => { const n = fails + 1; setFails(n); writeFails(n); };

  const requestOtp = async (isResend = false) => {
    if (loading) return;
    if (isResend && cooldown > 0) return;
    setError("");
    setNoAccount(false);
    const mail = email.trim();
    if (!isValidMail(mail)) { setError("Please enter a valid email address."); return; }
    if (!isResend && needCaptcha && !captchaRef.current?.isValid()) {
      setError("The security code doesn't match. Please try again.");
      captchaRef.current?.refresh();
      return;
    }
    try {
      setLoading(true);
      const res = await postData(loginUrl, { email: mail });
      if (res.status) {
        setNotice(isResend ? "We've sent a new code." : "");
        setOtp("");
        setOtpView(true);
        setCooldown(RESEND_COOLDOWN);
      } else {
        setError(res.message || "Couldn't send the code. Please try again.");
        fail();
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) { setNoAccount(true); }
      else {
        if (status === 429) setCooldown(RESEND_COOLDOWN);
        setError(apiErrorMessage(err, "Couldn't send the code. Please try again."));
        fail();
      }
    } finally {
      setLoading(false);
      captchaRef.current?.refresh();
    }
  };

  const verify = async (value) => {
    if (loading || submittingRef.current) return;
    const code = sanitizeOtp(value ?? otp, OTP_LENGTH);
    setError("");
    if (code.length !== OTP_LENGTH) { setError("Please enter the 6-digit code."); return; }
    try {
      submittingRef.current = true;
      setLoading(true);
      const res = await postData(verifyOtpUrl, { email: email.trim(), otp: code });
      if (res.status) {
        setToken(res.token);
        writeFails(0);
        const role = res.data?.role;
        router.push(next || (role === 1 ? "/therapist-dashboard" : "/my-dashboard"));
      } else {
        setError(res.message || "That code didn't work. Please try again.");
        fail();
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Couldn't check the code. Please try again."));
      fail();
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const changeEmail = () => {
    setOtpView(false); setOtp(""); setError(""); setNotice(""); setCooldown(0);
  };

  const inbox = inboxFor(email);
  const registerHref = `/register?email=${encodeURIComponent(email.trim())}${next ? `&next=${encodeURIComponent(next)}` : ""}`;
  const isTher = who === "therapist";

  return (
    <>
      <Head>
        <title>Sign in | Choose Your Therapist</title>
        <meta name="robots" content="noindex, follow" />
        <meta name="description" content="Sign in to Choose Your Therapist with a one-time code sent to your email — manage your sessions and talk to your psychologist." />
        <link rel="canonical" href="https://www.chooseyourtherapist.in/login" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <MyNavbar />

      <main className="lg-page">
        <div className="lg-shell">
          {/* left: why sign in (desktop) / a slim strip (phones) */}
          <aside className="lg-side" aria-label="Why sign in">
            <h1>{isTher ? "Your practice, in one place" : "Your safe space"}</h1>
            <p className="lg-side-sub">
              {isTher ? "Manage your profile, availability, bookings and payouts." : "Pick up where you left off with your psychologist."}
            </p>
            <ul>
              {(isTher
                ? ["Bookings and session calendar", "Profile, fees and availability", "Client notes and invoices"]
                : ["Your upcoming and past sessions", "Book again with your psychologist", "Invoices and session details"]
              ).map((x) => <li key={x}><i className="feather-check" aria-hidden="true" /> {x}</li>)}
            </ul>
            <div className="lg-trust">
              <span><i className="feather-lock" aria-hidden="true" /> No password — a one-time code each time</span>
              <a href={GBP_URL} target="_blank" rel="noreferrer">★ 4.9 on Google · 5000+ sessions</a>
            </div>
          </aside>

          {/* right: the form */}
          <section className="lg-card" aria-labelledby="lg-h">
            <div className="lg-who" role="tablist" aria-label="I am a">
              <button type="button" role="tab" aria-selected={!isTher} className={!isTher ? "on" : ""} onClick={() => setWho("client")}>I'm a client</button>
              <button type="button" role="tab" aria-selected={isTher} className={isTher ? "on" : ""} onClick={() => setWho("therapist")}>I'm a therapist</button>
            </div>

            {!otpView ? (
              <form onSubmit={(e) => { e.preventDefault(); requestOtp(false); }} noValidate>
                <h2 id="lg-h">Sign in</h2>
                <p className="lg-sub">Enter your email — we'll send you a 6-digit code.</p>

                <label className="lg-field" htmlFor="lg-email">
                  <span>Email address</span>
                  <input id="lg-email" name="email" type="email" inputMode="email" autoComplete="email" autoFocus
                    value={email} onChange={(e) => { setEmail(e.target.value); setNoAccount(false); }}
                    placeholder="you@example.com" aria-invalid={Boolean(error) || noAccount} />
                </label>

                {needCaptcha && (
                  <div className="lg-field">
                    <span>Security check</span>
                    <CanvasCaptcha ref={captchaRef} disabled={loading} />
                  </div>
                )}

                {error && <p className="lg-err" role="alert">{error}</p>}
                {noAccount && (
                  <div className="lg-noacc" role="alert">
                    <b>There's no account for {email.trim()} yet.</b>
                    {isTher
                      ? <span>Therapists join through our application. <Link href="/therapist-registration">Apply to join →</Link></span>
                      : <span>Create one in a minute — it's free. <Link href={registerHref}>Create account →</Link></span>}
                  </div>
                )}

                <button type="submit" className="lg-btn" disabled={loading || cooldown > 0}>
                  {loading ? "Sending…" : cooldown > 0 ? `Wait ${cooldown}s` : "Send login code"}
                </button>

                <p className="lg-alt">
                  {isTher
                    ? <>Not on Choose Your Therapist yet? <Link href="/therapist-registration">Join as a therapist</Link></>
                    : <>New here? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link></>}
                </p>
              </form>
            ) : (
              <div>
                <h2 id="lg-h">Check your inbox</h2>
                <p className="lg-sub">We sent a 6-digit code to <b>{email.trim()}</b>. It may take a minute — check Spam or Promotions too.</p>
                {inbox && (
                  <a className="lg-inbox" href={inbox.url} target="_blank" rel="noreferrer"><i className="feather-mail" aria-hidden="true" /> Open {inbox.name}</a>
                )}
                <div className="lg-otp">
                  <OtpInput autoFocus value={otp} onChange={setOtp} onComplete={(v) => verify(v)} disabled={loading} />
                </div>
                {notice && !error && <p className="lg-ok" role="status">{notice}</p>}
                {error && <p className="lg-err" role="alert">{error}</p>}
                <button type="button" className="lg-btn" onClick={() => verify()} disabled={loading}>
                  {loading ? "Checking…" : "Verify & sign in"}
                </button>
                <div className="lg-row">
                  <button type="button" className="lg-ghost" onClick={() => requestOtp(true)} disabled={loading || cooldown > 0}>
                    <i className="feather-refresh-cw" aria-hidden="true" /> {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                  <button type="button" className="lg-ghost" onClick={changeEmail} disabled={loading}>
                    <i className="feather-edit-2" aria-hidden="true" /> Change email
                  </button>
                </div>
              </div>
            )}

            <p className="lg-privacy"><i className="feather-shield" aria-hidden="true" /> We never share your email. <Link href="/privacy-policy">Privacy policy</Link></p>
          </section>
        </div>
      </main>

      <footer className="lg-foot">
        <span>© {new Date().getFullYear()} Choose Your Therapist LLP</span>
        <nav aria-label="Footer">
          <Link href="/contact-us">Contact</Link>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-conditions">Terms</Link>
          <a href="tel:+918077757951">+91 80777 57951</a>
        </nav>
      </footer>
    </>
  );
}

const CSS = `
body { background: #f4f7f5; }
/* no floating callback tab on the sign-in page */
.cb-widget { display: none !important; }
.lg-page { min-height: calc(100vh - 200px); display: flex; align-items: center; justify-content: center; padding: 40px 16px 48px; background: radial-gradient(60% 50% at 80% 0%, rgba(30,122,76,.08), transparent 70%), #f4f7f5; }
.lg-shell { width: 100%; max-width: 940px; display: grid; grid-template-columns: 1fr 1fr; border-radius: 24px; overflow: hidden; background: #fff; box-shadow: 0 30px 60px -30px rgba(20,83,45,.35), 0 2px 8px rgba(20,83,45,.05); border: 1px solid #e3ebe6; }

.lg-side { position: relative; padding: 40px 38px; background: linear-gradient(160deg, #14532d 0%, #0b2418 100%); color: #fff; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
.lg-side::after { content: ""; position: absolute; right: -80px; bottom: -80px; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(236,199,125,.22), transparent 70%); pointer-events: none; }
.lg-side h1 { font-size: 28px; font-weight: 800; margin: 6px 0 0; color: #fff; line-height: 1.2; letter-spacing: -.01em; }
.lg-side-sub { margin: 0; padding: 0; color: rgba(255,255,255,.78); font-size: 15px; line-height: 1.6; }
.lg-side ul { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.lg-side li { margin: 0; display: flex; align-items: center; gap: 10px; font-size: 15px; color: #fff; }
.lg-side li::before { content: none; }
.lg-side li i { width: 24px; height: 24px; border-radius: 50%; background: rgba(236,199,125,.18); color: #ecc77d; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
.lg-trust { margin-top: auto; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.12); display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: rgba(255,255,255,.75); }
.lg-trust span { display: inline-flex; align-items: center; gap: 7px; }
.lg-trust a { color: #ecc77d !important; font-weight: 700; text-decoration: none !important; }

.lg-card { padding: 34px 38px 28px; display: flex; flex-direction: column; }
.lg-who { display: grid; grid-template-columns: 1fr 1fr; padding: 4px; border-radius: 12px; background: #f1f5f3; margin-bottom: 24px; }
.lg-who button { height: 38px; border: none; border-radius: 9px; background: none; font-size: 13.5px; font-weight: 700; color: #64748b; cursor: pointer; }
.lg-who button.on { background: #fff; color: #14532d; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
.lg-card h2 { font-size: 24px; font-weight: 800; color: #0b1712; margin: 0 0 6px; letter-spacing: -.01em; }
.lg-sub { margin: 0 0 20px; padding: 0; font-size: 14.5px; color: #64748b; line-height: 1.55; }
.lg-sub b { color: #0b1712; word-break: break-all; }
.lg-field { display: flex; flex-direction: column; gap: 6px; margin: 0 0 16px; }
.lg-field > span { font-size: 13px; font-weight: 700; color: #334155; }
.lg-field input[type=email] { height: 52px; border-radius: 12px; border: 1.5px solid #dbe5df !important; background: #f8faf9 !important; padding: 0 14px !important; font-size: 16px; color: #0b1712; outline: none; box-shadow: none !important; width: 100%; }
.lg-field input[type=email]:focus { border-color: #1e7a4c !important; background: #fff !important; box-shadow: 0 0 0 3px #dcefe3 !important; }
.lg-field .captcha-row { display: flex; align-items: center; gap: 8px; }
.lg-field .captcha-input { height: 48px !important; border-radius: 12px !important; border: 1.5px solid #dbe5df !important; background: #f8faf9 !important; padding: 0 12px !important; flex: 1; min-width: 0; }
.lg-field .captcha-refresh { height: 48px; width: 48px; border-radius: 12px; border: 1.5px solid #dbe5df; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.lg-field .captcha-canvas { border-radius: 10px; }
.lg-btn { width: 100%; height: 52px; border: none; border-radius: 12px; background: #1e7a4c; color: #fff; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 22px -12px rgba(30,122,76,.8); }
.lg-btn:hover { background: #186640; }
.lg-btn:disabled { opacity: .6; cursor: not-allowed; }
.lg-err { margin: 0 0 12px; padding: 10px 12px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 13.5px; }
.lg-ok { margin: 0 0 12px; padding: 10px 12px; border-radius: 10px; background: #eef6f1; border: 1px solid #cfe3d6; color: #14532d; font-size: 13.5px; }
.lg-noacc { margin: 0 0 14px; padding: 12px 14px; border-radius: 12px; background: #fffaf0; border: 1px solid #f0dfba; display: flex; flex-direction: column; gap: 4px; font-size: 14px; color: #5b4a2a; }
.lg-noacc b { color: #14532d; word-break: break-all; }
.lg-noacc a { color: #1e7a4c; font-weight: 800; }
.lg-alt { margin: 16px 0 0; padding: 0; text-align: center; font-size: 14px; color: #64748b; }
.lg-alt a { color: #1e7a4c; font-weight: 800; }
.lg-inbox { display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px; border-radius: 10px; border: 1.5px solid #cfdcd4; color: #14532d !important; font-weight: 700; font-size: 14px; text-decoration: none !important; margin: -6px 0 18px; }
.lg-otp { margin: 0 0 14px; }
.lg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.lg-ghost { height: 44px; border-radius: 11px; border: 1.5px solid #dbe5df; background: #fff; color: #14532d; font-size: 13.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.lg-ghost:disabled { color: #94a3b8; cursor: not-allowed; }
.lg-privacy { margin: 22px 0 0; padding: 14px 0 0; border-top: 1px solid #eef2f0; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12.5px; color: #94a3b8; }
.lg-privacy a { color: #64748b; font-weight: 700; }

.lg-foot { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 20px; padding: 18px max(16px, calc((100vw - 940px) / 2)); background: #0b2418; color: rgba(255,255,255,.6); font-size: 13px; }
.lg-foot nav { display: flex; flex-wrap: wrap; gap: 6px 18px; }
.lg-foot a { color: rgba(255,255,255,.8) !important; text-decoration: none !important; }

@media (max-width: 860px) {
  .lg-page { align-items: flex-start; padding: 16px 12px 32px; }
  .lg-shell { grid-template-columns: 1fr; border-radius: 20px; }
  /* phones: the form comes first; the "why sign in" panel shrinks to a strip under it */
  .lg-card { order: 1; padding: 22px 18px 20px; }
  .lg-side { order: 2; padding: 20px 18px; gap: 10px; }
  .lg-side h1 { font-size: 20px; }
  .lg-side-sub { display: none; }
  .lg-side li { font-size: 14px; }
  .lg-who { margin-bottom: 18px; }
  .lg-card h2 { font-size: 22px; }
  .lg-foot { justify-content: center; text-align: center; }
}
`;
