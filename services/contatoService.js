const sendMail = require('../mail/sendMail');
const contatoTemplate = require('../templates/emails/contatoTemplate');

async function enviarContato({ nome, email, celular, mensagem }) {

    if (!nome || !email || !mensagem) {
        throw new Error('Dados obrigatórios faltando');
    }

    const body = contatoTemplate({ nome, email, celular, mensagem });

    await sendMail({
        to: 'treinamento@nichele.com.br',
        subject: `Contato - Biblioteca Nichele | ${nome}`,
        html: body
    });
}

module.exports = {
    enviarContato
};