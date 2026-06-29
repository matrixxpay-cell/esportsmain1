const nodemailer = require('nodemailer')
const PlatformConfig = require('../models/PlatformConfig')

const getTransporter = async () => {
  const host = await PlatformConfig.get('email_host')
  const port = await PlatformConfig.get('email_port') || '587'
  const secure = await PlatformConfig.get('email_secure') || 'false'
  const user = await PlatformConfig.get('email_user')
  const pass = await PlatformConfig.get('email_pass')

  if (!host || !user || !pass || pass === '••••••••') {
    throw new Error('Email not configured. Go to Admin > Settings > Email to set SMTP credentials.')
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: secure === 'true',
    auth: { user, pass },
  })
}

const sendEmail = async ({ to, subject, html }) => {
  const from = await PlatformConfig.get('email_from')
  const transporter = await getTransporter()
  await transporter.sendMail({ from, to, subject, html })
}

const emailTemplates = {
  verifyEmail: (username, verifyUrl) => ({
    subject: 'Verify your IndiaEsports account',
    html: `
      <div style="background:#0F172A;color:#F1F5F9;padding:40px 20px;font-family:Inter,sans-serif;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="background:linear-gradient(135deg,#00D9FF,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;margin-bottom:8px;">IndiaEsports</h1>
        <p style="color:#94A3B8;margin-bottom:24px;font-size:13px;">Ab Nahi Khelega India Toh Kab Khelega?</p>
        <h2 style="color:#F1F5F9;margin-bottom:16px;">Welcome, ${username}! 🎮</h2>
        <p style="color:#CBD5E1;margin-bottom:24px;">Please verify your email address to start competing in tournaments.</p>
        <a href="${verifyUrl}" style="background:linear-gradient(135deg,#00D9FF,#7C3AED);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-block;margin-bottom:24px;">Verify Email</a>
        <p style="color:#475569;font-size:12px;">Link expires in 24 hours. If you didn't create this account, ignore this email.</p>
      </div>
    `,
  }),

  resetPassword: (username, resetUrl) => ({
    subject: 'Reset your IndiaEsports password',
    html: `
      <div style="background:#0F172A;color:#F1F5F9;padding:40px 20px;font-family:Inter,sans-serif;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="background:linear-gradient(135deg,#00D9FF,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;margin-bottom:24px;">IndiaEsports</h1>
        <h2 style="color:#F1F5F9;margin-bottom:16px;">Password Reset Request</h2>
        <p style="color:#CBD5E1;margin-bottom:24px;">Hi ${username}, we received a request to reset your password.</p>
        <a href="${resetUrl}" style="background:linear-gradient(135deg,#00D9FF,#7C3AED);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;display:inline-block;margin-bottom:24px;">Reset Password</a>
        <p style="color:#475569;font-size:12px;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  }),

  tournamentRegistration: (username, tournamentTitle, startDate, roomDetails) => ({
    subject: `You're registered for ${tournamentTitle}`,
    html: `
      <div style="background:#0F172A;color:#F1F5F9;padding:40px 20px;font-family:Inter,sans-serif;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="background:linear-gradient(135deg,#00D9FF,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;margin-bottom:24px;">IndiaEsports</h1>
        <h2 style="color:#F1F5F9;margin-bottom:8px;">Registration Confirmed! 🏆</h2>
        <p style="color:#94A3B8;margin-bottom:24px;">You're in, ${username}!</p>
        <div style="background:rgba(0,217,255,0.05);border:1px solid rgba(0,217,255,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
          <h3 style="color:#00D9FF;margin-bottom:12px;">${tournamentTitle}</h3>
          <p style="color:#CBD5E1;margin:0;font-size:14px;">📅 Start Date: ${startDate}</p>
          ${roomDetails ? `
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1);">
              <p style="color:#CBD5E1;margin:0 0 8px;font-size:14px;">🚪 Room ID: <strong style="color:#fff;">${roomDetails.roomId}</strong></p>
              <p style="color:#CBD5E1;margin:0;font-size:14px;">🔑 Password: <strong style="color:#fff;">${roomDetails.roomPassword}</strong></p>
            </div>
          ` : ''}
        </div>
        <p style="color:#475569;font-size:12px;">Good luck, champion! 🎮</p>
      </div>
    `,
  }),

  prizeWon: (username, amount, tournamentTitle) => ({
    subject: `🏆 You won ₹${amount} in ${tournamentTitle}!`,
    html: `
      <div style="background:#0F172A;color:#F1F5F9;padding:40px 20px;font-family:Inter,sans-serif;max-width:600px;margin:0 auto;border-radius:16px;">
        <h1 style="background:linear-gradient(135deg,#00D9FF,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;margin-bottom:24px;">IndiaEsports</h1>
        <h2 style="color:#F1F5F9;margin-bottom:8px;">Congratulations, ${username}! 🎉</h2>
        <p style="color:#94A3B8;margin-bottom:24px;">You won a prize in ${tournamentTitle}!</p>
        <div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.3);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
          <div style="font-size:40px;margin-bottom:8px;">🏆</div>
          <div style="color:#FBBF24;font-size:32px;font-weight:900;">₹${amount}</div>
          <div style="color:#94A3B8;font-size:14px;margin-top:8px;">Has been credited to your wallet</div>
        </div>
      </div>
    `,
  }),
}

module.exports = { sendEmail, emailTemplates }
