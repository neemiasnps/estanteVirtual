const gerarTemplateEmail = require('../../utils/emailTemplate');

function emprestimoAtrasado(dados) {

  const aluno = dados.aluno || {};
  const livro = dados.livro || {};

  const dataPrevista = livro.data_devolucao_prevista
    ? new Date(livro.data_devolucao_prevista).toLocaleDateString('pt-BR')
    : '-';

  const hoje = new Date().toLocaleDateString('pt-BR');

  const conteudo = `
    <p>Olá, ${aluno.nome || 'Colaborador(a)'}</p>

    <p>Identificamos que há um empréstimo em atraso:</p>

    <p><strong>Livro:</strong> ${livro.titulo || '-'}</p>
    <p><strong>Data prevista de devolução:</strong> ${dataPrevista}</p>
    <p><strong>Status atual:</strong> ATRASADO</p>

    <hr>

    <p><strong>Atenção:</strong></p>
    <ul>
      <li>Entre em contato com o T&D para orientações sobre a devolução</li>
      <li>Se precisar de mais tempo, solicite a prorrogação diretamente ao T&D</li>
      <li>Em caso de extravio ou perda, poderá ser aplicada taxa de reposição</li>
    </ul>

    <p>Data de envio: ${hoje}</p>
  `;

  return gerarTemplateEmail({
    titulo: 'Empréstimo em Atraso',
    conteudo
  });
}

module.exports = emprestimoAtrasado;