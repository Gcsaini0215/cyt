import FAQ from "./faq";
import { HelpCircle } from "lucide-react";

export default function Faqs() {
  const faqData = [
    {
      q: "What services does Choose Your Therapist offer?",
      a: "We offer a range of mental health services including online counseling, relaxation sessions, peer support groups, school-based programs, corporate programs, and assessment tools."
    },
    {
      q: "What should I expect during my first therapy session?",
      a: "During your first session, your therapist will get to know you, discuss your concerns, and develop a plan tailored to your needs. It’s a safe space to share whatever you’re comfortable with."
    },
    {
      q: "Are the sessions confidential?",
      a: "Yes, all sessions are confidential. Your privacy is of utmost importance to us, and we adhere to strict confidentiality and data protection policies."
    },
    {
      q: "Can I change my therapist if I’m not comfortable?",
      a: "Absolutely. If you feel that your therapist is not the right fit for you, you can request to change therapists at any time."
    },
    {
      q: "Do you offer services for specific issues like anxiety or depression?",
      a: "Yes, our therapists are trained to handle a wide range of issues including anxiety, depression, stress, relationship problems, trauma, and more."
    },
    {
      q: "Are there any free resources available?",
      a: "We offer various free resources such as articles, self-help tools, and webinars to support your mental health journey."
    },
    {
        q: "How often should I attend therapy sessions?",
        a: "The frequency of therapy sessions depends on your individual needs and goals. Your therapist will work with you to determine the best schedule."
    }
  ];

  return (
    <div className="rbt-accordion-area bg-color-white rbt-section-gap" style={{ backgroundColor: '#f8fafc', padding: '100px 0' }}>
      <div className="container">
        <div className="row justify-content-center mb--60">
          <div className="col-lg-8 text-center">
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: 'rgba(34, 135, 86, 0.1)', 
                color: '#228756', 
                padding: '8px 20px', 
                borderRadius: '100px',
                fontSize: '14px',
                fontWeight: 700,
                marginBottom: '20px'
              }}
            >
              <HelpCircle size={18} />
              FAQ's
            </div>
            <h2 style={{ fontSize: '42px', fontWeight: 900, color: '#1e293b', marginBottom: '20px' }}>
              Common Questions & Answers
            </h2>
            <p style={{ color: '#64748b', fontSize: '18px' }}>
              Everything you need to know about our services and the therapy process.
            </p>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {faqData.map((item, index) => (
                <FAQ key={index} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
