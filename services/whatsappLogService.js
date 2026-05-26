const { NotificacaoLog } = require('../models');

/* =========================
   CRIAR LOG
========================= */
async function criarLog(dados) {

  return await NotificacaoLog.create({
    emprestimo_id: dados.emprestimo_id || null,
    emprestimo_livro_id: dados.item_id || null,
    aluno_id: dados.aluno_id || null,

    telefone: dados.telefone || null,

    template_id: dados.template_id || null,

    tipo: dados.tipo || null,

    status: dados.status || 'pendente',

    payload: dados.payload || null,

    response: dados.response || null,

    erro: dados.erro || null
  });
}


/* =========================
   ATUALIZAR LOG
========================= */
async function atualizarLog(id, dados) {

  const log = await NotificacaoLog.findByPk(id);

  if (!log) return null;

  Object.assign(log, dados);

  await log.save();

  return log;
}


/* =========================
   MARCAR ERRO
========================= */
async function marcarErro(id, erro) {

  const log = await WhatsAppLog.findByPk(id);

  if (!log) return null;

  log.status = 'erro';

  log.erro = typeof erro === 'string'
    ? erro
    : JSON.stringify(erro);

  await log.save();

  return log;
}

module.exports = {
  criarLog,
  atualizarLog,
  marcarErro
};