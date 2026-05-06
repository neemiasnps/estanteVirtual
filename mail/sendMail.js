const transporter = require('./transporter');

async function sendMail({ to, subject, html, text }) {
  try {
    await transporter.sendMail({
      from: `"Biblioteca Nichele" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}

module.exports = sendMail;