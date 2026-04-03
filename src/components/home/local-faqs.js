import FAQ from "./faq";
import { HelpCircle } from "lucide-react";

export default function LocalFaqs() {
  const faqData = [
    {
      q: "Who is the best psychologist in Noida for anxiety and stress?",
      a: "Choose Your Therapist connects you with top-rated psychologists in Noida specializing in anxiety and stress management. Our experts at the Noida Studio provide personalized evidence-based therapy."
    },
    {
      q: "Do you offer in-person therapy sessions in Noida Sector 51?",
      a: "Yes, we offer professional in-person counseling at our Noida Studio located in Sector 51. You can book an appointment for a face-to-face session with our verified therapists."
    },
    {
      q: "How can I find a verified clinical psychologist in Delhi NCR?",
      a: "Our platform features a curated list of verified clinical psychologists across Delhi, Noida, and Gurgaon. You can review their profiles, specializations, and book sessions directly."
    },
    {
      q: "What is the cost of a therapy session in Noida & Delhi?",
      a: "Therapy costs vary based on the psychologist's experience and specialization. We offer transparent pricing with options for individual sessions, couple counseling, and student-friendly rates."
    },
    {
      q: "Are online therapy sessions as effective as in-person visits?",
      a: "Absolutely. Online therapy offers the same professional quality and confidentiality as in-person visits, with the added convenience of attending from your home in Delhi, Noida, or anywhere in India."
    },
    {
        q: "How do I book a session with a psychologist in Uttar Pradesh?",
        a: "You can easily browse our list of experts in Uttar Pradesh and Delhi, select a therapist that matches your needs, and schedule your session online or visit our Noida center."
    }
  ];

  return (
    <div className="rbt-accordion-area bg-color-white rbt-section-gap" style={{ backgroundColor: '#f8fafc', padding: '60px 0 100px' }}>
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
              Common Questions
            </div>
            <h3 style={{ fontSize: '42px', fontWeight: 900, color: '#1e293b', marginBottom: '20px' }}>
              Mental Health FAQs for Noida & Delhi
            </h3>
            <p style={{ color: '#64748b', fontSize: '18px' }}>
              Find answers to common questions about seeking therapy in the Delhi-NCR region.
            </p>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {faqData.map((item, index) => (
                <FAQ key={index} q={item.q} a={item.a} defaultOpen={true} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
