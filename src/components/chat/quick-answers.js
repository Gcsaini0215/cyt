import React, { useState } from "react";
import Link from "next/link";
import { PHONE } from "../global/lead-card";

/* Quick answers inside the Care Team chat (owner, 2026-11-24): the home page's bottom bar (Call us / Therapist @ Noida /
   Get matched) moved into the chat as one-tap questions. They're answered right away on this screen — no login,
   nothing sent to the team — with a button to the right page. Shown to visitors and signed-in clients alike. */

const QA = [
  {
    q: "📞 Can I talk to someone on the phone?",
    a: "Yes — call the CYT team on +91 80777 57951, every day 9 AM – 9 PM. Real people, not a bot.",
    cta: { label: "Call +91 80777 57951", href: `tel:${PHONE}`, ext: true },
  },
  {
    q: "📍 Do you have a therapist in Noida?",
    a: "Yes — you can meet a psychologist in person at our Noida centre in Sector 51. Pick a time on the Noida page.",
    cta: { label: "Book at the Noida centre", href: "/noida-appointment" },
  },
  {
    q: "🤝 Help me find the right therapist",
    a: "Happy to help. Tell us a little about what's going on and we'll match you with a therapist who fits.",
    cta: { label: "Get matched", event: "cyt:open-chat" },
  },
];

export default function QuickAnswers({ onCta }) {
  const [asked, setAsked] = useState([]); // indexes, in the order tapped
  const left = QA.map((_, i) => i).filter((i) => !asked.includes(i));
  return (
    <div className="qa">
      {asked.map((i) => (
        <React.Fragment key={i}>
          <div className="qa-row me"><p className="qa-bub">{QA[i].q.replace(/^\S+\s/, "")}</p></div>
          <div className="qa-row in">
            <div className="qa-bub">
              <p>{QA[i].a}</p>
              {QA[i].cta.event ? (
                <button type="button" className="qa-cta" onClick={() => { if (onCta) onCta(); setTimeout(() => window.dispatchEvent(new Event(QA[i].cta.event)), 60); }}>{QA[i].cta.label} ›</button>
              ) : QA[i].cta.ext ? (
                <a className="qa-cta" href={QA[i].cta.href}>{QA[i].cta.label} ›</a>
              ) : (
                <Link className="qa-cta" href={QA[i].cta.href} onClick={() => onCta && onCta()}>{QA[i].cta.label} ›</Link>
              )}
            </div>
          </div>
        </React.Fragment>
      ))}
      {left.length > 0 && (
        <div className="qa-chips" role="list" aria-label="Quick answers">
          {left.map((i) => <button type="button" role="listitem" key={i} onClick={() => setAsked((a) => [...a, i])}>{QA[i].q}</button>)}
        </div>
      )}
    </div>
  );
}

export const QA_CSS = `
.qa { display: flex; flex-direction: column; gap: 6px; margin: 0 0 8px; }
.qa-row { display: flex; } .qa-row.me { justify-content: flex-end; }
.qa .qa-bub { margin: 0; max-width: 82%; padding: 8px 12px; border-radius: 18px; font-size: 14.5px; line-height: 1.38; }
.qa-row.me .qa-bub { background: #34c759; color: #fff; }
.qa-row.in .qa-bub { background: #e9e9eb; color: #000; }
.qa .qa-bub p { margin: 0; }
.qa .qa-cta { display: inline-flex; align-items: center; margin-top: 8px; height: 32px; padding: 0 12px; border: 0; border-radius: 999px; background: #fff; color: #0a84ff !important;
  font: inherit; font-size: 13.5px; font-weight: 700; text-decoration: none !important; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.qa-chips { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.qa .qa-chips button { max-width: 92%; border: 1px solid #cfe0f7; background: #f4f8ff; color: #1d4ed8; border-radius: 18px; padding: 8px 12px; font: inherit; font-size: 13.5px; font-weight: 600; text-align: right; cursor: pointer; line-height: 1.3; }
.qa .qa-chips button:hover { background: #e9f1ff; }
`;
