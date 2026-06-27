import { useState } from "react";
import { postData } from "../../utils/actions";
import { SubmitConsultationUrl } from "../../utils/url";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.name || !formData.email || !formData.message) return setError('Please fill all required fields.');
    try {
      setLoading(true);
      await postData(SubmitConsultationUrl, { ...formData, source: 'Contact Page' });
      setSuccess("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again or WhatsApp us directly.');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#f8fafc', padding: '60px 0' }}>
      <div className="container">
        <div className="row g-5 align-items-start">

          {/* Left — info + WhatsApp */}
          <div className="col-lg-5">
            <div style={{ marginBottom: '12px' }}>
              <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Contact Us
              </span>
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '28px', color: '#0f172a', marginBottom: '12px', lineHeight: 1.3 }}>
              Send Us a Message
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.8, marginBottom: '28px' }}>
              Have a specific inquiry? Fill out the form and we'll get back to you within 24 hours. Or reach us directly on WhatsApp for faster support.
            </p>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/918077757951"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', marginBottom: '12px', transition: 'all 0.2s', cursor: 'pointer' }}>
                <div style={{ width: '44px', height: '44px', background: '#25d366', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', margin: '0 0 2px' }}>Chat on WhatsApp</p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>+91-807-775-7951 · Usually replies in minutes</p>
                </div>
              </div>
            </a>

            <a href="tel:+918077757951" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px', cursor: 'pointer' }}>
                <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #16a34a, #22bb33)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"></path></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', margin: '0 0 2px' }}>Call Us Directly</p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Mon – Sat · 10AM – 7PM IST</p>
                </div>
              </div>
            </a>
          </div>

          {/* Right — form */}
          <div className="col-lg-7">
            <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #22bb33, #4ade80)' }} />
              <div style={{ padding: '32px 28px' }}>

                {success && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
                    <p style={{ color: '#166534', fontSize: '13px', margin: 0, fontWeight: 600 }}>{success}</p>
                  </div>
                )}
                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
                    <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>Your Name *</label>
                      <input
                        name="name"
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={handleChange}
                        style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = '#22bb33'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                    <div className="col-md-6">
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>Email Address *</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = '#22bb33'}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>Subject</label>
                    <input
                      name="subject"
                      type="text"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                      style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = '#22bb33'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>

                  <div className="mb-4">
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>Your Message *</label>
                    <textarea
                      name="message"
                      rows={5}
                      placeholder="Tell us more about your requirements..."
                      value={formData.message}
                      onChange={handleChange}
                      style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = '#22bb33'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rbt-btn btn-gradient radius-round w-100"
                    style={{ minHeight: '50px', fontSize: '15px', fontWeight: 700, opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
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
