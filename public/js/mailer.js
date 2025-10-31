/*const nodemailer = require('nodemailer');


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

module.exports = enviarEmail;?*/
const nodemailer = require('nodemailer');

// Criação do transporte de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Evita falha por certificado autoassinado
  }
});

// Função de envio com tratamento aprimorado
async function enviarEmail(destinatario, assunto, corpo, tentativa = 1) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: [destinatario, 'treinamento@nichele.com.br'],
    subject: assunto,
    html: corpo
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail enviado com sucesso! ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Erro ao enviar e-mail (tentativa ${tentativa}):`, error.message);

    // Tratamento específico para erros temporários do servidor
    if (error.responseCode === 451 && tentativa < 3) {
      console.log('⚠️ Falha temporária no servidor SMTP. Tentando reenviar em 5 segundos...');
      await new Promise(res => setTimeout(res, 5000));
      return enviarEmail(destinatario, assunto, corpo, tentativa + 1);
    }

    // Tratamento para erros comuns de autenticação
    if (error.responseCode === 535) {
      console.error('🔐 Erro de autenticação SMTP. Verifique usuário e senha.');
    }

    throw new Error(`Falha ao enviar e-mail: ${error.message}`);
  }
}

module.exports = enviarEmail;
