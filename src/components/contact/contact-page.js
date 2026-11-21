import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  MessageCircle, Phone, Mail, MapPin, Clock, ArrowRight, Navigation, Search, Building2, GraduationCap, UserPlus,
  ShieldCheck, Star, LifeBuoy, HelpCircle, CalendarCheck, CheckCheck, Lock,
} from "lucide-react";
import { postData } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";
import { usePublicStats, ratingText, reviewsText } from "../../utils/public-stats";
import { usePageMotion, Registered, CSS as EAP_CSS } from "../business/eap";

/* /contact-us (2026-11-21, owner: same look as the other pages — banner + styling). Shares the EAP page's
   design (cream hero, gold words, green circle, cards, motion). Facts only: CYT's own phone, email, Noida
   centre address and hours, the live Google rating. The form posts to the same consultation endpoint as before. */

const PHONE = "+91 80777 57951";
const TEL = "tel:+918077757951";
const EMAIL = "chooseyourtherapist@gmail.com";
const WA = (t) => `https://wa.me/918077757951?text=${encodeURIComponent(t)}`;
const WA_LINK = WA("Hi, I have a question for the Choose Your Therapist team.");
const ADDRESS = "Gate No-3, D-137, near LPS Global School, Block D, Sector 51, Noida, Uttar Pradesh 201301";
const DIRECTIONS = "https://www.google.com/maps/dir/?api=1&destination=Choose+Your+Therapist+LLP+Sector+51+Noida";
const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.744111222452!2d77.37163351147552!3d28.58216257568552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce53c9f5d50bb%3A0x3d5c4d84b4f34ff8!2sChoose%20Your%20Therapist%20LLP%20%7C%20Psychologist%20in%20Noida%20%26%20Delhi!5e0!3m2!1sen!2sin!4v1716200000000!5m2!1sen!2sin";

const CHANNELS = [
  { icon: MessageCircle, tone: "wa", title: "WhatsApp", line: PHONE, note: "Quickest way to reach us", cta: "Chat now", href: WA_LINK, ext: true },
  { icon: Phone, tone: "g", title: "Call us", line: PHONE, note: "Mon–Sun · 9 AM – 9 PM", cta: "Call now", href: TEL },
  { icon: Mail, tone: "gold", title: "Email", line: EMAIL, note: "Reply within 24 hours", cta: "Write to us", href: `mailto:${EMAIL}` },
  { icon: MapPin, tone: "blue", title: "Visit our centre", line: "D-137, Sector 51, Noida", note: "In-person sessions by appointment", cta: "Get directions", href: DIRECTIONS, ext: true },
];

const ROUTES = [
  { icon: Search, title: "Find a therapist", desc: "Browse verified psychologists by concern, language and fee.", href: "/view-all-therapist" },
  { icon: CalendarCheck, title: "Book at the Noida centre", desc: "In-person sessions at our own centre in Sector 51.", href: "/noida-appointment" },
  { icon: HelpCircle, title: "Ask a psychologist", desc: "Ask anonymously — answered by a verified psychologist.", href: "/ask-a-psychologist" },
  { icon: UserPlus, title: "Join as a therapist", desc: "Psychologists and counsellors can apply to list on CYT.", href: "/therapist-registration" },
  { icon: Building2, title: "For companies", desc: "Employee Assistance Program for your team.", href: "/for-business" },
  { icon: GraduationCap, title: "Schools & colleges", desc: "Student wellbeing programs and internships.", href: "/for-schools-colleges" },
];

const TOPICS = ["Finding a therapist", "A booking or payment", "Visiting the Noida centre", "Joining as a therapist", "Business / institution", "Something else"];
const EMPTY = { name: "", email: "", phone: "", topic: "", message: "" };

