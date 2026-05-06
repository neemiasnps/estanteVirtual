const obterDadosEmprestimo = require('../utils/obterDadosEmprestimo');

function formatarData(data) {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR');
}

function calcularStatus(livro) {
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

async function gerarMensagemWhatsEmprestimo(emprestimoId) {

  const dados = await obterDadosEmprestimo(emprestimoId);

  const { aluno, emprestimo, livros = [] } = dados;

  let mensagem = `📚 *Biblioteca Nichele*\n\n`;

  mensagem += `Olá *${aluno.nome}*, tudo bem?\n\n`;

  mensagem += `Seu empréstimo foi registrado com sucesso.\n\n`;

  mensagem += `📌 *Dados do Empréstimo*\n`;
  mensagem += `Nº: ${emprestimo.id}\n`;
  mensagem += `Data: ${formatarData(emprestimo.dataSolicitacao)}\n\n`;

  mensagem += `👤 *Aluno*\n`;
  mensagem += `Nome: ${aluno.nome}\n`;
  mensagem += `Loja: ${aluno.loja || '-'}\n\n`;

  mensagem += `📖 *Livros*\n`;

  livros.forEach(livro => {
    mensagem += `\n• ${livro.titulo}`;
    mensagem += `\n  Retirada: ${formatarData(livro.data_retirada)}`;
    mensagem += `\n  Prazo: ${livro.prazo_dias} dias`;
    mensagem += `\n  Devolução: ${formatarData(livro.data_devolucao_prevista)}\n`;
    mensagem += `\n  Status: *${calcularStatus(livro)}*\n`;
  });

  mensagem += `\n📌 *Informações importantes*\n`;
  mensagem += `- Prazo padrão: 40 dias\n`;
  mensagem += `- Caso precise de mais tempo, procure o T&D\n`;
  mensagem += `- Em caso de extravio, taxa de R$ 30,00\n`;
  mensagem += `- Pode ser descontado em folha ou rescisão\n`;
  mensagem += `- Lembretes serão enviados automaticamente\n`;

  return {
    telefone: aluno.telefone,
    mensagem
  };
}

module.exports = {
  gerarMensagemWhatsEmprestimo
};