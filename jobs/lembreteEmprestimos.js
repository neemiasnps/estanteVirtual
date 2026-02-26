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

      // Calcula dias emprestado
      const dataEmprestimo = new Date(emprestimo.data_solicitacao);
      const diasEmprestado = Math.floor(
        (hoje - dataEmprestimo) / (1000 * 60 * 60 * 24)
      );

      const prazoPadrao = 40;
      const diasEmAtraso = diasEmprestado - prazoPadrao;

      const listaLivros = emprestimo.Livros
        .map(livro => `• ${livro.titulo}`)
        .join('<br>');

      // Define mensagem adicional conforme nível de atraso
      let alertaAdicional = '';

      if (diasEmprestado >= 90) {
        alertaAdicional = `
          <p style="color: red;"><strong>ATENÇÃO:</strong> O prazo está excedido há mais de 90 dias.
          Solicitamos regularização com urgência.</p>
        `;
      } else if (diasEmprestado >= 60) {
        alertaAdicional = `
          <p style="color: #d35400;"><strong>Importante:</strong> O prazo já ultrapassou 60 dias.</p>
        `;
      }

      const assunto = `Biblioteca Nichele - Lembrete de Devolução`;

      const corpo = `
      <!DOCTYPE html>
      <html>
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Biblioteca Nichele</title>
      </head>

      <body style="margin:0; padding:0; background-color:#f2f4f7; font-family: Arial, Helvetica, sans-serif;">

      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f4f7; padding:20px;">
      <tr>
      <td align="center">

      <!-- Container -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden;">

        <!-- Cabeçalho -->
        <tr>
          <td align="center" style="background-color:#17436a; padding:25px;">
            <img src="https://biblioteca-nichele.onrender.com/images/logo.png"
                 alt="Biblioteca Nichele"
                 style="max-width:200px; width:100%; height:auto; display:block;">
            <p style="color:#ffffff; font-size:18px; margin:15px 0 0 0;">
              Lembrete de Devolução
            </p>
          </td>
        </tr>

        <!-- Conteúdo -->
        <tr>
          <td style="padding:25px; color:#333333; font-size:14px; line-height:1.6;">

            <p>Prezado(a) <strong>${aluno.nomeCompleto}</strong>,</p>

            <p>O(s) livro(s) abaixo foi(ram) retirado(s) em 
            <strong>${dataEmprestimo.toLocaleDateString('pt-BR')}</strong>:</p>

            <!-- Lista -->
            <table width="100%" cellpadding="10" cellspacing="0" border="0" style="background:#f5f7fa; border-left:4px solid #17436a; margin:15px 0;">
              <tr>
                <td style="font-size:14px;">
                  ${listaLivros}
                </td>
              </tr>
            </table>

            <p>Tempo de empréstimo: 
            <strong style="color:#17436a;">${diasEmprestado} dias</strong></p>

            <p>Prazo padrão: <strong>${prazoPadrao} dias</strong></p>

            <p>Dias em atraso: 
            <strong style="color:#bb1518;">${diasEmAtraso > 0 ? diasEmAtraso : 0}</strong></p>

            ${alertaAdicional}

            <!-- Botão -->
            <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:25px auto;">
              <tr>
                <td align="center" bgcolor="#bb1518" style="border-radius:4px;">
                  <a href="mailto:treinamento@nichele.com.br"
                     style="display:inline-block; padding:12px 20px; font-size:14px; color:#ffffff; text-decoration:none;">
                     Entrar em contato com T&D
                  </a>
                </td>
              </tr>
            </table>

            <p style="font-size:13px;">
              Solicitamos a devolução ou regularização o quanto antes.
            </p>

          </td>
        </tr>

        <!-- Rodapé -->
        <tr>
          <td align="center" style="background-color:#17436a; padding:15px; color:#ffffff; font-size:12px;">
            Biblioteca Nichele<br>
            Comunicação automática do sistema
          </td>
        </tr>

      </table>

      </td>
      </tr>
      </table>

      </body>
      </html>
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