function Hero({ stats }) {
  return (
    <section className="eap-hero cu-hero" aria-labelledby="cu-title">
      <div className="eap-wrap eap-hero-in">
        <div className="eap-hero-l">
          <span className="eap-kicker"><MessageCircle size={15} /> Contact us</span>
          <h1 id="cu-title">We&apos;re here to <em>listen</em> — and to help</h1>
          <p className="eap-lead">
            Questions about finding the right psychologist, a booking, or visiting our Noida centre? Message, call or
            write to the Choose Your Therapist team — real people, not a bot.
          </p>
          <div className="eap-ctas">
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="eap-btn eap-btn-main"><MessageCircle size={18} /> WhatsApp us</a>
            <a href={TEL} className="eap-btn eap-btn-ghost"><Phone size={18} /> {PHONE}</a>
          </div>
          <ul className="eap-proof">
            <li><Clock size={15} /> <b>Mon–Sun</b> 9 AM – 9 PM</li>
            <li><Star size={15} /> <b>{ratingText(stats)}</b> on Google · {reviewsText(stats)} reviews</li>
            <li><ShieldCheck size={15} /> Since 2020 · HFR ID IN0510005384</li>
          </ul>
        </div>
        <div className="eap-hero-r cu-hero-r" aria-hidden="true">
          <div className="eap-hero-circle" />
          <div className="cu-chat">
            <div className="cu-chat-h">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/cyt-icon-96.png" alt="" width="38" height="38" />
              <div><b>CYT Support</b><small>Typically replies within minutes</small></div>
            </div>
            <div className="cu-chat-b">
              <p className="cu-msg me">Hi, I&apos;ve been feeling anxious lately. How do I find the right therapist?<i><CheckCheck size={14} /></i></p>
              <p className="cu-msg">Hi! Thank you for reaching out 💚 Tell us a little about what you&apos;re going through and your preferred language — we&apos;ll suggest verified psychologists who fit.</p>
              <p className="cu-msg">You can talk online or at our Noida centre.</p>
              <span className="cu-typing"><i /><i /><i /></span>
            </div>
          </div>
          <div className="eap-badge eap-badge-a cu-badge-a"><span><Lock size={17} /></span><div><b>100% confidential</b><small>Your details stay with us</small></div></div>
          <div className="eap-badge eap-badge-b cu-badge-b"><span><ShieldCheck size={17} /></span><div><b>Verified psychologists</b><small>Online · Noida centre</small></div></div>
        </div>
      </div>
    </section>
  );
}

