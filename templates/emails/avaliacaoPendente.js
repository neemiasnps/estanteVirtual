const gerarTemplateEmail = require('../../utils/emailTemplate');

function avaliacaoPendenteTemplate(avaliacao) {

  const conteudo = `

    <p>
      Uma nova avaliação foi enviada na Biblioteca Nichele
      e está aguardando aprovação.
    </p>

    <h4 style="margin-top:20px;">
      Dados da Avaliação
    </h4>

    <p>
      <strong>Livro:</strong><br>
      ${avaliacao.livro}
    </p>

    <p>
      <strong>Aluno:</strong><br>
      ${avaliacao.aluno}
    </p>

    <p>
      <strong>Estrelas:</strong><br>
      ${avaliacao.estrelas} estrela(s)
    </p>

    <p>
      <strong>Comentário:</strong><br>
      ${avaliacao.comentario}
    </p>

    <p style="margin-top:25px;">
      Acesse o painel administrativo para revisar e aprovar
      a avaliação.
    </p>

  `;

  return gerarTemplateEmail({
    titulo: 'Nova avaliação pendente',
    conteudo
  });

}

module.exports = avaliacaoPendenteTemplate;