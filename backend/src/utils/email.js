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
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  })
}

const sendEmail = async ({ to, subject, html }) => {
  const from = await PlatformConfig.get('email_from')
  const transporter = await getTransporter()
  await transporter.sendMail({ from, to, subject, html })
}

const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050810;font-family:'Poppins',system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#FF6B2B,#F59E0B);border-radius:16px 16px 0 0;padding:24px 30px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:1px;">Esports<span style="color:#050810;">G</span></h1>
      <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.85);letter-spacing:2px;text-transform:uppercase;">India's #1 Platform</p>
    </div>
    <!-- Body -->
    <div style="background:#0A0E1A;border:1px solid rgba(255,107,43,0.15);border-top:none;border-radius:0 0 16px 16px;padding:32px 30px;">
      ${content}
      <!-- Footer -->
      <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
        <p style="margin:0;font-size:11px;color:#475569;">© ${new Date().getFullYear()} EsportsG. All rights reserved.</p>
        <p style="margin:6px 0 0;font-size:11px;color:#475569;">esportsg.in</p>
      </div>
    </div>
  </div>
</body>
</html>`

const emailTemplates = {
  verifyEmail: (username, verifyUrl) => ({
    subject: 'Verify your EsportsG account',
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:22px;font-weight:700;">Welcome, ${username}! 🎮</h2>
      <p style="margin:0 0 20px;color:#94A3B8;font-size:14px;">You're one step away from joining India's biggest esports community.</p>
      <p style="margin:0 0 24px;color:#CBD5E1;font-size:14px;">Please verify your email address to start competing in tournaments and win real prizes.</p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${verifyUrl}" style="background:linear-gradient(135deg,#FF6B2B,#F59E0B);color:#fff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 24px rgba(255,107,43,0.35);">Verify Email</a>
      </div>
      <p style="margin:0;color:#475569;font-size:12px;">Link expires in 24 hours. If you didn't create this account, ignore this email.</p>
    `),
  }),

  resetPassword: (username, resetUrl) => ({
    subject: 'Reset your EsportsG password',
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:22px;font-weight:700;">Password Reset Request 🔒</h2>
      <p style="margin:0 0 24px;color:#CBD5E1;font-size:14px;">Hi ${username}, we received a request to reset your password. Click the button below to set a new one.</p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${resetUrl}" style="background:linear-gradient(135deg,#FF6B2B,#F59E0B);color:#fff;padding:14px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 24px rgba(255,107,43,0.35);">Reset Password</a>
      </div>
      <p style="margin:0;color:#475569;font-size:12px;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `),
  }),

  tournamentRegistration: (username, tournamentTitle, startDate, roomDetails) => ({
    subject: `You're registered for ${tournamentTitle} | EsportsG`,
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:22px;font-weight:700;">Registration Confirmed! 🏆</h2>
      <p style="margin:0 0 20px;color:#94A3B8;font-size:14px;">You're in, ${username}! Get ready to compete.</p>
      <div style="background:rgba(255,107,43,0.06);border:1px solid rgba(255,107,43,0.2);border-radius:12px;padding:20px;margin-bottom:24px;">
        <h3 style="margin:0 0 12px;color:#FF6B2B;font-size:18px;font-weight:700;">${tournamentTitle}</h3>
        <p style="margin:0;color:#CBD5E1;font-size:14px;">📅 Start Date: <strong style="color:#F1F5F9;">${startDate}</strong></p>
        ${roomDetails ? `
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0 0 8px;color:#CBD5E1;font-size:14px;">🚪 Room ID: <strong style="color:#FF6B2B;">${roomDetails.roomId}</strong></p>
            <p style="margin:0;color:#CBD5E1;font-size:14px;">🔑 Password: <strong style="color:#FF6B2B;">${roomDetails.roomPassword}</strong></p>
          </div>
        ` : ''}
      </div>
      <p style="margin:0;color:#94A3B8;font-size:13px;">Good luck, champion! 🎮</p>
    `),
  }),

  prizeWon: (username, amount, tournamentTitle) => ({
    subject: `🏆 You won ₹${amount} in ${tournamentTitle}! | EsportsG`,
    html: emailWrapper(`
      <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:22px;font-weight:700;">Congratulations, ${username}! 🎉</h2>
      <p style="margin:0 0 20px;color:#94A3B8;font-size:14px;">You dominated in ${tournamentTitle}!</p>
      <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:44px;margin-bottom:8px;">🏆</div>
        <div style="color:#F59E0B;font-size:36px;font-weight:900;">₹${amount}</div>
        <div style="color:#94A3B8;font-size:13px;margin-top:8px;">Has been credited to your wallet</div>
      </div>
      <p style="margin:0;color:#94A3B8;font-size:13px;">Keep playing, keep winning! 💪</p>
    `),
  }),
}

module.exports = { sendEmail, emailTemplates, emailWrapper }
