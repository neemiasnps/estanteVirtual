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
  
        <td style="padding:6px; border:1px solid #ddd;">
          ${l.titulo}
        </td>
  
        <td style="padding:6px; border:1px solid #ddd; text-align:center; width:120px;">
  
          <a 
            href="https://bibliotecanichele.com.br/livro/${l.id}"
            target="_blank"
            style="
              background:#f9a825;
              color:#000;
              padding:6px 10px;
              text-decoration:none;
              border-radius:4px;
              display:inline-block;
              font-size:12px;
            "
          >
            Avaliar livro
          </a>
  
        </td>
  
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
          <th style="border:1px solid #ddd; width:120px; text-align:center;">Ação</th>
        </tr>
  
        ${listaLivros}
      </table>
  
      <p style="margin-top:20px;">
        Agora você pode avaliar os livros e ajudar outros colaboradores.
      </p>
  
      <p>
        Obrigado por utilizar a Biblioteca Nichele.
      </p>
    `;
  
    return gerarTemplateEmail({
      titulo: 'Empréstimo Finalizado',
      conteudo
    });
  }
  
  module.exports = emprestimoFinalizadoTemplate;