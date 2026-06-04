const { Emprestimo, EmprestimoLivro, Aluno, Livro } = require('../models');

/* =========================
   FORMATADOR DE DATA SEGURO
========================= */
function formatarData(data) {
  if (!data) return '-';

  const d = new Date(data);
  if (isNaN(d.getTime())) return '-';

  return d.toISOString().split('T')[0];
}

/* =========================
   VALIDAÇÃO DE ID (ROBUSTA)
========================= */
function validarId(id) {
  if (id === null || id === undefined) return false;
  if (typeof id === 'object') return false;

  const n = Number(id);
  return !isNaN(n) && n > 0;
}

function extrairIdSeguro(valor) {
  if (!valor) return null;

  if (typeof valor === 'number') return valor;

  if (typeof valor === 'string') {
    const n = Number(valor);
    return isNaN(n) ? null : n;
  }

  if (typeof valor === 'object') {
    return valor.id || valor.emprestimo?.id || null;
  }

  return null;
}

/* =========================
   EMPRESTIMO COMPLETO
========================= */
async function obterDadosEmprestimo(emprestimoId) {
      try {

        const id = extrairIdSeguro(emprestimoId);

        if (!id) {
          throw new Error(`ID inválido: ${JSON.stringify(emprestimoId)}`);
        }

    //const emprestimo = await Emprestimo.findByPk(emprestimoId, {
      const emprestimo = await Emprestimo.findByPk(id, {
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
      throw new Error(`Empréstimo não encontrado: ${emprestimoId}`);
    }

    const itens = Array.isArray(emprestimo.itens) ? emprestimo.itens : [];

    const livros = itens.map(item => ({
      id: item?.Livro?.id || null,
      titulo: item?.Livro?.titulo || 'Não informado',
      data_retirada: formatarData(item.data_retirada),
      prazo_dias: item.prazo_dias || 0,
      data_devolucao_prevista: formatarData(item.data_devolucao_prevista),
      data_devolucao_real: formatarData(item.data_devolucao_real),
      status: item.status || 'pendente'
    }));

    return {
      aluno: {
        id: emprestimo.aluno?.id || null,
        nome: emprestimo.aluno?.nomeCompleto || 'Não informado',
        email: emprestimo.aluno?.email || '',
        telefone: emprestimo.aluno?.celular || '',
        loja: emprestimo.aluno?.loja || 'Não informado'
      },
      emprestimo: {
        id: emprestimo.id,
        chat_id: emprestimo.chat_id,
        dataSolicitacao: formatarData(emprestimo.data_solicitacao),
        quantidadeLivros: emprestimo.quantidade_livros || livros.length,
        observacao: emprestimo.observacao || ''
      },
      livros
    };

  } catch (error) {
    console.error('Erro ao obter dados do empréstimo:', error.message);
    throw error;
  }
}


/* =========================
   ITEM INDIVIDUAL
========================= */
async function obterDadosEmprestimoPorItem(itemId) {
  try {

    if (!validarId(itemId)) {
      throw new Error(`ID inválido do item: ${JSON.stringify(itemId)}`);
    }

    const item = await EmprestimoLivro.findByPk(itemId, {
      include: [
        {
          model: Emprestimo,
          include: [
            {
              model: Aluno,
              as: 'aluno',
              attributes: ['id', 'nomeCompleto', 'email', 'celular', 'loja']
            }
          ]
        },
        {
          model: Livro,
          attributes: ['id', 'titulo']
        }
      ]
    });

    if (!item) {
      throw new Error(`Item não encontrado: ${itemId}`);
    }

    return {
      aluno: {
        id: item.Emprestimo?.aluno?.id || null,
        nome: item.Emprestimo?.aluno?.nomeCompleto || 'Não informado',
        email: item.Emprestimo?.aluno?.email || '',
        telefone: item.Emprestimo?.aluno?.celular || '',
        loja: item.Emprestimo?.aluno?.loja || 'Não informado'
      },
      emprestimo: {
        id: item.Emprestimo?.id || null,
        chat_id: item.Emprestimo?.chat_id || null,
        dataSolicitacao: formatarData(item.Emprestimo?.data_solicitacao)
      },
      livro: {
        id: item.livro_id,
        titulo: item.Livro?.titulo || 'Não informado',
        status: item.status || 'pendente',
        data_retirada: formatarData(item.data_retirada),
        data_devolucao_prevista: formatarData(item.data_devolucao_prevista),
        data_devolucao_real: formatarData(item.data_devolucao_real)
      }
    };

  } catch (error) {
    console.error('Erro ao obter dados do item:', error.message);
    throw error;
  }
}

module.exports = {
  obterDadosEmprestimo,
  obterDadosEmprestimoPorItem
};