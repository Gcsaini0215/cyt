import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { safeNext } from "../utils/safe-next";
import { isValidMail } from "../utils/validators";
import { registerUrl, verifyOtpUrl } from "../utils/url";
import Footer from "../components/footer";
import MyNavbar from "../components/navbar";
import PhotoHero from "../components/global/photo-hero";
import OtpInput from "../components/global/otp-input";
import { getDecodedToken, setToken } from "../utils/jwt";
import { postData } from "../utils/actions";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpView, setOtpView] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (name.length < 3 || name.length > 30) return setError("Please enter valid name");
    if (phone.length !== 10) return setError("Please enter valid phone number");
    if (email.length < 7 || !isValidMail(email)) return setError("Please enter valid email address");

    const value = { email, name, phone };
    try {
      setLoading(true);
      const response = await postData(registerUrl, value);
      if (response.status) {
        setSuccess(response.message);
        setOtpView(true);
        setError("");
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleOtp = async (code = otp) => {
    setError("");
    if (String(code).length !== 6) return setError("Please enter the 6-digit code");
    const value = { email, otp: code };
    try {
      setLoading(true);
      const response = await postData(verifyOtpUrl, value);
      if (response.status) {
        setSuccess(response.message);
        setError("");
        setOtp("");
        setToken(response.token);
        router.push(safeNext(router.query.next) || "/my-dashboard");
      } else {
        setError(response.message || "Something went wrong");
      }
    } catch (error) {
      setSuccess("");
      setError(error.response?.data?.message || error.message || "Something went wrong");
    }
    setLoading(false);
  };

  useEffect(() => {
    const data = getDecodedToken();
    if (data) {
      if (data.role === 1) router.push("/therapist-dashboard");
      else router.push(safeNext(router.query.next) || "/my-dashboard");
    }
  }, [router]);

  // coming from the login page with an email that has no account yet: keep what they typed
  useEffect(() => {
    if (router.isReady && typeof router.query.email === "string" && !email) setEmail(router.query.email);
  }, [router.isReady]);

  return (
    <div>
      <Head>
        <title>Client Registration | Start Your Healing Journey | Choose Your Therapist</title>
        <meta name="description" content="Join Choose Your Therapist today. Register as a client to find verified psychologists, book sessions, and manage your mental health journey." />
        <meta name="keywords" content="Client Registration, Book Therapist India, Start Counseling, Mental Health Support Signup" />
        <link rel="canonical" href="https://chooseyourtherapist.in/register" />
        <meta property="og:title" content="Client Registration | Start Your Healing Journey | Choose Your Therapist" />
        <meta property="og:description" content="Register as a client to find verified psychologists and book sessions." />
        <meta property="og:url" content="https://chooseyourtherapist.in/register" />
        <meta key="og:type" property="og:type" content="website" />
        <meta property="og:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Client Registration | Start Your Healing Journey | Choose Your Therapist" />
        <meta name="twitter:description" content="Register today and take the first step towards better mental health." />
        <meta name="twitter:image" content="https://chooseyourtherapist.in/assets/img/og-image.jpg" />
      </Head>

      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <MyNavbar />

      <PhotoHero
        images={["/assets/img/hero/in-therapy-session-1920.webp", "/assets/img/hero/in-consultation-1920.webp", "/assets/img/hero/in-calm-room-1920.webp"]}
        pill={<><i className="feather-heart" aria-hidden="true" /> Your well-being matters</>}
        title={<>Begin your journey to <span>feeling better</span></>}
        lead="Create a free account to find verified psychologists, book sessions and keep everything in one place."
        stats={[{ value: "Verified", label: "psychologists only" }, { value: "4.9 ★", label: "on Google" }, { value: "Free", label: "to sign up" }]}
      />

      <main className="rg-page">
        <div className="rg-shell phx-overlap">
        {/* left: why sign up (desktop) / a slim strip under the form (phones) */}
        <aside className="rg-side" aria-label="Why create an account">
          <h2 className="rg-side-h">Your space to heal</h2>
          <p className="rg-side-sub">One free account for everything on Choose Your Therapist.</p>
          <ul>
            {["Find verified psychologists near you or online", "Book, reschedule and pay in one place", "Your sessions, invoices and notes — private to you"]
              .map((x) => <li key={x}><i className="feather-check" aria-hidden="true" /> {x}</li>)}
          </ul>
          <div className="rg-trust">
            <span><i className="feather-lock" aria-hidden="true" /> Your details stay private</span>
            <span><i className="feather-phone" aria-hidden="true" /> Need help? <a href="tel:+918077757951">+91 80777 57951</a></span>
          </div>
        </aside>
        <section className="rg-card" aria-labelledby="rg-h">
          {otpView ? (
            <>
              <h2 id="rg-h">Check your inbox</h2>
              <p className="rg-sub">We sent a 6-digit code to <b>{email}</b>. It may take a minute — check Spam or Promotions too.</p>
              <div className="rg-otp">
                <OtpInput autoFocus value={otp} onChange={setOtp} onComplete={(v) => handleOtp(v)} disabled={loading} />
              </div>
              {error && <p className="rg-err" role="alert">{error}</p>}
              {success && !error && <p className="rg-ok" role="status">{success}</p>}
              <button type="button" className="rg-btn" onClick={() => handleOtp()} disabled={loading}>
                {loading ? "Checking…" : "Verify & continue"}
              </button>
              <button type="button" className="rg-ghost" disabled={loading}
                onClick={() => { setOtpView(false); setOtp(""); setError(""); setSuccess(""); }}>
                <i className="feather-edit-2" aria-hidden="true" /> Wrong email? Go back
              </button>
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} noValidate>
              <h2 id="rg-h">Create your account</h2>
              <p className="rg-sub">Takes a minute — we'll send a code to confirm your email.</p>
              <label className="rg-field"><span>Full name</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Riya Sharma" autoComplete="name" />
              </label>
              <label className="rg-field"><span>Email address</span>
                <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </label>
              <label className="rg-field"><span>Mobile number</span>
                <div className="rg-phone"><em>+91</em>
                  <input type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="98xxxxxxxx" autoComplete="tel-national" />
                </div>
              </label>
              {error && <p className="rg-err" role="alert">{error}</p>}
              <button type="submit" className="rg-btn" disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
            </form>
          )}

          <div className="rg-links">
            <span>Already have an account? <Link href={`/login${router.query.next ? `?next=${encodeURIComponent(router.query.next)}` : ""}`}>Sign in</Link></span>
            <span>Are you a therapist? <Link href="/therapist-registration">Join as a professional</Link></span>
          </div>
          <p className="rg-privacy"><i className="feather-shield" aria-hidden="true" /> We never share your details. <Link href="/privacy-policy">Privacy policy</Link></p>
        </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const CSS = `
body { background: #f4f7f5; }
.rg-page { padding: 0 16px 56px; background: #f4f7f5; font-family: 'Inter', system-ui, sans-serif; }
.rg-shell { max-width: 940px; margin-left: auto; margin-right: auto; display: grid; grid-template-columns: 1fr 1fr; border-radius: 24px; overflow: hidden; background: #fff; border: 1px solid #e3ebe6; box-shadow: 0 30px 60px -30px rgba(20,83,45,.35), 0 2px 8px rgba(20,83,45,.05); }
.rg-side { position: relative; padding: 40px 38px; background: linear-gradient(170deg, #f6faf7 0%, #eef6f1 100%); border-right: 1px solid #e3ebe6; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
.rg-side::after { content: ""; position: absolute; right: -90px; bottom: -90px; width: 260px; height: 260px; border-radius: 50%; background: radial-gradient(circle, rgba(30,122,76,.10), transparent 70%); pointer-events: none; }
.rg-side .rg-side-h { font-size: 26px; font-weight: 800; margin: 6px 0 0; color: #0b1712; line-height: 1.2; letter-spacing: -.01em; }
.rg-side-sub { margin: 0; padding: 0; color: #5b6b62; font-size: 15px; line-height: 1.6; }
.rg-side ul { list-style: none; margin: 6px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.rg-side li { margin: 0; display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: #26392f; line-height: 1.45; }
.rg-side li::before { content: none; }
.rg-side li i { width: 24px; height: 24px; border-radius: 50%; background: #dcf2e4; color: #1e7a4c; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
.rg-trust { margin-top: auto; padding-top: 18px; border-top: 1px solid #dfe9e3; display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #5b6b62; }
.rg-trust span { display: inline-flex; align-items: center; gap: 7px; }
.rg-trust a { color: #1e7a4c; font-weight: 700; }
.rg-card { padding: 34px 38px 26px; }
.rg-card h2 { font-size: 24px; font-weight: 800; color: #0b1712; margin: 0 0 6px; letter-spacing: -.01em; }
.rg-sub { margin: 0 0 20px; padding: 0; font-size: 14.5px; color: #64748b; line-height: 1.55; }
.rg-sub b { color: #0b1712; word-break: break-all; }
.rg-field { display: flex; flex-direction: column; gap: 6px; margin: 0 0 14px; }
.rg-field > span { font-size: 13px; font-weight: 700; color: #334155; }
.rg-field input { height: 50px; border-radius: 12px; border: 1.5px solid #dbe5df !important; background: #f8faf9 !important; padding: 0 14px !important; font-size: 16px; color: #0b1712; outline: none; box-shadow: none !important; width: 100%; }
.rg-field input:focus { border-color: #1e7a4c !important; background: #fff !important; box-shadow: 0 0 0 3px #dcefe3 !important; }
.rg-phone { display: flex; }
.rg-phone em { font-style: normal; display: flex; align-items: center; padding: 0 12px; border: 1.5px solid #dbe5df; border-right: none; border-radius: 12px 0 0 12px; background: #f1f5f3; font-weight: 700; font-size: 14px; color: #64748b; }
.rg-phone input { border-radius: 0 12px 12px 0 !important; }
.rg-btn { width: 100%; height: 52px; border: none; border-radius: 12px; background: #1e7a4c; color: #fff; font-size: 16px; font-weight: 800; cursor: pointer; margin-top: 4px; box-shadow: 0 10px 22px -12px rgba(30,122,76,.8); }
.rg-btn:hover { background: #186640; }
.rg-btn:disabled { opacity: .6; cursor: not-allowed; }
.rg-ghost { width: 100%; height: 44px; margin-top: 10px; border-radius: 11px; border: 1.5px solid #dbe5df; background: #fff; color: #14532d; font-size: 13.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.rg-otp { margin: 0 0 14px; }
.rg-err { margin: 0 0 12px; padding: 10px 12px; border-radius: 10px; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 13.5px; }
.rg-ok { margin: 0 0 12px; padding: 10px 12px; border-radius: 10px; background: #eef6f1; border: 1px solid #cfe3d6; color: #14532d; font-size: 13.5px; }
.rg-links { margin-top: 18px; display: flex; flex-direction: column; gap: 6px; align-items: center; font-size: 14px; color: #64748b; text-align: center; }
.rg-links a { color: #1e7a4c; font-weight: 800; }
.rg-privacy { margin: 18px 0 0; padding: 14px 0 0; border-top: 1px solid #eef2f0; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12.5px; color: #94a3b8; }
.rg-privacy a { color: #64748b; font-weight: 700; }
@media (max-width: 860px) {
  .rg-page { padding: 0 12px 32px; }
  .rg-shell { grid-template-columns: 1fr; border-radius: 20px; }
  .rg-card { order: 1; padding: 22px 18px 18px; }
  .rg-side { order: 2; padding: 20px 18px; gap: 10px; border-right: none; border-top: 1px solid #e3ebe6; }
  .rg-side .rg-side-h { font-size: 20px; }
  .rg-side-sub { display: none; }
  .rg-side li { font-size: 14px; }
  .rg-card h2 { font-size: 22px; }
}
`;
