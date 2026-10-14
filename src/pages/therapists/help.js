import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import MainLayout from "../../components/therapists/main-layout";
import { PT_CSS } from "../../components/therapists/portal-ui";
import { fetchById, postData } from "../../utils/actions";
import { commsFeedbackUrl } from "../../utils/url";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

const PHONE = "918077757951";
const EMAIL = "hello@chooseyourtherapist.in";

const KINDS = [
  { id: "problem", label: "Something's not working" },
  { id: "question", label: "Question" },
  { id: "feature", label: "Feature idea" },
  { id: "other", label: "Other" },
];
const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.id, k.label]));

const FAQS = [
  { q: "How do I change my session fees or weekly hours?", a: <>Open <Link href="/my-schedule?tab=availability">My Schedule</Link>. Your weekly hours and fees are set there and update on your public profile straight away.</> },
  { q: "How do I update my photo, bio or qualifications?", a: <>Go to <Link href="/settings">Settings → Profile</Link>, make your changes and tap <b>Save profile</b> at the bottom. The header there shows what&apos;s still missing from your profile.</> },
  { q: "Which concerns and services do clients find me for?", a: <>The services and expertise you pick in <Link href="/settings?tab=offerings">Settings → Offerings</Link> decide which searches and concern pages list you.</> },
  { q: "How do payouts work?", a: <>Add your bank account or UPI ID in <Link href="/settings?tab=payments">Settings → Payments</Link>. Every payout the accounts team sends shows up on the <Link href="/therapists/payouts">Payouts</Link> page with its reference number.</> },
  { q: "Why isn't my profile showing on the website?", a: <>Your profile shows once it&apos;s approved and live — the status is under your name in the menu. If it says &ldquo;Not live yet&rdquo; or &ldquo;Listing expired&rdquo;, message us below and we&apos;ll check it.</> },
  { q: "How do I share my profile with clients?", a: <>Use <b>Share</b> in the menu, or copy your link from <Link href="/settings?tab=account">Settings → Account</Link>, and post it on WhatsApp, Instagram or your visiting card.</> },
  { q: "How do I log in? I don't have a password.", a: <>The portal uses a one-time code (OTP) sent to your registered email — there&apos;s no password to remember.</> },
  { q: "A client wants to reschedule or cancel. What do I do?", a: <>Open the session in <Link href="/appointments">Appointments</Link>. If you need the team&apos;s help with a booking, send us a message below with the client&apos;s name and session time.</> },
];

