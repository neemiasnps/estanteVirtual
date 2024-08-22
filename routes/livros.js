const express = require('express');
const router = express.Router();
const Livro = require('../models/livro');
const Estoque = require('../models/estoque'); // Modelo de Estoque
const Emprestimo = require('../models/emprestimo');
const { Op } = require('sequelize');

// Listar todos os livros
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const offset = (page - 1) * limit;

        const { rows: livros, count } = await Livro.findAndCountAll({
            include: [Estoque], // Incluindo dados de estoque
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.json({ livros, totalPages });
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro ao buscar livros' });
    }
});

// Criar um novo livro
router.post('/', async (req, res) => {
    const { titulo, autor, genero, anoPublicacao, editora, sinopse, foto, gentileza, situacao } = req.body;
    try {
        const novoLivro = await Livro.create({ 
            titulo, 
            autor, 
            genero, 
            anoPublicacao, 
            editora, 
            sinopse, 
            foto, 
            gentileza, 
            situacao 
        });
        res.status(201).json({ success: true, livro: novoLivro }); // Incluído success
    } catch (err) {
        console.error('Erro ao criar livro:', err);
        res.status(500).json({ success: false, message: 'Erro ao criar livro' }); // Incluído success e message
    }
});

// Atualizar um livro
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, autor, genero, anoPublicacao, editora, sinopse, foto, gentileza, situacao } = req.body;
    try {
        const livro = await Livro.findByPk(id);
        if (livro) {
            livro.titulo = titulo;
            livro.autor = autor;
            livro.genero = genero;
            livro.anoPublicacao = anoPublicacao;
            livro.editora = editora;
            livro.sinopse = sinopse;
            livro.foto = foto;
            livro.gentileza = gentileza;
            livro.situacao = situacao;
            await livro.save();
            res.json(livro);
        } else {
            res.status(404).json({ error: 'Livro não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(500).json({ error: 'Erro ao atualizar livro' });
    }
});

// Rota para buscar detalhes de um livro por ID
router.get('/:id', (req, res, next) => {
    const livroId = req.params.id;

    Livro.findByPk(livroId)
        .then(livro => {
            if (!livro) {
                res.status(404).json({ error: 'Livro não encontrado' });
            } else {
                res.json(livro);
            }
        })
        .catch(err => {
            console.error('Erro ao buscar detalhes do livro:', err);
            res.status(500).json({ error: 'Erro interno ao buscar detalhes do livro' });
        });
});

// Rota para buscar livros com base na consulta
router.get('/search', (req, res) => {
    const query = req.query.query;
    const sql = 'SELECT titulo FROM livros WHERE titulo LIKE ? LIMIT 10';

    db.query(sql, [`%${query}%`], (err, results) => {
        if (err) {
            console.error('Erro na consulta:', err);
            res.status(500).json({ error: 'Erro na consulta' });
            return;
        }

        res.json({ livros: results });
    });
});

// Rota para buscar detalhes de um livro por título
router.get('/livro/:titulo', async (req, res) => {
    const titulo = req.params.titulo;
    try {
        const livro = await Livro.findOne({
            where: { titulo },
            include: [Estoque] // Inclui o modelo Estoque
        });
        if (livro) {
            res.json(livro);
        } else {
            res.status(404).json({ error: 'Livro não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({ error: 'Erro interno ao buscar livro' });
    }
});

// Excluir ou atualizar disponibilidade de um livro
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const livro = await Livro.findByPk(id);

        if (!livro) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        // Verificar se o livro está associado a algum empréstimo
        const emprestimos = await Emprestimo.findAll({
            include: {
                model: Livro,
                where: { id: id }
            }
        });

        if (emprestimos.length > 0) {
            // Se o livro está em algum empréstimo, marque-o como 'indisponível'
            livro.situacao = 'indisponível';
            await livro.save();
            return res.json({ message: 'Livro marcado como indisponível' });
        } else {
            // Se não há empréstimos associados, exclua o livro
            await livro.destroy();
            return res.json({ message: 'Livro excluído com sucesso' });
        }
    } catch (error) {
        console.error('Erro ao excluir livro:', error);
        res.status(500).json({ error: 'Erro ao excluir livro' });
    }
});

// Rota para buscar livros pelo título
router.get('/buscar-titulo/:titulo', async (req, res) => {
    const titulo = req.params.titulo;

    try {
        const livros = await Livro.findAll({
            where: {
                titulo: {
                    [Op.like]: `%${titulo}%` // Filtro LIKE, ignorando maiúsculas e minúsculas
                }
            },
            attributes: ['id', 'titulo', 'autor', 'genero', 'situacao']
        });

        if (livros.length > 0) {
            res.json(livros);
        } else {
            res.status(404).json({ message: 'Nenhum livro encontrado com o título fornecido.' });
        }
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota de busca de livros pagina index
router.get('/buscar/:titulo', async (req, res) => {
    const titulo = req.params.titulo;

    try {
        const livros = await Livro.findAll({
            where: {
                titulo: {
                    [Op.like]: `%${titulo}%` // Filtro LIKE, ignorando maiúsculas e minúsculas
                }
            },
            attributes: ['id', 'titulo', 'autor', 'genero', 'sinopse', 'foto','situacao'],
            include: [Estoque], // Incluindo dados de estoque
        });

        if (livros.length > 0) {
            res.json(livros);
        } else {
            res.status(404).json({ message: 'Nenhum livro encontrado com o título fornecido.' });
        }
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
