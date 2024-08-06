const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

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

router.post('/', (req, res) => {
    const { nome, email, celular, mensagem } = req.body;

    console.log('Dados recebidos:', req.body);  // Adicione este log para verificar os dados recebidos

    const mailOptions = {
        //from: email,
        from: ['treinamento@nichele.com.br'],
        to: process.env.SMTP_USER,
        subject: `Mensagem de Contato - Biblioteca Nichele | ${nome}`,
        text: `Nome: ${nome}\nE-mail: ${email}\nCelular: ${celular}\nMensagem:\n\n${mensagem}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar e-mail:', error);  // Adicione este log para verificar o erro
            return res.status(500).json({ message: 'Erro ao enviar e-mail', error });
        }
        res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
    });

});

module.exports = router;
