function iniciarLembretesEmprestimos() {
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
      where: { status: 'pendente' },
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

      if (diffDias === 5) {
        await notificar('lembrete_5dias', {
          tipoContexto: 'item',
          itemId: item.id
        });
      }

      if (diffDias === 0) {
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
}

module.exports = iniciarLembretesEmprestimos;