const gerarTemplateEmail = require('../../utils/emailTemplate');

function emprestimoAtrasado(item) {

  const dataPrevista = new Date(item.data_devolucao_prevista)
    .toLocaleDateString('pt-BR');

  const hoje = new Date().toLocaleDateString('pt-BR');

  const conteudo = `
    <h2 style="color:#bb1518; margin-top:0;">Empréstimo em atraso</h2>

    <p>Olá, ${item.Emprestimo.aluno.nomeCompleto}</p>

    <p>Identificamos que há um empréstimo em atraso:</p>

    <p><strong>Livro:</strong> ${item.Livro.titulo}</p>
    <p><strong>Data prevista de devolução:</strong> ${dataPrevista}</p>
    <p><strong>Status atual:</strong> ATRASADO</p>

    <hr>

    <p><strong>Atenção:</strong></p>
    <ul>
      <li>O não cumprimento do prazo pode gerar cobrança de multa</li>
      <li>Em caso de extravio, será cobrada taxa de R$ 30,00</li>
      <li>Contato com o T&D é obrigatório para regularização</li>
    </ul>

    <p>Data de envio: ${hoje}</p>
  `;

  return gerarTemplateEmail({
    titulo: 'Empréstimo em Atraso',
    conteudo
  });
}

module.exports = emprestimoAtrasado;