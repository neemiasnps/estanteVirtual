const gerarTemplateEmail = require('../../utils/emailTemplate');

function emprestimoLembreteTemplate(dados) {

  const aluno = dados.aluno || {};
  const livro = dados.livro || {};

  const data = livro.data_devolucao_prevista
  ? new Date(livro.data_devolucao_prevista)
      .toLocaleDateString('pt-BR')
  : '-';

  const conteudo = `
    <p>Olá, ${aluno.nome || 'Colaborador(a)'}</p>

    <p>Este é um lembrete sobre a devolução do livro:</p>

    <p><strong>${livro.titulo || '-'}</strong></p>

    <p>Data prevista de devolução: <strong>${data}</strong></p>

    <hr>

    <p><strong>Importante:</strong></p>
    <ul>
      <li>Prazo padrão: 40 dias</li>
      <li>Solicitação de extensão deve ser feita ao T&D</li>
      <li>Em caso de extravio, poderá ser aplicada taxa de reposição.</li>
      <li>O sistema envia lembrete automático antes e no dia da devolução</li>
    </ul>
  `;

  return gerarTemplateEmail({
    titulo: 'Lembrete de Devolução',
    conteudo
  });
}

module.exports = emprestimoLembreteTemplate;