const ago = (d) => {
  const m = Math.round((Date.now() - new Date(d)) / 60000);
  if (m < 60) return `${Math.max(1, m)} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function Help() {
  const router = useRouter();
  const [kind, setKind] = useState("problem");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [mine, setMine] = useState(null);

  useEffect(() => {
    if (router.isReady && KIND_LABEL[router.query.kind]) setKind(router.query.kind);
  }, [router.isReady, router.query.kind]);

  const load = async () => {
    try { const r = await fetchById(commsFeedbackUrl); setMine(r?.status ? r.data : []); } catch (e) { setMine([]); }
  };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (message.trim().length < 5) { setMsg({ type: "err", text: "Please write a few words about it." }); return; }
    setSending(true);
    setMsg({ type: "", text: "" });
    try {
      const from = typeof document !== "undefined" && document.referrer ? (() => { try { return new URL(document.referrer).pathname; } catch (e) { return ""; } })() : "";
      const r = await postData(commsFeedbackUrl, { kind, message: message.trim(), page: from });
      if (r?.status) {
        setMessage("");
        setMsg({ type: "ok", text: "Sent! The team will reply here and by email." });
        load();
      } else setMsg({ type: "err", text: r?.message || "Couldn't send — please try again." });
    } catch (e) {
      setMsg({ type: "err", text: e?.response?.data?.message || "Couldn't send — check your connection and try again." });
    }
    setSending(false);
  };

  const wa = `https://wa.me/${PHONE}?text=${encodeURIComponent("Hi CYT team, I'm a therapist on the portal and need help with: ")}`;

  return (
    <MainLayout>
      <Head><title>Help &amp; support | Choose Your Therapist</title></Head>
      <style dangerouslySetInnerHTML={{ __html: PT_CSS + HP_CSS }} />
      <div className="pt">
        <div className="pt-head">
          <div>
            <h1>Help &amp; support</h1>
            <p>Talk to the CYT team, find quick answers, or tell us what to improve.</p>
          </div>
        </div>

        <div className="hp-contact">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="hp-c wa"><WhatsAppIcon /><span><b>WhatsApp us</b><small>Fastest · +91 80777 57951</small></span></a>
          <a href={`mailto:${EMAIL}`} className="hp-c"><MailOutlineRoundedIcon /><span><b>Email</b><small>{EMAIL}</small></span></a>
          <a href={`tel:+${PHONE}`} className="hp-c"><CallRoundedIcon /><span><b>Call</b><small>+91 80777 57951</small></span></a>
        </div>

        <div className="hp-grid">
          <div>
            <div className="pt-card" id="report">
              <div className="pt-card-h"><h2>Send a message to the team</h2></div>
              <div className="hp-kinds" role="radiogroup" aria-label="What is it about?">
                {KINDS.map((k) => (
                  <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} className={`hp-kind${kind === k.id ? " on" : ""}`} onClick={() => setKind(k.id)}>{k.label}</button>
                ))}
              </div>
              <textarea className="hp-ta" rows={5} maxLength={3000} value={message} onChange={(e) => { setMessage(e.target.value); if (msg.text) setMsg({ type: "", text: "" }); }}
                placeholder={kind === "feature" ? "What would make the portal more useful for you?" : kind === "question" ? "What would you like to know?" : "What happened, and on which page? Screenshots can go to WhatsApp."} aria-label="Your message" />
              <div className="hp-send">
                <span className={`hp-msg ${msg.type}`} role="status">{msg.text}</span>
                <button type="button" className="pt-btn primary" onClick={send} disabled={sending}><SendRoundedIcon /> {sending ? "Sending…" : "Send"}</button>
              </div>
            </div>

            <div className="pt-card">
              <div className="pt-card-h"><h2>Your messages</h2>{mine?.length > 0 && <span className="pt-chip mut">{mine.length}</span>}</div>
              {mine === null ? <div className="pt-skel" /> : mine.length ? (
                <ul className="hp-list">
                  {mine.map((f) => (
                    <li key={f._id}>
                      <div className="hp-top">
                        <span className="pt-chip mut">{KIND_LABEL[f.kind] || "Message"}</span>
                        <span className={`pt-chip ${f.status === "resolved" ? "ok" : "warn"}`}>{f.reply ? "Replied" : f.status === "resolved" ? "Resolved" : "Open"}</span>
                        <time>{ago(f.createdAt)}</time>
                      </div>
                      <p className="hp-q">{f.message}</p>
                      {f.reply && <div className="hp-reply"><b>CYT team</b> · {ago(f.repliedAt)}<p>{f.reply}</p></div>}
                    </li>
                  ))}
                </ul>
              ) : <div className="pt-empty">Nothing sent yet. Replies from the team show up here.</div>}
            </div>
          </div>

          <div className="pt-card">
            <div className="pt-card-h"><h2>Quick answers</h2></div>
            <div className="hp-faq">
              {FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}<ExpandMoreRoundedIcon /></summary>
                  <div>{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const HP_CSS = `
.hp-contact { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
.hp-c { display: flex; align-items: center; gap: 12px; background: #fff; border: 1px solid #e4ece7; border-radius: 16px; padding: 14px 16px; text-decoration: none !important; color: #0f172a; min-width: 0; transition: border-color .15s, background .15s; }
.hp-c:hover { border-color: #a7d7b8; background: #f8fcf9; }
.hp-c > svg { font-size: 26px; color: #166534; flex-shrink: 0; }
.hp-c.wa > svg { color: #16a34a; }
.hp-c span { min-width: 0; } .hp-c b { display: block; font-size: 14px; } .hp-c small { display: block; font-size: 12.5px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hp-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; align-items: start; }
.hp-kinds { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.hp-kind { height: 36px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #dfe7e2; background: #fff; color: #334155; font-weight: 600; font-size: 13px; font-family: inherit; cursor: pointer; }
.hp-kind.on { background: #166534; border-color: #166534; color: #fff; }
.hp-ta { width: 100%; border: 1px solid #d6e0da !important; border-radius: 12px !important; padding: 10px 12px; font-weight: 400; font-size: 14.5px; line-height: 1.55; font-family: inherit; resize: vertical; min-height: 120px; color: #0f172a; box-shadow: none; }
.hp-ta:focus { outline: none; border-color: #166534 !important; box-shadow: 0 0 0 3px rgba(22,101,52,.12) !important; }
.hp-send { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; }
.hp-msg { font-size: 13px; font-weight: 600; } .hp-msg.ok { color: #166534; } .hp-msg.err { color: #dc2626; }
.hp-list { list-style: none; margin: 0; padding: 0; }
.hp-list li { padding: 12px 0; border-top: 1px solid #eef2f0; margin: 0; } .hp-list li:first-child { border-top: 0; padding-top: 0; }
.hp-top { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; } .hp-top time { margin-left: auto; font-size: 12px; color: #94a3b8; }
.hp-q { font-size: 13.5px; color: #334155; margin: 8px 0 0; line-height: 1.55; white-space: pre-wrap; word-break: break-word; }
.hp-reply { margin-top: 8px; background: #f3fbf6; border-left: 3px solid #166534; border-radius: 0 10px 10px 0; padding: 8px 12px; font-size: 12px; color: #64748b; }
.hp-reply b { color: #166534; } .hp-reply p { font-size: 13.5px; color: #0f172a; margin: 4px 0 0; line-height: 1.55; white-space: pre-wrap; }
.hp-faq details { border-top: 1px solid #eef2f0; } .hp-faq details:first-child { border-top: 0; }
.hp-faq summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 0; cursor: pointer; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.4; }
.hp-faq summary::-webkit-details-marker { display: none; }
.hp-faq summary svg { color: #94a3b8; flex-shrink: 0; transition: transform .2s; }
.hp-faq details[open] summary svg { transform: rotate(180deg); }
.hp-faq details > div { font-size: 13.5px; color: #475569; line-height: 1.6; padding: 0 0 12px; }
.hp-faq a { color: #166534 !important; font-weight: 700; }
@media (max-width: 1023px) { .hp-grid { grid-template-columns: 1fr; } }
@media (max-width: 767px) {
  .hp-contact { grid-template-columns: 1fr; gap: 8px; }
  .hp-c { padding: 12px 14px; border-radius: 14px; }
  .hp-send { flex-direction: column-reverse; align-items: stretch; } .hp-send .pt-btn { width: 100%; }
  .hp-ta { font-size: 16px; }
}
`;
