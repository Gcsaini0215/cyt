import Link from "next/link";
import FAQ from "../home/faq";
import { HelpCircle } from "lucide-react";

// Platform/company questions — distinct from the general therapy FAQs on
// /faqs, so this doesn't duplicate that page's content. Keep this array in
// sync with aboutFaqSchema in pages/about-us.js (same Q&A, word for word).
export const aboutFaqData = [
  {
    q: "Is Choose Your Therapist a registered, licensed organization?",
    a: "Yes. Choose Your Therapist is registered under the MCA (Ministry of Corporate Affairs) and MSME, and operates as Choose Your Therapist LLP. Every psychologist on our platform is independently verified before they're allowed to see a client."
  },
  {
    q: "How does CYT verify its therapists?",
    a: "Each therapist is screened for their educational qualifications, professional license, and clinical experience before being onboarded. We review credentials directly rather than relying on self-reported information."
  },
  {
    q: "Are my sessions and personal information confidential?",
    a: "Yes, completely. What you share with your therapist stays between you and them. We do not share session content, and your identity is never disclosed without your consent."
  },
  {
    q: "Can I choose between online and in-person therapy?",
    a: "Yes. Sessions are available online by video or audio call from anywhere, or in person at our clinical spaces in Noida and Delhi NCR — you can pick whichever format works best for you."
  },
  {
    q: "Does CYT offer support for people who can't afford paid sessions?",
    a: "Yes. Alongside our regular services, we run a pro bono counselling initiative for individuals who cannot afford paid therapy, so cost is never the reason someone goes without support."
  },
  {
    q: "How can I intern or work with CYT?",
    a: "We run a structured internship and supervision track for psychology students, alongside opportunities in research, content, and outreach. You can apply through our internship registration page."
  },
];

export default function AboutFaqs() {
  return (
    <div style={{ backgroundColor: '#fff', padding: '90px 0' }}>
      <div className="container">
        <div className="row justify-content-center" style={{ marginBottom: '48px' }}>
          <div className="col-lg-7 text-center">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'rgba(34, 135, 86, 0.1)', color: '#228756',
              padding: '8px 20px', borderRadius: '100px',
              fontSize: '14px', fontWeight: 700, marginBottom: '20px'
            }}>
              <HelpCircle size={18} />
              Frequently Asked Questions
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, color: '#1e293b' }}>
              Questions About Choose Your Therapist
            </h2>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-9">
            {aboutFaqData.map((item, index) => (
              <FAQ key={index} q={item.q} a={item.a} defaultOpen hideIcon />
            ))}
            <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: '#64748b' }}>
              Have a question about therapy itself?{' '}
              <Link href="/faqs" style={{ color: '#228756', fontWeight: 700 }}>
                See our full FAQ &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
