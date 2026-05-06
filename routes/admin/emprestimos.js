const express = require('express');
const path = require('path');
const { Op } = require('sequelize');

const sequelize = require('../../config/database');

const router = express.Router();

const { Emprestimo, EmprestimoLivro, Aluno, Livro, Estoque } = require('../../models');

const { enviarEmailEmprestimoFinalizado, enviarEmailEmprestimoCriado } = require('../../services/emailService');
const { gerarMensagemWhatsEmprestimo } = require('../../services/whatsService');

const garantirAutenticado = require('../auth');

/* =========================
   VIEW
========================= */
router.get('/gerenciar_emprestimos', garantirAutenticado, (req, res) => {
  res.sendFile(path.join(__dirname, '../../views/gerenciar_emprestimos.html'));
});


/* =========================
   LISTAR COM PAGINAÇÃO + FILTROS
========================= */
router.get('/', async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filtroNome = req.query.nome || '';
    const filtroStatus = req.query.status || '';

    const whereAluno = filtroNome
      ? {
          nomeCompleto: {
            [Op.like]: `%${filtroNome}%`
          }
        }
      : {};

    // 🔴 Busca completa (necessário para regra de status)
    const emprestimos = await Emprestimo.findAll({
      include: [
        {
          model: Aluno,
          as: 'aluno',
          attributes: ['id', 'nomeCompleto'],
          where: whereAluno,
          required: !!filtroNome
        },
        {
          model: EmprestimoLivro,
          as: 'itens',
          required: false,
          include: [{ model: Livro }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // =========================
    // TRATAMENTO
    // =========================
    let resultado = emprestimos.map(emp => {

      const itensTratados = (emp.itens || []).map(i => {

        const hoje = new Date();
        const previsto = new Date(i.data_devolucao_prevista);

        let status = i.status;

        if (!i.data_devolucao_real && hoje > previsto && status !== 'devolvido') {
          status = 'atrasado';
        }

        return {
          id: i.id,
          livro: i.Livro,
          data_retirada: i.data_retirada,
          data_devolucao_prevista: i.data_devolucao_prevista,
          prazo_dias: i.prazo_dias,
          status
        };
      });

      // 📌 Status geral
      let statusGeral = 'em andamento';

      if (!itensTratados.length) {
        statusGeral = 'vazio';

      } else if (itensTratados.some(i => i.status === 'cancelado')) {
        statusGeral = 'cancelado';

      } else if (itensTratados.some(i => i.status === 'extraviado')) {
        statusGeral = 'extraviado';

      } else if (itensTratados.some(i => i.status === 'indenizado')) {
        statusGeral = 'indenizado';

      } else if (itensTratados.some(i => i.status === 'atrasado')) {
        statusGeral = 'atrasado';

      } else if (itensTratados.every(i => i.status === 'devolvido')) {
        statusGeral = 'finalizado';

      } else if (itensTratados.some(i => i.status === 'pendente')) {
        statusGeral = 'pendente';
      }

      return {
        id: emp.id,
        aluno: emp.aluno?.nomeCompleto || 'Não informado',
        quantidade_livros: emp.quantidade_livros,
        data_solicitacao: emp.data_solicitacao,
        statusGeral,
        itens: itensTratados
      };
    });

    // =========================
    // FILTRO STATUS
    // =========================
    if (filtroStatus) {
      resultado = resultado.filter(e => e.statusGeral === filtroStatus);
    }

    // =========================
    // PAGINAÇÃO
    // =========================
    const total = resultado.length;
    const totalPages = Math.ceil(total / limit);

    const start = (page - 1) * limit;
    const paginado = resultado.slice(start, start + limit);

    return res.json({
      data: paginado,
      total,
      totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao listar empréstimos' });
  }
});

router.get('/item/:id', async (req, res) => {
  try {

    const item = await EmprestimoLivro.findByPk(req.params.id, {
      include: [{ model: Livro }]
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    return res.json({
      id: item.id,
      livro: item.Livro?.titulo,
      data_retirada: item.data_retirada,
      prazo_dias: item.prazo_dias
    });

  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar item' });
  }
});


/* =========================
   CRIAR EMPRÉSTIMO
========================= */
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {

    const { aluno_id, data_solicitacao, descricao, livros } = req.body;

    if (!aluno_id || !data_solicitacao || !livros?.length) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const dataSol = new Date(data_solicitacao);
    if (isNaN(dataSol.getTime())) {
      return res.status(400).json({ error: 'Data inválida' });
    }

    const emprestimo = await Emprestimo.create({
      aluno_id,
      data_solicitacao,
      quantidade_livros: livros.length,
      observacao: descricao || null
    }, { transaction });

    // Atualiza estoque
    for (const livro of livros) {

      const estoque = await Estoque.findOne({
        where: { livro_id: livro.id },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!estoque || estoque.estoque_disponivel < 1) {
        throw new Error(`Livro ${livro.id} sem estoque`);
      }

      estoque.estoque_locado += 1;
      estoque.estoque_disponivel -= 1;

      await estoque.save({ transaction });
    }

    // Insere itens
    const itens = livros.map(livro => {

      const dataBase = new Date(livro.data_retirada);
      if (isNaN(dataBase.getTime())) {
        throw new Error(`Data inválida para livro ${livro.id}`);
      }

      const prazo = Number(livro.prazo_dias || 40);
      const dataPrevista = new Date(dataBase);
      dataPrevista.setDate(dataPrevista.getDate() + prazo);

      return {
        emprestimo_id: emprestimo.id,
        livro_id: livro.id,
        data_retirada: livro.data_retirada,
        prazo_dias: prazo,
        data_devolucao_prevista: dataPrevista.toISOString().split('T')[0],
        status: 'pendente',
        observacao: livro.observacao || null
      };
    });

    await EmprestimoLivro.bulkCreate(itens, { transaction });

    await transaction.commit();

    return res.json({ message: 'Empréstimo criado com sucesso' });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
});


/* =========================
   ENVIAR E-MAIL
   ========================= */
router.post('/enviar-email/:id', async (req, res) => {
  try {

    const emprestimoId = req.params.id;

    await enviarEmailEmprestimoCriado(emprestimoId);

    return res.json({ message: 'E-mail enviado com sucesso' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: error.message || 'Erro ao enviar e-mail'
    });
  }
});


/* =========================
   GERAR WHATSAPP
   ========================= */
router.get('/whatsapp/:id', async (req, res) => {
  try {
    const mensagem = await gerarMensagemWhatsEmprestimo(req.params.id);

    return res.json(mensagem);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao gerar mensagem' });
  }
});


/* =========================
   AÇÕES DOS ITENS
========================= */

router.put('/livro/:id/finalizar', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const item = await EmprestimoLivro.findByPk(req.params.id, { transaction });

    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    const jaDevolvido = item.status === 'devolvido';

    if (jaDevolvido) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Item já devolvido' });
    }

    // Atualiza item
    item.status = 'devolvido';
    item.data_devolucao_real = new Date();
    await item.save({ transaction });

    // Atualiza estoque
    const estoque = await Estoque.findOne({
      where: { livro_id: item.livro_id },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (estoque) {
      if (estoque.estoque_locado > 0) {
        estoque.estoque_locado -= 1;
      }

      estoque.estoque_disponivel += 1;

      await estoque.save({ transaction });
    }

    // ✅ SOMA APENAS NA TRANSIÇÃO PARA DEVOLVIDO
    await Livro.increment('somaLocados', {
      by: 1,
      where: { id: item.livro_id },
      transaction
    });

    await transaction.commit();

    // Enviar e-mail
    enviarEmailEmprestimoFinalizado(item.emprestimo_id)
      .catch(err => console.error(err));

    return res.json({ message: 'Devolução registrada com sucesso' });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: 'Erro ao finalizar devolução' });
  }
});

router.put('/livro/:id/cancelar', async (req, res) => {

  const transaction = await sequelize.transaction();

  try {

    const item = await EmprestimoLivro.findByPk(req.params.id, { transaction });

    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // ❗ Evita reprocessamento
    if (item.status === 'cancelado' || item.status === 'devolvido') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Item já processado' });
    }

    // =========================
    // ATUALIZA ITEM
    // =========================
    item.status = 'cancelado';
    await item.save({ transaction });

    // =========================
    // AJUSTA ESTOQUE
    // =========================
    const estoque = await Estoque.findOne({
      where: { livro_id: item.livro_id },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (estoque) {

      if (estoque.estoque_locado > 0) {
        estoque.estoque_locado -= 1;
      }

      estoque.estoque_disponivel += 1;

      await estoque.save({ transaction });
    }

    await transaction.commit();

    return res.json({ message: 'Cancelado com sucesso' });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: 'Erro ao cancelar' });
  }
});

router.put('/livro/:id/extraviado', async (req, res) => {

  const transaction = await sequelize.transaction();

  try {

    const item = await EmprestimoLivro.findByPk(req.params.id, { transaction });

    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // ❗ evita duplicidade
    if (item.status === 'extraviado') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Já marcado como extraviado' });
    }

    // =========================
    // ATUALIZA ITEM
    // =========================
    item.status = 'extraviado';
    item.valor_indenizacao = 30.00; // padrão simbólico
    item.observacao = 'Livro extraviado - cobrança simbólica';
    await item.save({ transaction });

    // =========================
    // ESTOQUE (IMPORTANTE)
    // =========================
    const estoque = await Estoque.findOne({
      where: { livro_id: item.livro_id },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (estoque) {

      // NÃO retorna ao disponível (livro perdido)
      if (estoque.estoque_locado > 0) {
        estoque.estoque_locado -= 1;
      }

      // opcional: NÃO aumenta disponível
      // estoque não volta ao sistema até reposição física

      await estoque.save({ transaction });
    }

    await transaction.commit();

    return res.json({ message: 'Livro marcado como extraviado' });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

router.put('/livro/:id/editar', async (req, res) => {
  try {

    const { prazo_dias } = req.body;

    const item = await EmprestimoLivro.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    const dataBase = new Date(item.data_retirada);

    const dataPrevista = new Date(dataBase);
    dataPrevista.setDate(dataPrevista.getDate() + Number(prazo_dias));

    item.prazo_dias = prazo_dias;
    item.data_devolucao_prevista = dataPrevista;

    await item.save();

    return res.json({ message: 'Atualizado com sucesso' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

router.put('/livro/:id/indenizar', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { valor, observacao } = req.body;

    const item = await EmprestimoLivro.findByPk(req.params.id, { transaction });

    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Atualiza status + dados financeiros
    item.status = 'indenizado';
    item.valor_indenizacao = valor || null;
    item.observacao = observacao || item.observacao;

    await item.save({ transaction });

    // ⚠️ NÃO mexe no estoque (regra definida)

    await transaction.commit();

    return res.json({ message: 'Indenização registrada com sucesso' });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ error: 'Erro ao indenizar item' });
  }
});

module.exports = router;