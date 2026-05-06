const { Emprestimo, EmprestimoLivro, Aluno, Livro } = require('../models');

function formatarData(data) {
  if (!data) return null;

  const d = new Date(data);
  if (isNaN(d.getTime())) return null;

  return d.toISOString().split('T')[0];
}

async function obterDadosEmprestimo(emprestimoId) {
  try {
    const emprestimo = await Emprestimo.findByPk(emprestimoId, {
      include: [
        {
          model: Aluno,
          as: 'aluno',
          attributes: ['id', 'nomeCompleto', 'email', 'celular', 'loja']
        },
        {
          model: EmprestimoLivro,
          as: 'itens',
          include: [
            {
              model: Livro,
              attributes: ['id', 'titulo']
            }
          ]
        }
      ]
    });

    if (!emprestimo) {
      throw new Error('Empréstimo não encontrado');
    }

    // =========================
    // TRATAMENTO DOS LIVROS
    // =========================
    const livros = (emprestimo.itens || []).map(item => ({
      id: item.livro_id,
      titulo: item.Livro?.titulo || 'Não informado',
      data_retirada: formatarData(item.data_retirada),
      prazo_dias: item.prazo_dias,
      data_devolucao_prevista: formatarData(item.data_devolucao_prevista),
      data_devolucao_real: formatarData(item.data_devolucao_real),
      status: item.status
    }));

    // =========================
    // RETORNO PADRÃO
    // =========================
    return {
      aluno: {
        nome: emprestimo.aluno?.nomeCompleto || 'Não informado',
        email: emprestimo.aluno?.email || '',
        telefone: emprestimo.aluno?.celular || '',
        loja: emprestimo.aluno?.loja || 'Não informado'
      },
      emprestimo: {
        id: emprestimo.id,
        dataSolicitacao: formatarData(emprestimo.data_solicitacao),
        quantidadeLivros: emprestimo.quantidade_livros,
        observacao: emprestimo.observacao || ''
      },
      livros
    };

  } catch (error) {
    console.error('Erro ao obter dados do empréstimo:', error);
    throw error;
  }
}

module.exports = obterDadosEmprestimo;