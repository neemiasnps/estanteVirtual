const gerarTemplateEmail = require('../../utils/emailTemplate');

function emprestimoFinalizadoTemplate(dados) {
  const { aluno, emprestimo, livros } = dados;

  const formatarData = (data) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const data = formatarData(
    emprestimo.dataDevolucao || new Date().toISOString().split('T')[0]
  );

  const listaLivros = livros.map(l => `
    <tr>
      <td style="padding:6px; border:1px solid #ddd;">${l.id}</td>
      <td style="padding:6px; border:1px solid #ddd;">${l.titulo}</td>
    </tr>
  `).join('');

  const conteudo = `
    <p>Prezado(a) <strong>${aluno.nome}</strong>,</p>

    <p>Seu empréstimo foi finalizado com sucesso.</p>

    <p><strong>Data da devolução:</strong> ${data}</p>

    <h4>Livros devolvidos:</h4>

    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <th style="border:1px solid #ddd;">ID</th>
        <th style="border:1px solid #ddd;">Título</th>
      </tr>
      ${listaLivros}
    </table>

    <p style="margin-top:20px;">
      Agradecemos pela utilização da Biblioteca Nichele.
    </p>
  `;

  return gerarTemplateEmail({
    titulo: 'Empréstimo Finalizado',
    conteudo
  });
}

module.exports = emprestimoFinalizadoTemplate;