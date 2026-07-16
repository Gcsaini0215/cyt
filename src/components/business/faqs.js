import FAQ from "../home/faq";
import { HelpCircle } from "lucide-react";

const faqData = [
  {
    q: "How does Choose Your Therapist for Business work?",
    a: "We give your organization's employees, students, or members direct access to our platform of verified psychologists. You choose a plan based on team size and needs, and your people can book sessions — individual, couples, or family — online or in person, with full confidentiality."
  },
  {
    q: "Who is this for?",
    a: "Employers looking to offer mental health benefits, schools and colleges wanting counselling support for students, and hospitals or wellness partners looking to extend their referral network with verified clinical psychologists."
  },
  {
    q: "Is employee or student usage confidential from the organization?",
    a: "Yes. What an individual discusses with their therapist is never shared with the sponsoring organization. Organizations receive only aggregated, anonymized usage data — never session content or identities."
  },
  {
    q: "What does pricing look like?",
    a: "Pricing depends on team size, session volume, and the mix of care tiers you need (self-guided resources, therapy, or clinical assessments). Request a demo and our team will share a plan tailored to your organization."
  },
  {
    q: "How quickly can we launch?",
    a: "Most organizations can onboard within a few days of signing up — we handle therapist matching, scheduling access, and any custom reporting needs during setup."
  }
];

export default function BusinessFaqs() {
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
              Business FAQs
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, color: '#1e293b' }}>
              Common Questions from Organizations
            </h2>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-9">
            {faqData.map((item, index) => (
              <FAQ key={index} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