function Channels() {
  return (
    <section className="cu-ch-sec" aria-label="Ways to reach us">
      <div className="eap-wrap">
        <div className="cu-ch" data-rs="">
          {CHANNELS.map((c) => (
            <a key={c.title} className={`cu-ch-c t-${c.tone}`} href={c.href} {...(c.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <span className="cu-ch-ic"><c.icon size={22} /></span>
              <b>{c.title}</b>
              <span className="cu-ch-l">{c.line}</span>
              <small>{c.note}</small>
              <span className="cu-ch-go">{c.cta} <ArrowRight size={15} /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Routes() {
  return (
    <section className="eap-sec cu-routes" aria-labelledby="cu-routes-h">
      <div className="eap-wrap">
        <div className="eap-head" data-r="">
          <span className="eap-eyebrow">Quick help</span>
          <h2 id="cu-routes-h">What can we <em>help you with?</em></h2>
          <p>Most questions have a faster answer — pick what fits, or send us a message below.</p>
        </div>
        <div className="cu-rt" data-rs="">
          {ROUTES.map((r) => (
            <Link key={r.href} href={r.href} className="eap-card cu-rt-c">
              <span className="eap-ic"><r.icon size={20} /></span>
              <div><h3>{r.title}</h3><p>{r.desc}</p></div>
              <ArrowRight size={18} className="cu-rt-go" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Form() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: k === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return setError("Please fill in your name, email and message.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Please enter a valid email address.");
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) return setError("Please enter a valid 10-digit phone number, or leave it empty.");
    try {
      setLoading(true);
      await postData(SubmitConsultationUrl, {
        name: form.name.trim(), email: form.email.trim(), phone: form.phone,
        message: form.topic ? `[${form.topic}] ${form.message.trim()}` : form.message.trim(),
        concern: form.topic || "Contact page message", source: "Contact Page",
      });
      setSuccess("Message sent! We'll get back to you within 24 hours.");
      setForm(EMPTY);
    } catch {
      setError("Something went wrong. Please try again or WhatsApp us directly.");
    }
    setLoading(false);
  };

  return (
    <section className="eap-sec eap-sec-sage" id="cu-message" aria-labelledby="cu-msg-h">
      <div className="eap-wrap eap-enq">
        <div className="eap-enq-l" data-r="">
          <span className="eap-eyebrow">Send a message</span>
          <h2 id="cu-msg-h">Write to <em>our team</em></h2>
          <p>Tell us what you need — we read every message and reply personally.</p>
          <ol className="eap-next">
            <li><Clock size={18} /><div><b>Reply within 24 hours</b><span>Usually much sooner on WhatsApp.</span></div></li>
            <li><Lock size={18} /><div><b>Private and confidential</b><span>Your details are only used to reply to you.</span></div></li>
            <li><ShieldCheck size={18} /><div><b>Matched with care</b><span>If you need a therapist, we suggest verified psychologists who fit.</span></div></li>
          </ol>
          <div className="eap-contact">
            <span>Prefer to talk now?</span>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp {PHONE}</a>
            <a href={`mailto:${EMAIL}`}><Mail size={16} /> {EMAIL}</a>
          </div>
        </div>
        <form className="eap-form" onSubmit={submit} noValidate data-r="">
          <div className="eap-f2">
            <label>Your name *<input value={form.name} onChange={set("name")} autoComplete="name" placeholder="Full name" /></label>
            <label>Phone<input value={form.phone} onChange={set("phone")} inputMode="numeric" placeholder="10-digit number" autoComplete="tel-national" /></label>
            <label className="cu-span2">Email *<input type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" /></label>
          </div>
          <div className="eap-f-l">What is it about?</div>
          <div className="eap-needs">
            {TOPICS.map((t) => (
              <button type="button" key={t} className={form.topic === t ? "on" : ""} aria-pressed={form.topic === t}
                onClick={() => setForm((p) => ({ ...p, topic: p.topic === t ? "" : t }))}>{t}</button>
            ))}
          </div>
          <label className="eap-full">Your message *<textarea rows={4} value={form.message} onChange={set("message")} placeholder="How can we help you?" /></label>
          {error && <div className="eap-err" role="alert">{error}</div>}
          {success && <div className="eap-ok" role="status">{success}</div>}
          <button type="submit" className="eap-btn eap-btn-main eap-submit" disabled={loading}>{loading ? "Sending…" : <>Send message <ArrowRight size={18} /></>}</button>
          <small className="eap-note">Your details are only used to reply to this message.</small>
        </form>
      </div>
    </section>
  );
}

function Visit() {
  return (
    <section className="eap-sec cu-visit" aria-labelledby="cu-visit-h">
      <div className="eap-wrap cu-v">
        <div className="cu-v-l" data-r="">
          <span className="eap-eyebrow">Visit us</span>
          <h2 id="cu-visit-h">Our <em>Noida centre</em></h2>
          <p>Meet a psychologist in person in a calm, private room — or start online and visit when you&apos;re ready.</p>
          <ul className="cu-v-list">
            <li><span><MapPin size={18} /></span><div><b>Address</b>{ADDRESS}</div></li>
            <li><span><Clock size={18} /></span><div><b>Hours</b>Monday – Sunday · 9 AM – 9 PM · by appointment</div></li>
            <li><span><Phone size={18} /></span><div><b>Phone</b><a href={TEL}>{PHONE}</a></div></li>
          </ul>
          <div className="eap-ctas">
            <a href={DIRECTIONS} target="_blank" rel="noopener noreferrer" className="eap-btn eap-btn-main"><Navigation size={18} /> Get directions</a>
            <Link href="/noida-appointment" className="eap-btn eap-btn-ghost">Book a visit</Link>
          </div>
        </div>
        <div className="cu-map" data-r="">
          <iframe src={MAP_EMBED} title="Choose Your Therapist LLP, Sector 51, Noida on Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </div>
    </section>
  );
}

function Crisis() {
  return (
    <section className="cu-crisis" aria-label="In an emergency">
      <div className="eap-wrap">
        <div className="cu-cr" data-r="">
          <span className="cu-cr-ic"><LifeBuoy size={22} /></span>
          <p><b>In an emergency?</b> CYT is not an emergency service. If you or someone near you is in immediate danger, call <a href="tel:112">112</a>, or India&apos;s free 24×7 Tele-MANAS mental health helpline <a href="tel:14416">14416</a>.</p>
        </div>
      </div>
    </section>
  );
}

export default function ContactPage() {
  const stats = usePublicStats();
  const rootRef = useRef(null);
  usePageMotion(rootRef);
  return (
    <main className="eap cu" ref={rootRef}>
      <Hero stats={stats} />
      <Channels />
      <Registered />
      <Routes />
      <Form />
      <Visit />
      <Crisis />
      <style dangerouslySetInnerHTML={{ __html: EAP_CSS + CU_CSS }} />
    </main>
  );
}

const CU_CSS = `
/* hero: a WhatsApp-style chat card on the green circle instead of a photo */
.cu-hero-r { min-height:500px; align-items:center; }
.cu .eap-hero-circle { bottom:auto; top:50%; transform:translate(-50%,-50%); width:min(470px,100%); }
.cu-chat { position:relative; z-index:1; width:min(360px,88%); background:#efeae2; border-radius:26px; overflow:hidden;
  box-shadow:0 40px 70px -30px rgba(10,40,25,.65), 0 0 0 8px rgba(255,255,255,.55); animation:eapFloat 6s ease-in-out infinite; }
.cu-chat-h { display:flex; align-items:center; gap:10px; background:#075e54; color:#fff; padding:12px 14px; }
.cu-chat-h img { border-radius:50%; background:#fff; padding:3px; }
.cu-chat-h b { display:block; font-size:15px; } .cu-chat-h small { display:block; font-size:12px; color:#cde8e2; }
.cu-chat-b { display:flex; flex-direction:column; gap:8px; padding:14px 12px 16px; }
.cu-msg { position:relative; margin:0; max-width:86%; background:#fff; color:#111b21; font-size:13.5px; line-height:1.45; padding:8px 11px; border-radius:4px 14px 14px 14px; box-shadow:0 1px 1px rgba(0,0,0,.08); }
.cu-msg.me { align-self:flex-end; background:#d9fdd3; border-radius:14px 4px 14px 14px; padding-right:28px; }
.cu-msg.me i { position:absolute; right:7px; bottom:5px; color:#53bdeb; display:flex; }
.cu-typing { display:inline-flex; gap:4px; align-self:flex-start; background:#fff; border-radius:14px; padding:10px 12px; }
.cu-typing i { width:6px; height:6px; border-radius:50%; background:#8696a0; animation:cuDot 1.2s infinite ease-in-out; }
.cu-typing i:nth-child(2) { animation-delay:.15s; } .cu-typing i:nth-child(3) { animation-delay:.3s; }
@keyframes cuDot { 0%, 80%, 100% { opacity:.35; transform:translateY(0); } 40% { opacity:1; transform:translateY(-3px); } }
.cu .cu-badge-a { right:-14px; left:auto; top:7%; bottom:auto; }
.cu .cu-badge-b { left:-22px; right:auto; top:62%; bottom:auto; }

/* ways to reach us: four cards pulled up over the hero's edge */
.cu-ch-sec { position:relative; z-index:2; margin-top:-34px; padding-bottom:30px; }
.cu-ch { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
.cu-ch-c { --t:#14532d; --tb:#e6f3ea; display:flex; flex-direction:column; align-items:flex-start; gap:4px; background:#fff; border:1px solid var(--line); border-radius:22px; padding:20px;
  text-decoration:none !important; color:var(--ink) !important; box-shadow:0 24px 44px -34px rgba(23,60,42,.7); transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease; min-width:0; }
.cu-ch-c:hover { transform:translateY(-4px); border-color:var(--tb); box-shadow:0 30px 50px -30px rgba(23,60,42,.6); }
.cu-ch-c.t-wa { --t:#128c7e; --tb:#dcf5ee; } .cu-ch-c.t-gold { --t:#a86e0e; --tb:#fbf1dc; } .cu-ch-c.t-blue { --t:#1d63d8; --tb:#e5eefc; }
.cu-ch-ic { width:48px; height:48px; border-radius:16px; display:flex; align-items:center; justify-content:center; background:var(--tb); color:var(--t); margin-bottom:8px; }
.cu-ch-c > b { font-size:17px; font-weight:800; }
.cu-ch-l { font-size:14.5px; font-weight:700; color:#2b3a32; overflow-wrap:anywhere; }
.cu-ch-c small { font-size:13px; color:#6b7a72; }
.cu-ch-go { margin-top:10px; display:inline-flex; align-items:center; gap:6px; font-size:14px; font-weight:800; color:var(--t); }

/* quick help routes */
.cu-routes { padding-top:64px; }
.cu-rt { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
.cu-rt-c { display:flex; align-items:flex-start; gap:14px; text-decoration:none !important; color:var(--ink) !important; }
.cu-rt-c .eap-ic { flex:none; }
.cu-rt-c h3 { margin:2px 0 4px; }
.cu-rt-c > div { flex:1; min-width:0; }
.cu-rt-go { flex:none; color:var(--gold); margin-top:12px; transition:transform .2s ease; }
.cu-rt-c:hover .cu-rt-go { transform:translateX(4px); }

/* form */
.cu .eap-form .cu-span2 { grid-column:1 / -1; }

/* visit */
.cu-v { display:grid; grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr); gap:44px; align-items:center; }
.cu-v-l h2 { font-size:clamp(28px,3.6vw,42px); font-weight:900; margin:12px 0; line-height:1.15; }
.cu-v-l > p { font-size:17px; color:var(--soft); line-height:1.6; margin:0 0 20px; }
.cu-v-list { list-style:none; margin:0 0 24px; padding:0; display:grid; gap:14px; }
.cu-v-list li { display:flex; gap:14px; font-size:15px; line-height:1.5; color:var(--soft); }
.cu-v-list li > span { width:40px; height:40px; border-radius:13px; background:var(--sage); color:var(--g); display:flex; align-items:center; justify-content:center; flex:none; }
.cu-v-list b { display:block; color:var(--ink); font-size:15.5px; }
.cu-v-list a { color:var(--g); font-weight:700; text-decoration:none; }
.cu-map { border-radius:28px; overflow:hidden; border:1px solid var(--line); box-shadow:0 40px 70px -50px rgba(23,60,42,.7); background:#e6f3ea; position:relative; }
.cu-map::after { content:""; position:absolute; inset:0; border-radius:28px; box-shadow:inset 0 0 0 6px #fff; pointer-events:none; }
.cu-map iframe { display:block; width:100%; height:440px; border:0; }

/* emergency */
.cu-crisis { padding:0 0 64px; }
.cu-cr { display:flex; gap:14px; align-items:flex-start; background:#fff8ec; border:1px solid #f1dfb7; border-radius:20px; padding:18px 20px; }
.cu-cr-ic { width:42px; height:42px; border-radius:14px; background:#fbe7c3; color:#9a5b05; display:flex; align-items:center; justify-content:center; flex:none; }
.cu-cr p { margin:0; font-size:15px; line-height:1.6; color:#5b4310; }
.cu-cr a { color:#9a3412; font-weight:800; text-decoration:none; }

@media (max-width:1100px) { .cu-ch { grid-template-columns:repeat(2,minmax(0,1fr)); } .cu-rt { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (max-width:900px), (max-width:1100px) and (orientation:portrait) {
  .cu-hero-r { display:none; }
  .cu .eap-hero-l { padding-bottom:56px; }
  .cu-v { grid-template-columns:minmax(0,1fr); gap:28px; }
  .cu-map iframe { height:340px; }
}
@media (max-width:600px) {
  .cu .eap-hero { padding-top:32px; }
  .cu .eap-hero h1 { font-size:34px; }
  .cu .eap-lead { font-size:16px; }
  .cu .eap-ctas .eap-btn { flex:1 1 100%; }
  .cu-ch { grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
  .cu-ch-c { padding:14px; border-radius:18px; }
  .cu-ch-ic { width:40px; height:40px; border-radius:13px; margin-bottom:4px; }
  .cu-ch-c > b { font-size:15px; } .cu-ch-l { font-size:12.5px; } .cu-ch-c small { font-size:12px; }
  .cu-rt { grid-template-columns:minmax(0,1fr); gap:10px; }
  .cu-routes { padding-top:44px; }
  .cu .eap-f2 { grid-template-columns:minmax(0,1fr); }
  .cu-map iframe { height:300px; }
}
@media (prefers-reduced-motion: reduce) { .cu-chat, .cu-typing i { animation:none; } }
`;
