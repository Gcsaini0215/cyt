import { useState } from "react";
import { Check, Clock, PhoneCall, FileText } from "lucide-react";
import { postData } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";

const INDUSTRIES = [
  "IT / Software",
  "BFSI (Banking, Finance, Insurance)",
  "Consulting & Professional Services",
  "Manufacturing",
  "Healthcare & Pharma",
  "Retail & E-commerce",
  "Education & EdTech",
  "Media & Marketing",
  "Startup",
  "Other",
];

const TEAM_SIZES = ["1-50", "51-200", "201-500", "501-1,000", "1,000-5,000", "5,000+"];

const WORK_MODELS = ["Office", "Hybrid", "Remote"];

const SERVICES = [
  "1:1 Employee Counselling (EAP)",
  "Stress & Burnout Workshops",
  "Manager & Leadership Training",
  "On-site Counselling Days",
  "Psychometric Assessments",
  "Critical Incident Support",
];

const TIMELINES = ["Immediately", "Within 1 month", "1-3 months", "Just exploring"];

const EMPTY = {
  name: "", designation: "", email: "", phone: "", company: "", industry: "",
  teamSize: "", city: "", workModel: "", services: [], timeline: "", message: "",
};

const NEXT_STEPS = [
  { icon: Clock, title: "Reply within 24 hours", desc: "Our corporate team reviews your enquiry the same working day." },
  { icon: PhoneCall, title: "20-minute discovery call", desc: "We understand your workforce, locations, and goals." },
  { icon: FileText, title: "Tailored proposal & quote", desc: "A program and pricing built around your headcount." },
];

