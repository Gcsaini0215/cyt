import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { name, email, phone, city, college, degree, specialization, internType, mode, duration, hours, availableFrom, motivation } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "appointment.cyt@gmail.com",
      pass: process.env.EMAIL_PASS,
    },
  });

  const types = Array.isArray(internType) ? internType.join(", ") : internType;
  const motivationSnippet = (motivation || "").slice(0, 180) + ((motivation || "").length > 180 ? "..." : "");
  const appliedOn = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const html = `
<div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#071a0e 0%,#1b5e20 100%);padding:28px 24px;text-align:center;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.6);">Choose Your Therapist</p>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:#fff;">New Internship Application</h1>
    <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.55);">Received on ${appliedOn}</p>
  </div>

  <!-- Applicant highlight -->
  <div style="padding:24px 28px 0;">
    <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:12px;padding:18px 20px;display:flex;align-items:center;gap:14px;">
      <div style="width:48px;height:48px;border-radius:50%;background:#228756;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="color:#fff;font-size:20px;font-weight:900;">${(name || "?").charAt(0).toUpperCase()}</span>
      </div>
      <div>
        <p style="margin:0 0 3px;font-size:17px;font-weight:900;color:#1e293b;">${name}</p>
        <p style="margin:0;font-size:13px;color:#228756;font-weight:600;">${email} &nbsp;|&nbsp; ${phone}</p>
      </div>
    </div>
  </div>

  <!-- Details -->
  <div style="padding:24px 28px;">

    <!-- Academic -->
    <h3 style="margin:0 0 12px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;border-bottom:1px solid #f1f5f9;padding-bottom:8px;">Academic Info</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:22px;">
      <tr>
        <td style="padding:7px 0;color:#64748b;width:40%;">College / Institute</td>
        <td style="padding:7px 0;font-weight:700;color:#1e293b;">${college}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;">Degree</td>
        <td style="padding:7px 0;font-weight:700;color:#1e293b;">${degree}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;">Specialization</td>
        <td style="padding:7px 0;font-weight:700;color:#1e293b;">${specialization}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;">City</td>
        <td style="padding:7px 0;font-weight:700;color:#1e293b;">${city}</td>
      </tr>
    </table>

    <!-- Internship Preferences -->
    <h3 style="margin:0 0 12px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;border-bottom:1px solid #f1f5f9;padding-bottom:8px;">Internship Preferences</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:22px;">
      <tr>
        <td style="padding:7px 0;color:#64748b;width:40%;">Types Applied</td>
        <td style="padding:7px 0;font-weight:700;color:#1b5e20;">${types}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;">Mode</td>
        <td style="padding:7px 0;font-weight:700;color:#1e293b;">${mode}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;">Duration</td>
        <td style="padding:7px 0;font-weight:700;color:#1e293b;">${duration}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;">Required Hours</td>
        <td style="padding:7px 0;font-weight:700;color:#1e293b;">${hours}</td>
      </tr>
      <tr>
        <td style="padding:7px 0;color:#64748b;">Start From</td>
        <td style="padding:7px 0;font-weight:700;color:#1e293b;">${availableFrom}</td>
      </tr>
    </table>

    <!-- Motivation -->
    ${motivationSnippet ? `
    <h3 style="margin:0 0 10px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;border-bottom:1px solid #f1f5f9;padding-bottom:8px;">Motivation (preview)</h3>
    <p style="margin:0;font-size:13px;color:#475569;line-height:1.7;font-style:italic;">"${motivationSnippet}"</p>
    ` : ""}

  </div>

  <!-- CTA -->
  <div style="padding:0 28px 28px;">
    <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;text-align:center;">
      <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">Reply directly to the applicant</p>
      <a href="mailto:${email}" style="color:#228756;font-weight:700;font-size:14px;text-decoration:none;">${email}</a>
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <a href="tel:${phone}" style="color:#228756;font-weight:700;font-size:14px;text-decoration:none;">${phone}</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #f1f5f9;">
    <p style="margin:0;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} Choose Your Therapist LLP &nbsp;|&nbsp; Auto-generated lead notification</p>
  </div>

</div>`;

  try {
    await transporter.sendMail({
      from: '"CYT Internship" <appointment.cyt@gmail.com>',
      to: "chooseyourtherapist@gmail.com",
      replyTo: email,
      subject: `🎓 New Internship Application — ${name} (${types})`,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Internship email error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
