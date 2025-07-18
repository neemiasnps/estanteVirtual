const express = require('express');
const router = express.Router();
const Ebook = require('../models/ebook');
const Livro = require('../models/livro');
const Aluno = require('../models/aluno');
const Emprestimo = require('../models/emprestimo');
const EmprestimoLivro = require('../models/emprestimo_livro');
const { Op } = require('sequelize');

const { Sequelize } = require('sequelize');

// Rota para buscar os 5 eBooks mais recentes
router.get('/', async (req, res) => {
    try {
        const ebooks = await Ebook.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        res.json(ebooks);
    } catch (error) {
        console.error('Erro ao buscar eBooks:', error);
        res.status(500).json({ error: 'Erro ao buscar eBooks' });
    }
});

// Rota para buscar os 3 eBooks mais baixados
router.get('/mais-baixados', async (req, res) => {
    try {
        const ebooks = await Ebook.findAll({
            limit: 3,
            order: [['download', 'DESC']] // Ordena por downloads em ordem decrescente
        });
        res.json(ebooks);
    } catch (error) {
        console.error('Erro ao buscar eBooks mais baixados:', error);
        res.status(500).json({ error: 'Erro ao buscar eBooks mais baixados' });
    }
});

// Rota para buscar os 5 livros mais locados
router.get('/mais-locados', async (req, res) => {
    try {
        const livros = await Livro.findAll({
            limit: 5,
            order: [['somaLocados', 'DESC']] // Ordena por somaLocados em ordem decrescente
        });
        res.json(livros);
    } catch (error) {
        console.error('Erro ao buscar livros mais locados:', error);
        res.status(500).json({ error: 'Erro ao buscar livros mais locados' });
    }
});

// Rota para buscar os 5 livros doados recentemente
router.get('/doados', async (req, res) => {
    try {
        const livros = await Livro.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']]
        });
        res.json(livros);
    } catch (error) {
        console.error('Erro ao buscar os últimos livros doados:', error);
        res.status(500).json({ error: 'Erro ao buscar os últimos livros doados' });
    }
});

// Rota para buscar os 3 alunos que mais emprestaram livros
router.get('/top-alunos-list1', async (req, res) => {
  try {
    const topAlunos = await Emprestimo.findAll({
      attributes: [
        'aluno_id',
        [Sequelize.fn('COUNT', Sequelize.col('aluno_id')), 'total_emprestimos']
      ],
      include: [
        {
          model: Aluno,
          attributes: ['nomeCompleto']
        }
      ],
      group: ['aluno_id', 'Aluno.id', 'Aluno.nomeCompleto'],
      order: [[Sequelize.literal('total_emprestimos'), 'DESC']],
      limit: 3
    });

    // Ajustar resposta para enviar um array simples com nome e total
    const resposta = topAlunos.map(item => ({
      aluno_id: item.aluno_id,
      nomeCompleto: item.Aluno.nomeCompleto,
      total_emprestimos: item.get('total_emprestimos')
    }));

    res.json(resposta);
  } catch (error) {
    console.error('Erro ao buscar top alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar top alunos' });
  }
});

router.get('/top-alunos-list2', async (req, res) => {
  try {
    // 1. Buscar os IDs dos 3 alunos que mais fizeram empréstimos
    const topAlunosRaw = await Emprestimo.findAll({
      attributes: [
        'aluno_id',
        [Sequelize.fn('COUNT', Sequelize.col('aluno_id')), 'total_emprestimos']
      ],
      group: ['aluno_id'],
      order: [[Sequelize.literal('total_emprestimos'), 'DESC']],
      limit: 3
    });

    const alunoIds = topAlunosRaw.map(item => item.aluno_id);

    if (alunoIds.length === 0) {
      return res.json([]);
    }

    // 2. Buscar os dados dos alunos e seus empréstimos com os livros
    const alunos = await Aluno.findAll({
      where: { id: { [Op.in]: alunoIds } },
      attributes: ['id', 'nomeCompleto'],
      include: [
        {
          model: Emprestimo,
          attributes: ['id'],
          include: [
            {
              model: Livro,
              attributes: ['titulo'],
              through: { attributes: [] } // oculta dados da tabela de junção
            }
          ]
        }
      ]
    });

    // 3. Montar a resposta consolidando os livros por aluno
    const resultado = alunos.map(aluno => {
      // Juntar todos os livros de todos os empréstimos do aluno
      const livrosSet = new Set();
      aluno.Emprestimos.forEach(emprestimo => {
        emprestimo.Livros.forEach(livro => livrosSet.add(livro.titulo, livro.autor));
      });

      return {
        id: aluno.id,
        nomeCompleto: aluno.nomeCompleto,
        total_emprestimos: aluno.Emprestimos.length,
        livros: Array.from(livrosSet)
      };
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro ao buscar os alunos com livros:', error);
    res.status(500).json({ error: 'Erro ao buscar os alunos com livros' });
  }
});

router.get('/top-alunos-list', async (req, res) => {
  try {
    // 1. Buscar os IDs dos 3 alunos que mais fizeram empréstimos
    const topAlunosRaw = await Emprestimo.findAll({
      attributes: [
        'aluno_id',
        [Sequelize.fn('COUNT', Sequelize.col('aluno_id')), 'total_emprestimos']
      ],
      group: ['aluno_id'],
      order: [[Sequelize.literal('total_emprestimos'), 'DESC']],
      limit: 3
    });

    const alunoIds = topAlunosRaw.map(item => item.aluno_id);

    if (alunoIds.length === 0) {
      return res.json([]);
    }

    // 2. Buscar os dados dos alunos e seus empréstimos com os livros
    const alunos = await Aluno.findAll({
      where: { id: { [Op.in]: alunoIds } },
      attributes: ['id', 'nomeCompleto'],
      include: [
        {
          model: Emprestimo,
          attributes: ['id'],
          include: [
            {
              model: Livro,
              attributes: ['titulo', 'autor', 'foto'],
              through: { attributes: [] } // oculta dados da tabela de junção
            }
          ]
        }
      ]
    });

    // 3. Montar a resposta consolidando os livros por aluno
    const resultado = alunos.map(aluno => {
      const livrosMap = new Map();

      aluno.Emprestimos.forEach(emprestimo => {
        emprestimo.Livros.forEach(livro => {
          const chave = `${livro.titulo}__${livro.autor}`;
          if (!livrosMap.has(chave)) {
            livrosMap.set(chave, {
              titulo: livro.titulo,
              autor: livro.autor,
              foto: livro.foto
            });
          }
        });
      });

      return {
        id: aluno.id,
        nomeCompleto: aluno.nomeCompleto,
        total_emprestimos: aluno.Emprestimos.length,
        livros: Array.from(livrosMap.values())
      };
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro ao buscar os alunos com livros:', error);
    res.status(500).json({ error: 'Erro ao buscar os alunos com livros' });
  }
});

module.exports = router;

