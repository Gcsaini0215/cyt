import FAQ from "../home/faq";
import { HelpCircle } from "lucide-react";

export const faqData = [
  {
    q: "How does the corporate wellness program work?",
    a: "Your employees get direct, confidential access to our verified psychologists as a company-paid benefit. You choose a plan based on headcount and needs, and employees book sessions — for themselves, a partner, or family — online or in person."
  },
  {
    q: "Which companies is this for?",
    a: "Startups, SMEs, and large enterprises across India that want to offer employee mental health support — whether you are a 20-person team or have multiple offices and remote staff."
  },
  {
    q: "Will the company know which employees use therapy?",
    a: "No. What an employee discusses with their therapist is never shared with the employer. HR receives only aggregated, anonymized usage data — never session content or identities."
  },
  {
    q: "What does pricing look like?",
    a: "Pricing depends on headcount, session volume, and the mix of care you need (workshops, therapy, or clinical assessments). Send a corporate enquiry and our team will share a plan tailored to your company."
  },
  {
    q: "How quickly can we launch?",
    a: "Most companies can launch within a few days of signing up — we handle therapist matching, the employee launch session, and any custom HR reporting during setup."
  },
  {
    q: "What is an Employee Assistance Program (EAP)?",
    a: "An EAP is a company-paid benefit that gives employees free, confidential counselling for work and personal challenges — stress, anxiety, burnout, relationships, or grief. Our EAP connects your employees with verified psychologists online across India or in person."
  },
  {
    q: "Do you conduct workshops and on-site sessions at our office?",
    a: "Yes. We run stress management, burnout, resilience, and manager training workshops on-site or virtually, and can schedule on-site counselling days at your office. Share your locations in the enquiry form and we will confirm availability."
  },
  {
    q: "Can employees' family members use the program?",
    a: "Yes, depending on your plan. Growth and Enterprise plans can include therapy for employees' partners and families."
  },
  {
    q: "How do we get a quote for our company?",
    a: "Fill in the corporate enquiry form on this page with your company size, locations, and the services you need. Our team replies within 24 hours, sets up a short discovery call, and sends a tailored proposal and quote."
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
              Corporate FAQs
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, color: '#1e293b' }}>
              Common Questions from HR Teams
            </h2>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-9">
            {faqData.map((item, index) => (
              <FAQ key={index} q={item.q} a={item.a} hideIcon />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
