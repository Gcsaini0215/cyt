import { useState } from "react";
import { postData } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";

export default function DemoForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', organization: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.name || !formData.email || !formData.organization) return setError('Please fill all required fields.');
    try {
      setLoading(true);
      await postData(SubmitConsultationUrl, {
        ...formData,
        message: `Organization: ${formData.organization}\n\n${formData.message}`,
        source: 'For Business Page'
      });
      setSuccess("Thanks! Our team will reach out within 24 hours to schedule your demo.");
      setFormData({ name: '', email: '', phone: '', organization: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again or WhatsApp us directly.');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    padding: '11px 14px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    display: 'block',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div id="request-demo" style={{ background: '#f8fafc', padding: '90px 0', scrollMarginTop: '140px' }}>
      <div className="container">
        <div className="row justify-content-center g-5 align-items-center">
          <div className="col-lg-5">
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, color: '#1e293b', marginBottom: '16px' }}>
              Bring Mental Health Support to Your Organization
            </h2>
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7, marginBottom: '24px' }}>
              Tell us about your organization and what you're looking for. Our team will walk you
              through pricing, onboarding, and how Choose Your Therapist fits your people.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <a href="https://wa.me/918077757951" target="_blank" rel="noreferrer"
                style={{ fontSize: '14px', color: '#25d366', fontWeight: 700, textDecoration: 'none' }}>
                WhatsApp Us
              </a>
              <a href="tel:+918077757951" style={{ fontSize: '14px', color: '#228756', fontWeight: 700, textDecoration: 'none' }}>
                +91-807-775-7951
              </a>
              <a href="mailto:chooseyourtherapist@gmail.com" style={{ fontSize: '14px', color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>
                chooseyourtherapist@gmail.com
              </a>
            </div>
          </div>

          <div className="col-lg-6">
            <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #228756, #4ade80)' }} />
              <div style={{ padding: '32px 36px 36px' }}>
                <h5 style={{ fontWeight: 800, fontSize: '22px', marginBottom: '4px' }}>Request a Demo</h5>
                <p className="text-muted" style={{ fontSize: '13px', margin: '0 0 20px' }}>
                  We'll get back to you within 24 hours
                </p>

                {success && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                    <p style={{ color: '#166534', fontSize: '13px', margin: 0, fontWeight: 600 }}>{success}</p>
                  </div>
                )}
                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                    <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label style={labelStyle}>Full Name *</label>
                    <input name="name" type="text" placeholder="Your full name" value={formData.name} onChange={handleChange} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#228756'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>

                  <div className="mb-3">
                    <label style={labelStyle}>Work Email *</label>
                    <input name="email" type="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#228756'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>

                  <div className="mb-3">
                    <label style={labelStyle}>Organization Name *</label>
                    <input name="organization" type="text" placeholder="Company, school, or hospital name" value={formData.organization} onChange={handleChange} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#228756'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>

                  <div className="mb-3">
                    <label style={labelStyle}>Phone Number</label>
                    <input name="phone" type="text" placeholder="10-digit mobile number" value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#228756'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>

                  <div className="mb-4">
                    <label style={labelStyle}>What are you looking for?</label>
                    <textarea name="message" rows={3} placeholder="Team size, use case, timeline..." value={formData.message} onChange={handleChange}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = '#228756'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                  </div>

                  <button type="submit" disabled={loading} className="rbt-btn btn-gradient radius-round w-100"
                    style={{ minHeight: '50px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Sending...' : 'Request a Demo'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
