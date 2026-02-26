const cron = require('node-cron');
const { Op } = require('sequelize');
const Emprestimo = require('../models/emprestimo');
const Aluno = require('../models/aluno');
const Livro = require('../models/livro');
const enviarEmail = require('../public/js/mailer'); // ajuste se necessário

// Executa toda segunda-feira às 08:00
cron.schedule('0 8 * * 1', async () => {
  console.log('Verificando empréstimos com mais de 40 dias...');

  try {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() - 40);

    const emprestimos = await Emprestimo.findAll({
      where: {
        situacao: 'em andamento',
        data_solicitacao: {
          [Op.lte]: dataLimite
        }
      },
      include: [
        { model: Aluno },
        { model: Livro }
      ]
    });

    for (const emprestimo of emprestimos) {

      // Evita enviar mais de uma vez na mesma semana
      if (emprestimo.ultimo_lembrete) {
        const diasDesdeUltimo = Math.floor(
          (hoje - new Date(emprestimo.ultimo_lembrete)) / (1000 * 60 * 60 * 24)
        );

        if (diasDesdeUltimo < 7) continue;
      }

      const aluno = emprestimo.Aluno;
      if (!aluno || aluno.status !== 'ativo') continue;

      const listaLivros = emprestimo.Livros
        .map(livro => `• ${livro.titulo}`)
        .join('<br>');

      const assunto = `Biblioteca Nichele - Lembrete de Devolução`;

      const corpo = `
        <p>Prezado(a) ${aluno.nomeCompleto},</p>
        <p>Identificamos que o(s) livro(s) abaixo está(ão) emprestado(s) há mais de 40 dias:</p>
        <p>${listaLivros}</p>
        <p>Solicitamos, por gentileza, a devolução o quanto antes.</p>
        <p><strong>Se precisar de mais tempo, informe ao setor de T&D.</strong></p>
        <br>
        <p>Atenciosamente,</p>
        <p><strong>Biblioteca Nichele</strong></p>
      `;

      await enviarEmail(aluno.email, assunto, corpo);

      // Atualiza data do último lembrete
      emprestimo.ultimo_lembrete = new Date();
      await emprestimo.save();

      console.log(`Lembrete enviado para ${aluno.nomeCompleto}`);
    }

  } catch (error) {
    console.error('Erro ao processar lembretes:', error);
  }
});