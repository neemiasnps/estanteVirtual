const gerarTemplateEmail = require('../../utils/emailTemplate');

function comporEmailEmprestimoCriado(dados) {
  const { aluno, emprestimo, livros } = dados;

  function formatarData(data) {
    if (!data) return '-';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  const linhasLivros = livros.map(livro => `
    <tr>
      <td style="padding:6px; border:1px solid #e0e0e0;">${livro.id}</td>
      <td style="padding:6px; border:1px solid #e0e0e0;">${livro.titulo}</td>
      <td style="padding:6px; border:1px solid #e0e0e0;">${formatarData(livro.data_retirada)}</td>
      <td style="padding:6px; border:1px solid #e0e0e0;">${livro.prazo_dias} dias</td>
      <td style="padding:6px; border:1px solid #e0e0e0;">${formatarData(livro.data_devolucao_prevista)}</td>
    </tr>
  `).join('');

  const conteudo = `
    <p>Prezado(a) <strong>${aluno.nome}</strong>,</p>

    <p>Seu empréstimo foi registrado com sucesso.</p>

    <p><strong>Loja:</strong> ${aluno.loja || 'Não informada'}</p>
    <p><strong>Celular:</strong> ${aluno.telefone || 'Não informado'}</p>

    <h4 style="margin-top:20px;">Detalhes do Empréstimo</h4>

    <p><strong>Nº da Solicitação:</strong> ${emprestimo.id}</p>
    <p><strong>Data da Solicitação:</strong> ${formatarData(emprestimo.dataSolicitacao)}</p>
    <p><strong>Observação:</strong><br>${emprestimo.observacao || 'Não informada'}</p>

    <h4 style="margin-top:20px;">Livros Emprestados</h4>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
      <tr style="background:#f1f5f9;">
        <th style="padding:6px; border:1px solid #e0e0e0;">ID</th>
        <th style="padding:6px; border:1px solid #e0e0e0;">Livro</th>
        <th style="padding:6px; border:1px solid #e0e0e0;">Retirada</th>
        <th style="padding:6px; border:1px solid #e0e0e0;">Prazo</th>
        <th style="padding:6px; border:1px solid #e0e0e0;">Devolução</th>
      </tr>
      ${linhasLivros}
    </table>

    <h4 style="margin-top:25px;">Informações Importantes</h4>

    <ul style="padding-left:18px;">
      <li>O prazo padrão de empréstimo é de <strong>40 dias</strong>.</li>
      <li>Se precisar de mais tempo, solicite ao setor de <strong>T&D</strong>.</li>
      <li>Em caso de extravio, será cobrada uma taxa simbólica de <strong>R$ 30,00</strong>, podendo ser descontada em folha ou rescisão.</li>
      <li>Você receberá lembretes automáticos <strong>5 dias antes</strong> e <strong>no dia da devolução</strong>.</li>
    </ul>

    <p style="margin-top:20px;">
      Em caso de dúvidas, entre em contato com o setor responsável.
    </p>
  `;

  return gerarTemplateEmail({
    titulo: 'Empréstimo Registrado com Sucesso',
    conteudo
  });
}

module.exports = comporEmailEmprestimoCriado;