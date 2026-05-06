const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const { Ebook, Livro, Aluno, Emprestimo, EmprestimoLivro, Genero } = require('../models');

const { Sequelize } = require('sequelize');

// Rota para buscar os 5 eBooks mais recentes
router.get('/', async (req, res) => {
    try {

        const ebooks = await Ebook.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Genero,
                    attributes: ['nome'],
                    required: false
                }
            ]
        });

        // 🔥 Padroniza resposta (recomendado)
        const resultado = ebooks.map(e => ({
            id: e.id,
            titulo: e.titulo,
            autor: e.autor,
            foto: e.foto,
            url: e.url,
            genero: e.Genero?.nome || ''
        }));

        res.json(resultado);

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

        console.log('🔎 Buscando livros mais locados...');

        const livros = await Livro.findAll({
            where: {
                somaLocados: {
                    [require('sequelize').Op.gt]: 0
                }
            },
            limit: 5,
            order: [
                ['somaLocados', 'DESC']
            ]
        });

        console.log('📊 Total encontrados:', livros.length);

        // log resumido (evita poluir terminal)
        console.log('📚 Top livros:', livros.map(l => ({
            id: l.id,
            titulo: l.titulo,
            somaLocados: l.somaLocados
        })));

        if (!livros.length) {
            console.log('⚠️ Nenhum livro com somaLocados > 0 encontrado');
        }

        return res.json(livros);

    } catch (error) {
        console.error('❌ Erro ao buscar livros mais locados:', error);
        return res.status(500).json({ error: 'Erro ao buscar livros mais locados' });
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


// Rota para buscar os 3 alunos que mais locaram livros
router.get('/top-alunos-list', async (req, res) => {
  try {

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

    const alunos = await Aluno.findAll({
      where: { id: { [Op.in]: alunoIds } },
      attributes: ['id', 'nomeCompleto'],
      include: [
        {
          model: Emprestimo,
          as: 'emprestimos', // ✅ OBRIGATÓRIO
          attributes: ['id'],
          include: [
            {
              model: Livro,
              attributes: ['titulo'],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    const resultado = alunos.map(aluno => {

      const livrosSet = new Set();

      aluno.emprestimos.forEach(emp => {
        emp.Livros.forEach(livro => {
          livrosSet.add(livro.titulo);
        });
      });

      return {
        id: aluno.id,
        nomeCompleto: aluno.nomeCompleto,
        total_emprestimos: aluno.emprestimos.length,
        livros: Array.from(livrosSet)
      };
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro ao buscar os alunos com livros:', error);
    res.status(500).json({ error: 'Erro ao buscar os alunos com livros' });
  }
});


module.exports = router;

