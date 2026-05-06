const gerarTemplateEmail = require('../../utils/emailTemplate');

function contatoTemplate(dados) {
  const { nome, email, celular, mensagem } = dados;

  const conteudo = `
    <p>Nova mensagem recebida pelo canal de contato da <strong>Biblioteca Nichele</strong>.</p>

    <h4 style="margin-top:20px;">Dados do remetente</h4>

    <p><strong>Nome:</strong> ${nome}</p>
    <p><strong>E-mail:</strong> ${email}</p>
    <p><strong>Celular:</strong> ${celular || '-'}</p>

    <h4 style="margin-top:20px;">Mensagem</h4>

    <div style="
      padding:12px;
      border:1px solid #e0e0e0;
      background:#f9fafb;
      border-radius:6px;
      white-space:pre-line;
    ">
      ${mensagem}
    </div>

    <h4 style="margin-top:25px;">Orientações</h4>

    <ul style="padding-left:18px;">
      <li>Responder dentro do prazo padrão de atendimento.</li>
      <li>Registrar o contato no sistema, se necessário.</li>
      <li>Manter comunicação clara e objetiva.</li>
    </ul>
  `;

  return gerarTemplateEmail({
    titulo: 'Novo Contato Recebido',
    conteudo
  });
}

module.exports = contatoTemplate;