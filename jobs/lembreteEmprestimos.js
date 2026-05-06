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
// FUNÇÃO AUXILIAR (INÍCIO/FIM DO DIA)
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

  console.log('[CRON] Início do processamento de e-mails');

  const hoje = new Date();
  const { inicio: hojeInicio, fim: hojeFim } = getInicioEFimDoDia(hoje);

  const cincoDias = new Date();
  cincoDias.setDate(hoje.getDate() + 5);
  const { inicio: cincoInicio, fim: cincoFim } = getInicioEFimDoDia(cincoDias);

  const diaSemana = hoje.getDay(); // 1 = segunda-feira

  try {

    // ================================
    // CONDIÇÕES
    // ================================
    const condicoes = [
      // 📅 Hoje
      {
        data_devolucao_prevista: {
          [Op.between]: [hojeInicio, hojeFim]
        }
      },
      // ⏳ 5 dias antes
      {
        data_devolucao_prevista: {
          [Op.between]: [cincoInicio, cincoFim]
        }
      }
    ];

    // 🚨 Atrasados (somente segunda-feira)
    if (diaSemana === 1) {
      condicoes.push({
        data_devolucao_prevista: {
          [Op.lt]: hojeInicio
        }
      });
    }

    // ================================
    // BUSCA NO BANCO
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

    console.log(`[CRON] ${itens.length} itens encontrados`);

    let enviados = 0;
    let ignorados = 0;

    // ================================
    // PROCESSAMENTO
    // ================================
    for (const item of itens) {

      const ultimo = item.ultimo_lembrete
        ? new Date(item.ultimo_lembrete)
        : null;

      const hojeStr = hojeInicio.toDateString();

      // 🔒 Evita duplicidade no mesmo dia
      if (ultimo && ultimo.toDateString() === hojeStr) {
        ignorados++;
        continue;
      }

      // 🔒 Validação de e-mail
      if (!item.Emprestimo?.aluno?.email) {
        console.warn(`[CRON] Item ${item.id} sem e-mail válido`);
        continue;
      }

      const dataPrevista = new Date(item.data_devolucao_prevista);

      const isHoje = dataPrevista >= hojeInicio && dataPrevista <= hojeFim;
      const isCincoDias = dataPrevista >= cincoInicio && dataPrevista <= cincoFim;
      const isAtrasado = dataPrevista < hojeInicio;

      try {

        if (isAtrasado) {

          // 🚨 ATRASO (segunda-feira)
          await enviarEmailEmprestimoAtrasado(item);

        } else if (isHoje || isCincoDias) {

          // 📅 LEMBRETE
          await enviarEmailLembreteEmprestimo(item);

        }

        // Atualiza controle
        item.ultimo_lembrete = new Date();
        await item.save();

        enviados++;

      } catch (erroEnvio) {
        console.error(`[CRON] Erro ao enviar e-mail (ID: ${item.id})`, erroEnvio);
      }

    }

    // ================================
    // LOG FINAL
    // ================================
    console.log('[CRON] Finalizado');
    console.log(`[CRON] Enviados: ${enviados}`);
    console.log(`[CRON] Ignorados: ${ignorados}`);

  } catch (error) {
    console.error('[CRON] Erro geral:', error);
  }

}, {
  timezone: 'America/Sao_Paulo'
});