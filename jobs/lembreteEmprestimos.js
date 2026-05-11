const cron = require('node-cron');
const { Op } = require('sequelize');

const EmprestimoLivro = require('../models/emprestimo_livro');
const Emprestimo = require('../models/emprestimo');
const Livro = require('../models/livro');

const {
  enviarEmailLembreteEmprestimo,
  enviarEmailEmprestimoAtrasado
} = require('../services/emailService');

// ================================
// FUNÇÃO AUXILIAR
// ================================
function getInicioEFimDoDia(data) {

  const inicio = new Date(data);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(data);
  fim.setHours(23, 59, 59, 999);

  return { inicio, fim };

}

// ================================
// CRON - TODOS OS DIAS ÀS 08:00
// ================================
cron.schedule('0 8 * * *', async () => {

  console.log('🔵 [CRON] Início do processamento');

  const hoje = new Date();

  const {
    inicio: hojeInicio,
    fim: hojeFim
  } = getInicioEFimDoDia(hoje);

  // ================================
  // +5 DIAS
  // ================================
  const cincoDias = new Date();

  cincoDias.setDate(hoje.getDate() + 5);

  const {
    inicio: cincoInicio,
    fim: cincoFim
  } = getInicioEFimDoDia(cincoDias);

  // ================================
  // SEGUNDA-FEIRA?
  // ================================
  const isSegundaFeira = hoje.getDay() === 1;

  try {

    // ================================
    // CONDIÇÕES DA CONSULTA
    // ================================
    const condicoes = [

      // 📅 Vence hoje
      {
        data_devolucao_prevista: {
          [Op.between]: [hojeInicio, hojeFim]
        }
      },

      // ⏳ Vence em 5 dias
      {
        data_devolucao_prevista: {
          [Op.between]: [cincoInicio, cincoFim]
        }
      }

    ];

    // 🚨 Atrasados apenas segunda-feira
    if (isSegundaFeira) {

      condicoes.push({
        data_devolucao_prevista: {
          [Op.lt]: hojeInicio
        }
      });

    }

    // ================================
    // BUSCA LIVROS PENDENTES
    // ================================
    const itens = await EmprestimoLivro.findAll({

      where: {

        status: 'pendente',

        [Op.or]: condicoes

      },

      include: [

        {
          model: Emprestimo,
          include: ['aluno']
        },

        {
          model: Livro
        }

      ]

    });

    console.log(`📚 [CRON] ${itens.length} itens encontrados`);

    let enviados = 0;
    let ignorados = 0;
    let erros = 0;

    // ================================
    // PROCESSAMENTO
    // ================================
    for (const item of itens) {

      try {

        const aluno = item.Emprestimo?.aluno;

        // ================================
        // VALIDA E-MAIL
        // ================================
        if (!aluno?.email) {

          console.warn(`⚠️ [CRON] Item ${item.id} sem e-mail válido`);

          ignorados++;

          continue;

        }

        // ================================
        // DATAS
        // ================================
        const dataPrevista = new Date(item.data_devolucao_prevista);

        dataPrevista.setHours(0, 0, 0, 0);

        const isHoje =
          dataPrevista >= hojeInicio &&
          dataPrevista <= hojeFim;

        const isCincoDias =
          dataPrevista >= cincoInicio &&
          dataPrevista <= cincoFim;

        const isAtrasado =
          dataPrevista < hojeInicio &&
          isSegundaFeira;

        // ================================
        // CONTROLE DE REENVIO
        // ================================
        const ultimo = item.ultimo_lembrete
          ? new Date(item.ultimo_lembrete)
          : null;

        if (ultimo) {

          ultimo.setHours(0, 0, 0, 0);

          const diffDias = Math.floor(
            (hojeInicio - ultimo) / (1000 * 60 * 60 * 24)
          );

          // 🚨 Atrasados → 1x por semana
          if (isAtrasado && diffDias < 7) {

            console.log(
              `⏭️ [CRON] Atrasado já avisado recentemente (${item.id})`
            );

            ignorados++;

            continue;

          }

          // 📅 Hoje / 5 dias → apenas 1x no dia
          if ((isHoje || isCincoDias) && diffDias < 1) {

            console.log(
              `⏭️ [CRON] Já enviado hoje (${item.id})`
            );

            ignorados++;

            continue;

          }

        }

        // ================================
        // ENVIO DOS E-MAILS
        // ================================
        if (isAtrasado) {

          console.log(`🚨 [CRON] Enviando atraso (${item.id})`);

          await enviarEmailEmprestimoAtrasado(item);

        } else if (isHoje || isCincoDias) {

          console.log(`📧 [CRON] Enviando lembrete (${item.id})`);

          await enviarEmailLembreteEmprestimo(item);

        }

        // ================================
        // ATUALIZA CONTROLE
        // ================================
        item.ultimo_lembrete = new Date();

        await item.save();

        enviados++;

      } catch (erroEnvio) {

        erros++;

        console.error(
          `❌ [CRON] Erro ao enviar e-mail (ID: ${item.id})`,
          erroEnvio
        );

      }

    }

    // ================================
    // LOG FINAL
    // ================================
    console.log('🟢 [CRON] Finalizado');

    console.log(`✅ [CRON] Enviados: ${enviados}`);
    console.log(`⏭️ [CRON] Ignorados: ${ignorados}`);
    console.log(`❌ [CRON] Erros: ${erros}`);

  } catch (error) {

    console.error('❌ [CRON] Erro geral:', error);

  }

}, {
  timezone: 'America/Sao_Paulo'
});