export default function DemoForm() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const set = (name, value) => setForm((p) => ({ ...p, [name]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);
  const toggleService = (s) =>
    setForm((p) => ({ ...p, services: p.services.includes(s) ? p.services.filter((x) => x !== s) : [...p.services, s] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.name.trim() || !form.designation.trim() || !form.email.trim() || !form.company.trim() || !form.teamSize) {
      return setError("Please fill all required fields.");
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Please enter a valid work email.");
    if (!/^[0-9]{10}$/.test(form.phone)) return setError("Please enter a valid 10-digit phone number.");

    const services = form.services.join(", ");
    const summary = [
      `Company: ${form.company}`,
      `Designation: ${form.designation}`,
      `Industry: ${form.industry || "Not specified"}`,
      `Employees: ${form.teamSize}`,
      `City / Locations: ${form.city || "Not specified"}`,
      `Work model: ${form.workModel || "Not specified"}`,
      `Services needed: ${services || "Not specified"}`,
      `Start timeline: ${form.timeline || "Not specified"}`,
      form.message.trim() ? `\nRequirements: ${form.message.trim()}` : "",
    ].filter(Boolean).join("\n");

    try {
      setLoading(true);
      await postData(SubmitConsultationUrl, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        location: form.city.trim(),
        concern: `Corporate enquiry — ${form.company} (${form.teamSize} employees)`,
        message: summary,
        source: "Corporate Page",
        company: form.company.trim(),
        designation: form.designation.trim(),
        industry: form.industry,
        teamSize: form.teamSize,
        workModel: form.workModel,
        services,
        timeline: form.timeline,
      });
      setSuccess("Thank you! Our corporate team will reach out within 24 hours with next steps.");
      setForm(EMPTY);
    } catch {
      setError("Something went wrong. Please try again or WhatsApp us directly.");
    }
    setLoading(false);
  };

  return (
    <section id="request-demo" className="corp-enq" aria-labelledby="corp-enq-title">
      <div className="container">
        <div className="row justify-content-center g-5">
          <div className="col-lg-5">
            <div className="corp-enq-intro">
              <span className="corp-enq-kicker">Corporate Enquiry</span>
              <h2 id="corp-enq-title">Get a Corporate Wellness Proposal for Your Company</h2>
              <p>
                Tell us about your workforce and what you need. We'll design an employee mental health
                program — counselling, workshops, and manager support — with pricing for your headcount.
              </p>

              <ol className="corp-enq-steps">
                {NEXT_STEPS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={i}>
                      <span className="corp-enq-step-icon"><Icon size={18} /></span>
                      <div>
                        <strong>{s.title}</strong>
                        <small>{s.desc}</small>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="corp-enq-contact">
                <span>Prefer to talk now?</span>
                <a href="https://wa.me/918077757951" target="_blank" rel="noreferrer" className="wa">WhatsApp Us</a>
                <a href="tel:+918077757951">+91-807-775-7951</a>
                <a href="mailto:chooseyourtherapist@gmail.com" className="mail">chooseyourtherapist@gmail.com</a>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="corp-enq-card">
              <div className="corp-enq-bar" />
              <div className="corp-enq-body">
                <h3>Corporate Enquiry Form</h3>
                <p className="corp-enq-note">Fields marked * are required · We reply within 24 hours</p>

                {success && <div className="corp-enq-alert ok" role="status">{success}</div>}
                {error && <div className="corp-enq-alert err" role="alert">{error}</div>}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="ce-name">Full Name *</label>
                      <input id="ce-name" name="name" type="text" autoComplete="name" placeholder="Your full name" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="ce-designation">Designation *</label>
                      <input id="ce-designation" name="designation" type="text" autoComplete="organization-title" placeholder="e.g. HR Manager, CHRO, Founder" value={form.designation} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="ce-email">Work Email *</label>
                      <input id="ce-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="ce-phone">Phone Number *</label>
                      <input id="ce-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" value={form.phone}
                        onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="ce-company">Company Name *</label>
                      <input id="ce-company" name="company" type="text" autoComplete="organization" placeholder="Your company name" value={form.company} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="ce-industry">Industry</label>
                      <select id="ce-industry" name="industry" value={form.industry} onChange={handleChange}>
                        <option value="">Select industry</option>
                        {INDUSTRIES.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="ce-size">Number of Employees *</label>
                      <select id="ce-size" name="teamSize" value={form.teamSize} onChange={handleChange}>
                        <option value="">Select team size</option>
                        {TEAM_SIZES.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="ce-city">Office City / Locations</label>
                      <input id="ce-city" name="city" type="text" placeholder="e.g. Noida, Gurugram, Bengaluru" value={form.city} onChange={handleChange} />
                    </div>

                    <div className="col-12">
                      <span className="corp-enq-label">Work Model</span>
                      <div className="corp-enq-chips" role="radiogroup" aria-label="Work model">
                        {WORK_MODELS.map((o) => (
                          <button type="button" key={o} role="radio" aria-checked={form.workModel === o}
                            className={form.workModel === o ? "on" : ""}
                            onClick={() => set("workModel", form.workModel === o ? "" : o)}>
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-12">
                      <span className="corp-enq-label">Services You're Interested In</span>
                      <div className="corp-enq-chips" role="group" aria-label="Services you're interested in">
                        {SERVICES.map((o) => {
                          const on = form.services.includes(o);
                          return (
                            <button type="button" key={o} aria-pressed={on} className={on ? "on" : ""} onClick={() => toggleService(o)}>
                              {on && <Check size={14} />} {o}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-12">
                      <span className="corp-enq-label">When Do You Want to Start?</span>
                      <div className="corp-enq-chips" role="radiogroup" aria-label="Start timeline">
                        {TIMELINES.map((o) => (
                          <button type="button" key={o} role="radio" aria-checked={form.timeline === o}
                            className={form.timeline === o ? "on" : ""}
                            onClick={() => set("timeline", form.timeline === o ? "" : o)}>
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="ce-message">Tell Us About Your Requirements</label>
                      <textarea id="ce-message" name="message" rows={3} placeholder="Goals, challenges your teams face, budget range, anything else..." value={form.message} onChange={handleChange} />
                    </div>

                    <div className="col-12">
                      <button type="submit" disabled={loading} className="rbt-btn btn-gradient radius-round w-100"
                        style={{ minHeight: '52px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Sending..." : "Submit Enquiry"}
                      </button>
                      <p className="corp-enq-privacy">Your details are used only to respond to this enquiry.</p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .corp-enq { background: #f8fafc; padding: 90px 0; scroll-margin-top: 140px; }
        .corp-enq-intro { position: sticky; top: 150px; }
        .corp-enq-kicker {
          display: inline-block; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
          color: #228756; background: rgba(34,135,86,0.1); padding: 6px 14px; border-radius: 100px; margin-bottom: 16px;
        }
        .corp-enq-intro h2 { font-size: clamp(26px, 3.6vw, 36px); font-weight: 900; color: #1e293b; margin-bottom: 16px; line-height: 1.2; }
        .corp-enq-intro > p { color: #64748b; font-size: 16px; line-height: 1.7; margin-bottom: 28px; }
        .corp-enq-steps { list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 16px; }
        .corp-enq-steps li { display: flex; gap: 14px; align-items: flex-start; margin: 0; }
        .corp-enq-steps strong { display: block; font-size: 15px; font-weight: 800; color: #1e293b; }
        .corp-enq-steps small { display: block; font-size: 13.5px; color: #64748b; line-height: 1.5; }
        .corp-enq-step-icon {
          flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; background: #fff; color: #228756;
          border: 1px solid #dcfce7; display: flex; align-items: center; justify-content: center;
        }
        .corp-enq-contact { display: flex; flex-direction: column; gap: 8px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .corp-enq-contact span { font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; }
        .corp-enq-contact a { font-size: 14px; color: #228756; font-weight: 700; text-decoration: none; }
        .corp-enq-contact a.wa { color: #16a34a; }
        .corp-enq-contact a.mail { color: #64748b; font-weight: 600; }
        .corp-enq-card { background: #fff; border-radius: 18px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; overflow: hidden; }
        .corp-enq-bar { height: 4px; background: linear-gradient(90deg, #228756, #4ade80); }
        .corp-enq-body { padding: 32px 34px 34px; }
        .corp-enq-body h3 { font-weight: 800; font-size: 22px; margin-bottom: 4px; color: #1e293b; }
        .corp-enq-note { font-size: 13px; color: #64748b; margin: 0 0 20px; }
        .corp-enq-alert { border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; font-size: 13.5px; font-weight: 600; }
        .corp-enq-alert.ok { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
        .corp-enq-alert.err { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
        .corp-enq label, .corp-enq-label {
          font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .5px;
          margin-bottom: 6px; display: block;
        }
        .corp-enq input, .corp-enq select, .corp-enq textarea {
          width: 100%; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px;
          padding: 0 14px; font-size: 14px; box-sizing: border-box; outline: none; display: block;
          transition: border-color .2s; color: #1e293b;
        }
        .corp-enq input, .corp-enq select { height: 46px; line-height: normal; }
        .corp-enq textarea { padding: 11px 14px; resize: vertical; min-height: 90px; }
        .corp-enq input:focus, .corp-enq select:focus, .corp-enq textarea:focus { border-color: #228756; }
        .corp-enq-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .corp-enq-chips button {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 100px; border: 1.5px solid #e2e8f0; background: #fff;
          font-size: 13px; font-weight: 600; color: #334155; cursor: pointer; transition: all .15s ease;
        }
        .corp-enq-chips button:hover { border-color: #86efac; }
        .corp-enq-chips button.on { border-color: #228756; background: #f0fdf4; color: #166534; }
        .corp-enq-privacy { font-size: 12px; color: #94a3b8; text-align: center; margin: 10px 0 0; }
        @media (max-width: 991.98px) { .corp-enq-intro { position: static; } }
        @media (max-width: 575.98px) { .corp-enq { padding: 64px 0; } .corp-enq-body { padding: 24px 20px 26px; } }
      ` }} />
    </section>
  );
}
