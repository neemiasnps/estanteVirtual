const gerarTemplateEmail = require('../../utils/emailTemplate');

function emprestimoLembreteTemplate(item) {

  const data = new Date(item.data_devolucao_prevista)
    .toLocaleDateString('pt-BR');

  const conteudo = `
    <h2 style="margin-top:0;">Lembrete de devolução</h2>

    <p>Olá, ${item.Emprestimo.aluno.nomeCompleto}</p>

    <p>Este é um lembrete sobre a devolução do livro:</p>

    <p><strong>${item.Livro.titulo}</strong></p>

    <p>Data prevista de devolução: <strong>${data}</strong></p>

    <hr>

    <p><strong>Importante:</strong></p>
    <ul>
      <li>Prazo padrão: 40 dias</li>
      <li>Solicitação de extensão deve ser feita ao T&D</li>
      <li>Em caso de extravio será cobrada taxa de R$ 30,00</li>
      <li>O sistema envia lembrete automático antes e no dia da devolução</li>
    </ul>
  `;

  return gerarTemplateEmail({
    titulo: 'Lembrete de Devolução',
    conteudo
  });
}

module.exports = emprestimoLembreteTemplate;