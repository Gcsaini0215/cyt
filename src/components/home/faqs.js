import React, { useState } from "react";
import { Brain, Heart, Users, BookOpen, Shield, IndianRupee, Plus, MessageCircle } from "lucide-react";

const faqCategories = [
  {
    icon: Brain,
    label: "About Therapy",
    color: "#228756",
    bg: "#f0fdf4",
    faqs: [
      {
        q: "What is therapy and how does it actually help?",
        a: "Therapy is a professional conversation with a trained psychologist where you talk openly about your thoughts, feelings, and challenges in a safe, non-judgmental space. It helps by giving you tools to understand why you feel the way you do, break unhelpful patterns, and build healthier responses to life's difficulties. Unlike venting to a friend, therapy is structured — your psychologist uses evidence-based techniques tailored specifically to your situation. Research shows therapy is as effective as medication for conditions like anxiety and depression, with longer-lasting results."
      },
      {
        q: "When is it necessary to see a therapist — and when do things resolve on their own?",
        a: "If a problem has lasted more than 2-3 weeks, is interfering with your daily routine, is affecting your sleep or appetite, or you're feeling persistently alone — it's the right time to see a psychologist. Smaller stressors, like pre-exam nerves, usually resolve on their own. But if you're dealing with overthinking, panic attacks, constant sadness, or the same relationship problem resurfacing again and again — seeking professional help is a sign of self-awareness, not weakness."
      },
      {
        q: "What is the difference between a Counselling Psychologist and a Clinical Psychologist?",
        a: "A Counselling Psychologist helps with everyday emotional challenges — relationship problems, stress, anxiety, self-esteem, career confusion, and life transitions. They use talk therapy approaches like CBT, person-centred therapy, and solution-focused therapy. A Clinical Psychologist is trained to assess and treat more complex mental health conditions such as severe depression, OCD, PTSD, bipolar disorder, schizophrenia, eating disorders, and personality disorders. They also conduct psychometric assessments (IQ tests, ADHD diagnosis, autism evaluations). Both are verified mental health professionals — the difference is in the complexity of conditions they treat."
      },
      {
        q: "Does talking to a psychologist actually work or is it just 'timepass'?",
        a: "Therapy has decades of scientific research behind it. Cognitive Behavioural Therapy (CBT) is as effective as antidepressants for depression and more effective in preventing relapse. Exposure and Response Prevention (ERP) is the most effective treatment for OCD, with 60–80% of patients showing significant improvement. Multiple studies published in journals like The Lancet confirm that therapy produces measurable, lasting changes in brain activity. At Choose Your Therapist, every psychologist uses evidence-based methods — not just supportive conversation — so you can expect real, trackable progress."
      },
      {
        q: "Is therapy only for people who are 'mentally unstable'?",
        a: "Absolutely not. This is one of the biggest misconceptions about mental health in India. Therapy is for anyone who wants to improve their life. Some of the world's most successful people — athletes, CEOs, actors — see therapists regularly for performance and mental clarity. Anxiety, relationship issues, self-doubt, career confusion, and parenting stress are all common human experiences. Going to therapy is as normal as visiting a doctor or going to the gym. It's a sign of strength and self-awareness, not weakness."
      },
      {
        q: "How many therapy sessions will I need?",
        a: "It depends on your goals and the nature of your concern. For mild stress or situational anxiety, 6–8 sessions are often enough to feel significantly better. For moderate depression or relationship issues, 12–20 sessions are typically recommended. For complex trauma, OCD, or long-standing personality patterns, therapy may continue for 6 months to a year. Your psychologist will discuss a treatment plan in the first session and adjust based on your progress. Many people continue therapy even after feeling better — as a tool for personal growth and resilience."
      }
    ]
  },
  {
    icon: Heart,
    label: "Mental Health Conditions",
    color: "#dc2626",
    bg: "#fff5f5",
    faqs: [
      {
        q: "What is the difference between anxiety and normal tension?",
        a: "Normal tension arises from a specific situation — like before an exam or on interview day — and fades once that situation is over. An anxiety disorder is when fear or worry persists without a clear reason, lasts for weeks, and interferes with daily life. Symptoms include recurring negative thoughts, chest pain or a racing heart, difficulty sleeping, avoiding certain places, or overreacting to small triggers. If you recognise these symptoms, seeing a counselling psychologist can be very helpful."
      },
      {
        q: "Am I depressed or just sad — how do I tell the difference?",
        a: "Sadness is a natural emotion — it follows something upsetting and passes within a few days. Depression is a clinical condition where, for two weeks or longer: mood stays low, you lose interest in things you used to enjoy, energy is completely drained, sleep is either excessive or absent, appetite disappears, you feel worthless or guilty, and sometimes thoughts of ending your life appear. If five or more of these symptoms have lasted more than two weeks, it may be depression, and seeing a clinical psychologist is important."
      },
      {
        q: "What is OCD and how is it treated?",
        a: "OCD involves two components — obsessions (unwanted, intrusive thoughts that recur, like 'I didn't lock the door,' 'my hands are contaminated,' or fear that something bad will happen) and compulsions (repeated actions performed to reduce anxiety, like excessive handwashing, counting, or checking the door multiple times). The gold-standard treatment for OCD is Exposure and Response Prevention (ERP), where a trained clinical psychologist gradually exposes you to obsessive triggers without performing the compulsion. 60–80% of patients show significant improvement."
      },
      {
        q: "Trauma and PTSD — when does normal grief end and treatment become necessary?",
        a: "Some distress after any traumatic event is normal for a few weeks. PTSD is diagnosed when, even a month later, you still experience: flashbacks or nightmares, fear of triggers, emotional numbness, hypervigilance (constantly feeling on edge), or ongoing avoidance of thinking about the event. For complex trauma (childhood abuse, domestic violence, repeated traumatic events), Trauma-Focused CBT or EMDR (Eye Movement Desensitisation and Reprocessing) are the evidence-based treatments. These therapies can only be delivered by trained clinical psychologists."
      },
      {
        q: "Do I need medication for anxiety or depression, or is therapy enough?",
        a: "For mild to moderate anxiety and depression, therapy alone — especially CBT — is as effective as medication, and produces more lasting results. In severe cases, a psychiatrist may recommend medication that works even better alongside therapy. Choose Your Therapist has verified psychologists who provide therapy, and if you also need medication, we can help refer you to a psychiatrist. Medication alone isn't a long-term solution without psychological support — therapy teaches you how to cope on your own going forward."
      }
    ]
  },
  {
    icon: Users,
    label: "Relationships & Family",
    color: "#7c3aed",
    bg: "#faf5ff",
    faqs: [
      {
        q: "When should couples go to therapy — is it only for when a marriage is on the verge of divorce?",
        a: "No — couples therapy isn't only for crises; it also works as a preventive tool. If you're facing communication problems, having the same argument repeatedly, experiencing reduced physical or emotional intimacy, dealing with an affair, or simply feel like you and your partner don't understand each other — these are all valid reasons for couples therapy. The sooner you start, the better. Research shows the average couple waits 6 years into their problems before seeking therapy — by which point significant damage has already been done."
      },
      {
        q: "My partner isn't ready for therapy — can I go alone?",
        a: "Absolutely. In individual therapy, you can work on your own relationship patterns, responses, and needs — whether or not your partner joins. Often, one partner going to therapy naturally shifts the relationship dynamics. Sometimes one person's change creates space for the other to heal too. If you want clarity on whether to stay in the relationship, or want to better understand your own emotional needs, individual counselling is extremely helpful."
      },
      {
        q: "When does a child need to see a psychologist?",
        a: "Watch for these signs in children: a sudden drop in school performance, withdrawing from friends, frequent anger or crying, sleep problems, loss of appetite, refusing to go to school, or a major life change like parents separating, moving homes, or bullying. Special educational needs (ADHD, learning disabilities, autism) require a psychometric assessment. Choose Your Therapist has child psychologists and special educators who use age-appropriate techniques — play therapy, art therapy, and behavioural interventions."
      },
      {
        q: "Does everyone need to attend family therapy together?",
        a: "Ideally, yes — the family members involved attend together (parents and children, siblings, or joint family members). But it's flexible — some sessions can start individually before becoming combined. The goal of family therapy isn't to 'fix' one person, but to understand the family's patterns, communication, and dynamics as a whole. Choose Your Therapist has therapists trained in family systems approaches."
      }
    ]
  },
  {
    icon: BookOpen,
    label: "Booking & Process",
    color: "#0369a1",
    bg: "#f0f9ff",
    faqs: [
      {
        q: "What happens in the first session — will I have to share everything?",
        a: "No — the first session is an introduction, not a confession. The psychologist will understand your background, what brought you in, and what you expect from therapy. Share only as much as you're comfortable with — there's no pressure. The first session also covers your treatment plan — how many sessions you'll likely need, which techniques will be used, and how progress will be tracked. Later sessions gradually go deeper, at your own pace."
      },
      {
        q: "Online therapy vs in-person therapy — which is better?",
        a: "Research shows online therapy is just as effective as in-person therapy for most conditions — anxiety, depression, stress, relationship issues, and grief. Benefits of online therapy: attend from home, no travel, flexible scheduling, and greater privacy since no one sees you at a clinic. In-person therapy may be better if non-verbal cues matter to your treatment, you have a severe mental health condition, or you simply prefer being physically present with someone. Choose Your Therapist offers both options."
      },
      {
        q: "How do I choose the right therapist among so many profiles?",
        a: "Look at three things: (1) Specialization — do they have experience with your specific concern? Check the 'service expertise' section on their profile. (2) Credentials — are they a Counselling Psychologist or Clinical Psychologist, and what's their degree and experience? (3) Reviews — what have past clients written? The therapeutic alliance in the first session matters most — if it doesn't feel right, try another psychologist. Switching is completely normal. Finding the right fit matters more than a therapist's name or fees — what matters is feeling comfortable with them."
      },
      {
        q: "What if I don't feel good after the first session?",
        a: "Be honest with your psychologist about it — a good therapist welcomes feedback. If the first session doesn't feel right, you can try a different therapist. This is completely acceptable at Choose Your Therapist. Sometimes rapport builds after 2-3 sessions, but if you still don't feel comfortable or see any improvement after 3 sessions, switching is the right call."
      }
    ]
  },
  {
    icon: IndianRupee,
    label: "Cost & Confidentiality",
    color: "#b45309",
    bg: "#fffbeb",
    faqs: [
      {
        q: "How expensive is therapy — can I afford it?",
        a: "At Choose Your Therapist, sessions start at ₹500 and go up to ₹3000 per session, depending on the therapist's experience and specialization. Affordable options are available for students and young professionals. Online sessions are generally cheaper than in-person ones, and subscription plans are available for regular therapy. Compare the cost of one session to a restaurant meal or entertainment expense — investing in mental health delivers a far greater return over the long term."
      },
      {
        q: "Is what I tell my therapist kept confidential?",
        a: "Yes — 100%. A therapist's ethical code requires that everything you share in session stays strictly confidential. Choose Your Therapist follows international data protection standards. Confidentiality is broken only in three situations: (1) if you disclose intent to seriously harm yourself or someone else, (2) a court order requires it, or (3) it involves a case of minor abuse. Everything else — relationships, personal secrets, workplace issues, family problems — stays completely between you and your therapist."
      },
      {
        q: "Does insurance cover therapy in India?",
        a: "Mental health insurance coverage in India is still limited, but growing. Since the Mental Healthcare Act of 2017, insurance companies are required to cover mental health conditions, and some policies cover outpatient therapy. Ask your insurer specifically about 'psychological counselling' or 'psychotherapy' coverage. Choose Your Therapist provides invoices and receipts that can be used for insurance claims. If you don't have insurance, check out our affordable plans."
      },
      {
        q: "Are sessions recorded — is any video saved?",
        a: "No. Online sessions are never recorded — no audio, no video. This is part of psychologists' ethical guidelines and Choose Your Therapist's privacy policy. Therapists keep session notes in their own clinical records, which remain strictly confidential and are never shared with anyone. You also cannot record a session yourself without the therapist's consent — this protects the safety of the therapeutic relationship."
      }
    ]
  },
  {
    icon: Shield,
    label: "About Our Psychologists",
    color: "#065f46",
    bg: "#f0fdf4",
    faqs: [
      {
        q: "Your psychologists are verified — what does that mean?",
        a: "Every psychologist on Choose Your Therapist goes through a verification process: (1) Degree verification — proof of MA/MSc Psychology or MPhil Clinical Psychology. (2) Registration — Clinical Psychologists and Special Educators have their RCI (Rehabilitation Council of India) registration checked. (3) Experience verification — internship and practice history. (4) Reference checks. We do not allow any unverified or untrained person on the platform. You can view each therapist's qualifications and experience on their profile."
      },
      {
        q: "What is RCI registration and why does it matter?",
        a: "RCI (Rehabilitation Council of India) is a government body that registers and regulates Clinical Psychologists and Special Educators in India. RCI registration means the psychologist has completed an MPhil in Clinical Psychology or equivalent from a recognised university, completed supervised clinical hours, and follows professional standards. Without RCI registration, no one can legally use the title 'Clinical Psychologist' or 'Special Educator.' Every relevant professional on Choose Your Therapist has verified RCI registration."
      },
      {
        q: "Can I change my therapist?",
        a: "Absolutely. Finding the right therapist is a process, and not matching with the first or second one is completely normal. If you feel uncomfortable with your current therapist, aren't seeing progress, or want to try a different approach, you can switch to another therapist without any explanation needed. Choose Your Therapist's goal is to help you find the right fit — we're here to help with that."
      }
    ]
  }
];

