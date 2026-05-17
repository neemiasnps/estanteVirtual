const sendMail = require('../mail/sendMail');

const emprestimoFinalizadoTemplate = require('../templates/emails/emprestimoFinalizado');
const comporEmailEmprestimoCriado = require('../templates/emails/emprestimoCriado');
const emprestimoLembreteTemplate = require('../templates/emails/emprestimoLembrete');
const emprestimoAtrasadoTemplate = require('../templates/emails/emprestimoAtrasado');
const avaliacaoPendenteTemplate = require('../templates/emails/avaliacaoPendente');

const { obterDadosEmprestimo } = require('../utils/obterDadosEmprestimo');

// ================================
// FINALIZADO
// ================================
async function enviarEmailEmprestimoFinalizado(dados) {

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
async function enviarEmailEmprestimoCriado(dados) {

  const emprestimo = dados.emprestimo || {};
  const aluno = dados.aluno || {};

  const html = comporEmailEmprestimoCriado(dados);

  await sendMail({
    to: aluno.email,
    subject: `Biblioteca Nichele - Empréstimo Nº ${emprestimo.id}`,
    html
  });
}


// ================================
// LEMBRETE
// ================================
async function enviarEmailLembreteEmprestimo(dados) {

  const aluno = dados.aluno || {};

  const html = emprestimoLembreteTemplate(dados);

  await sendMail({
    to: aluno.email,
    subject: `Biblioteca Nichele - Lembrete de devolução`,
    html
  });
}


// ================================
// ATRASO
// ================================
async function enviarEmailEmprestimoAtrasado(dados) {

  const aluno = dados.aluno || {};

  const html = emprestimoAtrasadoTemplate(dados);

  await sendMail({
    to: aluno.email,
    subject: `Biblioteca Nichele - Empréstimo em atraso`,
    html
  });
}


// ================================
// NOVA AVALIAÇÃO PENDENTE
// ================================
async function enviarEmailNovaAvaliacao(avaliacao) {

  const html = avaliacaoPendenteTemplate(avaliacao);

  await sendMail({
    to: 'treinamento@nichele.com.br',
    subject: `Biblioteca Nichele - Nova avaliação pendente`,
    html
  });

}

module.exports = {
  enviarEmailEmprestimoFinalizado,
  enviarEmailEmprestimoCriado,
  enviarEmailLembreteEmprestimo,
  enviarEmailEmprestimoAtrasado,
  enviarEmailNovaAvaliacao
};