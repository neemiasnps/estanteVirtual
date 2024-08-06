const nodemailer = require('nodemailer');


// Configuração do transporte de e-mail com servidor SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Endereço do servidor SMTP
    port: process.env.SMTP_PORT, // Porta do servidor SMTP
    secure: process.env.SMTP_SECURE === 'true', // true para SSL, false para TLS
    auth: {
        user: process.env.SMTP_USER, // Nome de usuário para autenticação
        pass: process.env.SMTP_PASS  // Senha para autenticação
    }
});

// Função para enviar e-mail
async function enviarEmail(destinatario, assunto, corpo) {
  const mailOptions = {
    from: process.env.SMTP_USER, // Substitua pelo seu e-mail
    to: [destinatario, 'treinamento@nichele.com.br'],
    subject: assunto,
    html: corpo, // Use HTML se o corpo do e-mail contiver tags HTML
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado: %s', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Erro ao enviar e-mail');
  }
}

module.exports = enviarEmail;