// same event the "Chat with CYT" lead form listens for (components/global/booking-popup.js)
const OPEN_CHAT_EVENT = "cyt:open-chat";

/* Home FAQ. Desktop: topics down the left (with a "still have a question?" nudge), answers on
   the right. iPad / phones: topics as one swipeable row above the answers.
   Answers stay in the page when closed (only collapsed), so search engines still read them. */
export default function Faqs() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(0); // first question of a topic starts open
  const category = faqCategories[active];
  const pick = (i) => { setActive(i); setOpen(0); };

  return (
    <section className="hfq" aria-labelledby="hfq-title">
      <div className="container">
        <div className="hfq-head">
          <span className="hfq-bar" aria-hidden="true" />
          <h2 id="hfq-title" className="hfq-title">Everything you want to know <span>about therapy</span></h2>
          <p className="hfq-sub">Real answers to the questions most people are too hesitant to ask — about therapy, psychologists, costs and what actually happens in a session.</p>
        </div>

        <div className="hfq-wrap">
          <aside className="hfq-side">
            <div className="hfq-tabs" role="tablist" aria-label="FAQ topics">
              {faqCategories.map((cat, i) => {
                const Icon = cat.icon;
                const on = i === active;
                return (
                  <button key={cat.label} type="button" role="tab" aria-selected={on} className={`hfq-tab${on ? " on" : ""}`} onClick={() => pick(i)}>
                    <span className="hfq-ico" style={on ? undefined : { color: cat.color, background: cat.bg }}><Icon size={16} /></span>
                    <span className="hfq-tab-l">{cat.label}</span>
                    <span className="hfq-n">{cat.faqs.length}</span>
                  </button>
                );
              })}
            </div>
            <div className="hfq-help">
              <b>Still have a question?</b>
              <span>Our team replies on WhatsApp — usually within minutes.</span>
              <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}>
                <MessageCircle size={16} /> Ask us
              </button>
            </div>
          </aside>

          <div className="hfq-list" role="tabpanel" aria-label={category.label}>
            {category.faqs.map((item, i) => {
              const isOpen = open === i;
              const id = `hfq-${active}-${i}`;
              return (
                <div key={id} className={`hfq-item${isOpen ? " open" : ""}`}>
                  <button type="button" className="hfq-q" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span className="hfq-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="hfq-q-t">{item.q}</span>
                    <span className="hfq-plus" aria-hidden="true"><Plus size={16} /></span>
                  </button>
                  <div id={id} className="hfq-a" role="region">
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </section>
  );
}

const CSS = `
.hfq { background: #fff; padding: 64px 0 72px; }
.hfq-head { margin-bottom: 26px; max-width: 760px; }
.hfq-bar { display: block; width: 42px; height: 4px; border-radius: 2px; background: #d4a24c; margin-bottom: 12px; }
.hfq .hfq-title { font-size: clamp(24px, 3vw, 34px); font-weight: 800; color: #0b1712; margin: 0 0 6px; line-height: 1.2; }
.hfq-title span { color: #a86e0e; }
.hfq .hfq-sub { color: #64748b; font-size: 15px; line-height: 1.6; margin: 0; padding: 0; }

.hfq-wrap { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 28px; align-items: start; }
.hfq-side { position: sticky; top: 110px; display: flex; flex-direction: column; gap: 14px; }
.hfq-tabs { display: flex; flex-direction: column; gap: 6px; }
.hfq-tab { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border-radius: 12px; border: 1px solid transparent; background: transparent; text-align: left; cursor: pointer; color: #26463a; font-size: 14.5px; font-weight: 700; transition: background .15s, border-color .15s; }
.hfq-tab:hover { background: #f4f8f5; }
.hfq-tab.on { background: #14532d; color: #fff; }
.hfq-ico { flex-shrink: 0; width: 32px; height: 32px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; }
.hfq-tab.on .hfq-ico { background: rgba(255,255,255,.16); color: #ecc77d; }
.hfq-tab-l { flex: 1; min-width: 0; }
.hfq-n { flex-shrink: 0; min-width: 24px; height: 22px; padding: 0 7px; border-radius: 999px; background: #eef4f0; color: #4b5d53; font-size: 11.5px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; }
.hfq-tab.on .hfq-n { background: #ecc77d; color: #14532d; }
.hfq-help { display: flex; flex-direction: column; gap: 6px; padding: 16px; border-radius: 16px; background: linear-gradient(135deg, #f1f8f3, #fbf4e3); border: 1px solid #e8e1cc; }
.hfq-help b { font-size: 15px; color: #13261c; }
.hfq-help span { font-size: 13px; line-height: 1.5; color: #5b6560; }
.hfq-help button { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; height: 38px; padding: 0 16px; border-radius: 10px; border: none; background: #1e7a4c; color: #fff; font-size: 13.5px; font-weight: 800; cursor: pointer; }
.hfq-help button:hover { background: #186640; }

.hfq-list { display: flex; flex-direction: column; gap: 10px; }
.hfq-item { background: #fff; border: 1px solid #e6ece8; border-radius: 14px; transition: border-color .2s, box-shadow .2s; }
.hfq-item.open { border-color: #cfe3d6; box-shadow: 0 14px 30px -24px rgba(20,83,45,.55); }
.hfq-q { display: flex; align-items: center; gap: 12px; width: 100%; padding: 15px 16px; border: none; background: transparent; text-align: left; cursor: pointer; }
.hfq-num { flex-shrink: 0; font-size: 12px; font-weight: 800; color: #a86e0e; min-width: 20px; }
.hfq-q-t { flex: 1; min-width: 0; font-size: 15.5px; font-weight: 700; line-height: 1.4; color: #13261c; }
.hfq-plus { flex-shrink: 0; width: 30px; height: 30px; border-radius: 50%; background: #eef6f1; color: #1e7a4c; display: inline-flex; align-items: center; justify-content: center; transition: transform .25s ease, background .2s; }
.hfq-item.open .hfq-plus { transform: rotate(45deg); background: #1e7a4c; color: #fff; }
.hfq-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s ease; }
.hfq-item.open .hfq-a { grid-template-rows: 1fr; }
.hfq-a > p { overflow: hidden; margin: 0; padding: 0 16px 0 48px; font-size: 14.5px; line-height: 1.7; color: #475569; }
.hfq-item.open .hfq-a > p { padding-bottom: 16px; }

/* iPad + phones: topics as one swipeable row above the answers */
@media (max-width: 1023px) {
  .hfq { padding: 48px 0 56px; }
  .hfq-wrap { grid-template-columns: 1fr; gap: 16px; }
  .hfq-side { position: static; }
  .hfq-tabs { flex-direction: row; overflow-x: auto; margin: 0 -40px; padding: 2px 40px 4px; scrollbar-width: none; }
  .hfq-tabs::-webkit-scrollbar { display: none; }
  .hfq-tab { width: auto; flex-shrink: 0; padding: 8px 12px 8px 8px; border: 1px solid #e3ebe6; background: #fff; white-space: nowrap; border-radius: 999px; font-size: 13.5px; }
  .hfq-ico { width: 26px; height: 26px; border-radius: 50%; }
  .hfq-n { display: none; }
  .hfq-help { order: 2; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 4px 12px; }
  .hfq-help span { flex: 1 1 200px; }
  .hfq-wrap > .hfq-list { order: 1; }
  .hfq-side { display: contents; }
  .hfq-tabs { order: 0; }
}
@media (max-width: 600px) {
  .hfq-tabs { margin: 0 -16px; padding: 2px 16px 4px; }
  .hfq-q { padding: 13px 12px; gap: 10px; }
  .hfq-q-t { font-size: 14.5px; }
  .hfq-a > p { padding: 0 12px 0 42px; font-size: 14px; }
  .hfq-help { flex-direction: column; align-items: flex-start; }
  .hfq-help span { flex: none; }
}
@media (prefers-reduced-motion: reduce) { .hfq-a, .hfq-plus { transition: none; } }
`;
