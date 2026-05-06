const sendMail = require('../mail/sendMail');

const emprestimoFinalizadoTemplate = require('../templates/emails/emprestimoFinalizado');
const comporEmailEmprestimoCriado = require('../templates/emails/emprestimoCriado');
const emprestimoLembreteTemplate = require('../templates/emails/emprestimoLembrete');
const emprestimoAtrasadoTemplate = require('../templates/emails/emprestimoAtrasado');

const obterDadosEmprestimo = require('../utils/obterDadosEmprestimo');

// ================================
// FINALIZADO
// ================================
async function enviarEmailEmprestimoFinalizado(emprestimoId) {

  const dados = await obterDadosEmprestimo(emprestimoId);

  const html = emprestimoFinalizadoTemplate(dados);

  await sendMail({
    to: dados.aluno.email,
    subject: `Biblioteca Nichele - Empréstimo Nº ${dados.emprestimo.id} finalizado`,
    html
  });
}


// ================================
// CRIADO
// ================================
async function enviarEmailEmprestimoCriado(emprestimoId) {

  const dados = await obterDadosEmprestimo(emprestimoId);

  const html = comporEmailEmprestimoCriado(dados);

  await sendMail({
    to: dados.aluno.email,
    subject: `Biblioteca Nichele - Empréstimo Nº ${dados.emprestimo.id}`,
    html
  });
}


// ================================
// LEMBRETE
// ================================
async function enviarEmailLembreteEmprestimo(item) {

  const html = emprestimoLembreteTemplate(item);

  await sendMail({
    to: item.Emprestimo.aluno.email,
    subject: `Biblioteca Nichele - Lembrete de devolução`,
    html
  });
}


// ================================
// ATRASO
// ================================
async function enviarEmailEmprestimoAtrasado(item) {

  const html = emprestimoAtrasadoTemplate(item);

  await sendMail({
    to: item.Emprestimo.aluno.email,
    subject: `Biblioteca Nichele - Empréstimo em atraso`,
    html
  });
}

module.exports = {
  enviarEmailEmprestimoFinalizado,
  enviarEmailEmprestimoCriado,
  enviarEmailLembreteEmprestimo,
  enviarEmailEmprestimoAtrasado
};