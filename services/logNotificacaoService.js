// services/logNotificacaoService.js

const { NotificacaoLog } = require('../models');

/* =========================
   CRIAR LOG
========================= */
async function criarLog({
  emprestimo_id = null,
  emprestimo_livro_id = null,
  aluno_id = null,

  canal,
  tipo,

  destinatario = null,

  template_id = null,
  provider_message_id = null,

  status = 'pendente',

  erro = null,

  payload = null,
  response = null
}) {

  return await NotificacaoLog.create({

    emprestimo_id,
    emprestimo_livro_id,
    aluno_id,

    canal,
    tipo,

    destinatario,

    template_id,
    provider_message_id,

    status,

    erro,

    payload,
    response
  });
}

/* =========================
   LOG SUCESSO
========================= */
async function logSucesso({
  emprestimo_id = null,
  emprestimo_livro_id = null,
  aluno_id = null,

  canal,
  tipo,

  destinatario = null,

  template_id = null,
  provider_message_id = null,

  payload = null,
  response = null
}) {

  return await criarLog({
    emprestimo_id,
    emprestimo_livro_id,
    aluno_id,

    canal,
    tipo,

    destinatario,

    template_id,
    provider_message_id,

    status: 'enviado',

    payload,
    response
  });
}

/* =========================
   LOG ERRO
========================= */
async function logErro({
  emprestimo_id = null,
  emprestimo_livro_id = null,
  aluno_id = null,

  canal,
  tipo,

  destinatario = null,

  template_id = null,

  erro = null,

  payload = null,
  response = null
}) {

  return await criarLog({
    emprestimo_id,
    emprestimo_livro_id,
    aluno_id,

    canal,
    tipo,

    destinatario,

    template_id,

    status: 'erro',

    erro,

    payload,
    response
  });
}

module.exports = {
  criarLog,
  logSucesso,
  logErro
};