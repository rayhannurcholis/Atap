import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Kode OTP Verifikasi KostSolo',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Verifikasi Email KostSolo</h2>
        <p>Kode OTP kamu adalah:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>Kode ini berlaku 10 menit.</p>
      </div>
    `
  })
}

export async function sendResetPasswordEmail(to, resetLink) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Reset Password KostSolo',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Reset Password KostSolo</h2>
        <p>Klik link berikut untuk mengatur ulang password kamu:</p>
        <a href="${resetLink}" style="
          display:inline-block;
          padding:10px 20px;
          background:#2563eb;
          color:white;
          text-decoration:none;
          border-radius:6px;
        ">
          Reset Password
        </a>
        <p>Link ini berlaku selama 1 jam.</p>
      </div>
    `
  })
}