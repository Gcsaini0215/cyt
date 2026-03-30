import FAQ from "./faq";
import { HelpCircle } from "lucide-react";

export default function Faqs() {
  const faqData = [
    {
      q: "What mental health services does Choose Your Therapist offer in India?",
      a: "Choose Your Therapist (CYT) provides a comprehensive range of mental health services across India, including online counseling, specialized therapy for anxiety and depression, corporate wellness programs, school mental health initiatives, and peer support groups."
    },
    {
      q: "What should I expect during my first online therapy session with a psychologist?",
      a: "In your first online therapy session, our expert psychologists will focus on understanding your specific concerns, building a comfortable therapeutic relationship, and developing a personalized mental health treatment plan tailored to your unique needs."
    },
    {
      q: "Are the therapy sessions for anxiety and depression confidential?",
      a: "Yes, all our counseling sessions, whether for anxiety, depression, or stress management, are 100% confidential. We follow strict international data protection standards to ensure your privacy and safety throughout your mental health journey."
    },
    {
      q: "Can I choose or change my therapist if I’m not comfortable with the current one?",
      a: "Absolutely. Finding the right fit is crucial for successful therapy. At CYT, you have the flexibility to choose from a diverse pool of certified clinical psychologists and can request to change your therapist at any time to ensure the best support for your mental well-being."
    },
    {
      q: "Do you provide specialized treatment for specific issues like OCD, trauma, and relationship problems?",
      a: "Yes, our highly qualified therapists specialize in evidence-based treatments for OCD (using ERP), trauma-informed therapy, PTSD counseling, and expert relationship or marriage counseling to help you overcome life's complex challenges."
    },
    {
      q: "How many therapy sessions will I need for effective stress management?",
      a: "The number of therapy sessions varies based on individual goals and the complexity of the issues. Many clients begin to see positive changes in stress management and emotional resilience within 6-10 sessions, but your psychologist will work with you to determine the ideal frequency."
    },
    {
      q: "How can I book the best psychologist near me through Choose Your Therapist?",
      a: "You can easily book a session with the best psychologists in India through our platform. Simply browse our verified therapist profiles, check their specializations, and schedule an online or in-person appointment that fits your convenience."
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
            <h3 style={{ fontSize: '42px', fontWeight: 900, color: '#1e293b', marginBottom: '20px' }}>
              Common Questions & Answers
            </h3>
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
