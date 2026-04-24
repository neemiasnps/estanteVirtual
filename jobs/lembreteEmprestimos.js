require('dotenv').config();

const { Op } = require('sequelize');

const Emprestimo = require('../models/emprestimo');
const Aluno = require('../models/aluno');
const Livro = require('../models/livro');

const enviarEmail = require('../public/js/mailer');
const gerarTemplateEmail = require('../utils/emailTemplate');

async function executarLembretes() {
  console.log('🔵 INÍCIO DO JOB DE LEMBRETES');

  try {
    console.log('Verificando empréstimos com mais de 40 dias...');

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

    console.log(`Encontrados ${emprestimos.length} empréstimos`);

    for (const emprestimo of emprestimos) {

      // Evita enviar mais de um lembrete por semana
      if (emprestimo.ultimo_lembrete) {

        const diasDesdeUltimo = Math.floor(
          (hoje - new Date(emprestimo.ultimo_lembrete)) /
          (1000 * 60 * 60 * 24)
        );

        if (diasDesdeUltimo < 7) {
          console.log(`⏭️ Pulado (já enviado recentemente): ${emprestimo.id}`);
          continue;
        }
      }

      const aluno = emprestimo.Aluno;

      if (!aluno || aluno.status !== 'ativo') {
        console.log(`⏭️ Pulado (aluno inativo ou inexistente): ${emprestimo.id}`);
        continue;
      }

      const dataEmprestimo = new Date(emprestimo.data_solicitacao);

      const diasEmprestado = Math.floor(
        (hoje - dataEmprestimo) / (1000 * 60 * 60 * 24)
      );

      const prazoPadrao = 40;
      const diasEmAtraso = diasEmprestado - prazoPadrao;

      const listaLivros = emprestimo.Livros
        .map(livro => `• ${livro.titulo}`)
        .join('<br>');

      let alertaAdicional = '';

      if (diasEmprestado >= 90) {
        alertaAdicional = `
          <p style="color:#bb1518;">
            <strong>ATENÇÃO:</strong> O prazo está excedido há mais de 90 dias.
            Solicitamos regularização com urgência.
          </p>
        `;
      } else if (diasEmprestado >= 60) {
        alertaAdicional = `
          <p style="color:#d35400;">
            <strong>Importante:</strong> O prazo já ultrapassou 60 dias.
          </p>
        `;
      }

      const assunto = 'Biblioteca Nichele - Lembrete de Devolução';

      const conteudo = `
        <p>Prezado(a) <strong>${aluno.nomeCompleto}</strong>,</p>

        <p>O(s) livro(s) abaixo foi(ram) retirado(s) em
        <strong>${dataEmprestimo.toLocaleDateString('pt-BR')}</strong>:</p>

        <table width="100%" cellpadding="10" cellspacing="0" border="0"
        style="background:#f5f7fa; border-left:4px solid #17436a; margin:15px 0;">
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
        <strong style="color:#bb1518;">
          ${diasEmAtraso > 0 ? diasEmAtraso : 0}
        </strong></p>

        ${alertaAdicional}

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin:35px auto;">
          <tr>
            <td align="center">
              <a href="mailto:treinamento@nichele.com.br"
              style="
                display:inline-block;
                padding:14px 28px;
                font-size:14px;
                font-weight:600;
                color:#ffffff;
                text-decoration:none;
                border-radius:8px;
                background:linear-gradient(135deg,#bb1518,#e63946);
                box-shadow:0 6px 15px rgba(187,21,24,0.3);
              ">
              Entrar em contato com T&D
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size:13px;">
        Solicitamos a devolução ou regularização o quanto antes.
        </p>
      `;

      const corpo = gerarTemplateEmail({
        titulo: 'Lembrete de Devolução',
        conteudo
      });

      console.log(`📧 Enviando para: ${aluno.email}`);

      await enviarEmail(aluno.email, assunto, corpo);

      emprestimo.ultimo_lembrete = new Date();
      await emprestimo.save();

      console.log(`✅ Lembrete enviado para ${aluno.nomeCompleto}`);
    }

    console.log('🟢 FIM DO JOB DE LEMBRETES');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao processar lembretes:', error);
    process.exit(1);
  }
}

// 👇 EXECUTA AUTOMATICAMENTE
if (require.main === module) {
  executarLembretes();
}
