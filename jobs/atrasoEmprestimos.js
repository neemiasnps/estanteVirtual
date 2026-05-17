function iniciarAtrasosEmprestimos() {
  const cron = require('node-cron');
  const { Op } = require('sequelize');

  const EmprestimoLivro = require('../models/emprestimo_livro');
  const { notificar } = require('../services/notificationEngine');

  function zerarHora(data) {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  cron.schedule('0 8 * * 1', async () => {

    console.log('🚨 [CRON] Atrasos iniciados');

    const hoje = zerarHora(new Date());

    const itens = await EmprestimoLivro.findAll({
      where: {
        status: 'pendente',
        data_devolucao_prevista: { [Op.lt]: hoje }
      }
    });

    for (const item of itens) {

      const ultimo = item.ultimo_lembrete
        ? zerarHora(item.ultimo_lembrete)
        : null;

      if (ultimo) {
        const diffDias = Math.floor(
          (hoje - ultimo) / (1000 * 60 * 60 * 24)
        );

        if (diffDias < 7) continue;
      }

      await notificar('atraso', {
        tipoContexto: 'item',
        itemId: item.id
      });

      item.ultimo_lembrete = new Date();
      await item.save();
    }

    console.log('🟢 [CRON] Atrasos finalizado');
  }, {
    timezone: 'America/Sao_Paulo'
  });
}

module.exports = iniciarAtrasosEmprestimos;