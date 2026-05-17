const { obterDadosEmprestimo, obterDadosEmprestimoPorItem } = require('../utils/obterDadosEmprestimo');

/* =========================
   UTILITÁRIOS
========================= */

function formatarData(data) {
  if (!data) return '-';

  const d = new Date(data);
  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('pt-BR');
}

function calcularStatus(livro) {
  if (!livro) return '-';

  if (livro.status === 'devolvido') return 'Devolvido';
  if (livro.status === 'extraviado') return 'Extraviado';
  if (livro.status === 'indenizado') return 'Indenizado';

  const hoje = new Date();
  const prevista = new Date(livro.data_devolucao_prevista);

  if (!livro.data_devolucao_real && hoje > prevista) {
    return 'Atrasado';
  }

  return 'Pendente';
}

function calcularDiasAtraso(dataPrevista) {
  if (!dataPrevista) return 0;

  const hoje = new Date();
  const prevista = new Date(dataPrevista);

  const diff = hoje - prevista;

  if (diff <= 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/* =========================
   MENSAGEM: EMPRÉSTIMO CRIADO
========================= */

async function gerarMensagemWhatsEmprestimo(emprestimoId) {

  const dados = await obterDadosEmprestimo(emprestimoId);
  const { aluno, emprestimo, livros = [] } = dados;

  let mensagem = `📚 *Biblioteca Nichele*\n\n`;

  mensagem += `Olá *${aluno?.nome || '-'}*, tudo bem?\n\n`;
  mensagem += `Seu empréstimo foi registrado com sucesso.\n\n`;

  mensagem += `📌 *Dados do Empréstimo*\n`;
  mensagem += `Nº: ${emprestimo?.id || '-'}\n`;
  mensagem += `Data: ${formatarData(emprestimo?.dataSolicitacao)}\n\n`;

  mensagem += `👤 *Aluno*\n`;
  mensagem += `Nome: ${aluno?.nome || '-'}\n`;
  mensagem += `Loja: ${aluno?.loja || '-'}\n\n`;

  mensagem += `📖 *Livros*\n`;

  livros.forEach(livro => {
    mensagem += `\n• ${livro.titulo || '-'}`;
    mensagem += `\n  Retirada: ${formatarData(livro.data_retirada)}`;
    mensagem += `\n  Prazo: ${livro.prazo_dias || '-'} dias`;
    mensagem += `\n  Devolução: ${formatarData(livro.data_devolucao_prevista)}`;
    mensagem += `\n  Status: *${calcularStatus(livro)}*\n`;
  });

  mensagem += `\n📌 *Informações importantes*\n`;
  mensagem += `- Prazo padrão: 40 dias\n`;
  mensagem += `- Procure o T&D para prorrogação\n`;
  mensagem += `- Extravio pode gerar reposição\n`;
  mensagem += `- Lembretes automáticos serão enviados\n`;

  return {
    telefone: aluno?.telefone,
    mensagem
  };
}

/* =========================
   MENSAGEM: AVALIAÇÃO
========================= */

async function gerarMensagemWhatsAvaliacao(itemId) {

  const dados = await obterDadosEmprestimoPorItem(itemId);
  const { aluno, livro } = dados;

  let mensagem = `📚 *Biblioteca Nichele*\n\n`;

  mensagem += `Olá *${aluno?.nome || '-'}*, tudo bem?\n\n`;
  mensagem += `O livro *${livro?.titulo || '-'}* foi devolvido com sucesso. 🎉\n\n`;
  mensagem += `Agora você pode avaliá-lo e ajudar outros colaboradores.\n\n`;

  mensagem += `⭐ Avaliar livro:\n`;
  mensagem += `https://bibliotecanichele.com.br/livro/${livro?.id}\n\n`;

  mensagem += `🙏 Sua opinião é muito importante!`;

  return {
    telefone: aluno?.telefone,
    mensagem
  };
}

/* =========================
   TEMPLATE: NOVO EMPRÉSTIMO
========================= */

async function gerarTemplateNovoEmprestimo(dados) {

  const aluno = dados.aluno || {};
  const emprestimo = dados.emprestimo || {};
  const livros = Array.isArray(dados.livros) ? dados.livros : [];

  const livrosTexto = livros.slice(0, 5).map(livro =>
    `- ${livro.titulo || '-'} | Devolução: ${formatarData(livro.data_devolucao_prevista) || '-'}`
  ).join(' | ');

  return {
    templateId: 'xWHpyzLHFtD1',
    templateTokens: [
      aluno.nome || '',
      String(emprestimo.id || ''),
      formatarData(emprestimo.dataSolicitacao),
      aluno.loja || '',
      livrosTexto || '-'
    ]
  };
}

/* =========================
   TEMPLATE: FINALIZADO
========================= */

async function gerarTemplateEmprestimoFinalizado(dados) {

  const { aluno, livro } = dados;

  const link = `https://bibliotecanichele.com.br/livro/${livro.id}`;

  return {
    templateId: 'd5JSImU3SipB',
    templateTokens: [
      aluno?.nome || '',
      livro?.titulo || '',
      link
    ]
  };
}

/* =========================
   TEMPLATE: LEMBRETE
========================= */

async function gerarTemplateLembreteEmprestimo(dados) {

  const { aluno, livro } = dados;

  return {
    templateId: 'VV58IHdAppiB',
    templateTokens: [
      aluno?.nome || '',
      livro?.titulo || '',
      formatarData(livro?.data_devolucao_prevista)
    ]
  };
}

/* =========================
   TEMPLATE: DEVOLUÇÃO HOJE
========================= */

async function gerarTemplateDevolucaoHoje(dados) {

  const { aluno, livro } = dados;

  return {
    templateId: 'hkQxRuPy8Sot',
    templateTokens: [
      aluno?.nome || '',
      livro?.titulo || ''
    ]
  };
}

/* =========================
   TEMPLATE: ATRASO
========================= */

async function gerarTemplateEmprestimoAtrasado(dados) {

  const { aluno, livro } = dados;

  return {
    templateId: 'euRcanEjA0v8',
    templateTokens: [
      aluno?.nome || '',
      livro?.titulo || '-',
      formatarData(livro?.data_devolucao_prevista),
      calcularDiasAtraso(livro?.data_devolucao_prevista),
      formatarData(new Date())
    ]
  };
}

module.exports = {
  gerarMensagemWhatsEmprestimo,
  gerarMensagemWhatsAvaliacao,
  gerarTemplateNovoEmprestimo,
  gerarTemplateEmprestimoFinalizado,
  gerarTemplateLembreteEmprestimo,
  gerarTemplateDevolucaoHoje,
  gerarTemplateEmprestimoAtrasado
};