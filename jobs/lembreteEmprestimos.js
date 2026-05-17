const cron = require('node-cron');
const { Op } = require('sequelize');

const EmprestimoLivro = require('../models/emprestimo_livro');
const Emprestimo = require('../models/emprestimo');
const Livro = require('../models/livro');

const { notificar } = require('../services/notificationEngine');

function zerarHora(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}


cron.schedule('0 8 * * *', async () => {

  console.log('📅 [CRON] Lembretes iniciados');

  const hoje = zerarHora(new Date());

  const itens = await EmprestimoLivro.findAll({
    where: {
      status: 'pendente'
    },
    include: [
      { model: Emprestimo, include: ['aluno'] },
      { model: Livro }
    ]
  });

  for (const item of itens) {

    const dataPrevista = zerarHora(item.data_devolucao_prevista);

    const diffDias = Math.round(
      (dataPrevista - hoje) / (1000 * 60 * 60 * 24)
    );

    const ultimo = item.ultimo_lembrete
      ? zerarHora(item.ultimo_lembrete)
      : null;

    // ANTI-SPAM
    if (ultimo && ultimo.getTime() === hoje.getTime()) {
      console.log(`⏭️ Item ${item.id} já recebeu lembrete hoje`);
      continue;
    }

    console.log({
      itemId: item.id,
      livro: item.Livro?.titulo,
      dataPrevista,
      diffDias
    });

    // ================================
    // 5 DIAS ANTES
    // ================================
    if (diffDias === 5) {

      console.log(`📨 Enviando lembrete 5 dias | Item ${item.id}`);

      await notificar('lembrete_5dias', {
        tipoContexto: 'item',
        itemId: item.id
      });
    }

    // ================================
    // HOJE
    // ================================
    if (diffDias === 0) {

      console.log(`📨 Enviando lembrete HOJE | Item ${item.id}`);

      await notificar('lembrete_hoje', {
        tipoContexto: 'item',
        itemId: item.id
      });
    }

    item.ultimo_lembrete = new Date();
    await item.save();
  }

  console.log('🟢 [CRON] Lembretes finalizado');

}, {
  timezone: 'America/Sao_Paulo'
});