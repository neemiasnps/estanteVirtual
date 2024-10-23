const express = require('express');
const router = express.Router();
const Livro = require('../models/ebook');
const { Op } = require('sequelize');

// Listar todos os livros
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const offset = (page - 1) * limit;

        const { rows: livros, count } = await Livro.findAndCountAll({
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

// Listar todos os livros no auto-complete
router.get('/auto-livros', async (req, res) => {
    try {
        const livros = await Livro.findAll();
        res.json(livros);
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro ao buscar livros' });
    }
});

// Criar um novo livro
router.post('/', async (req, res) => {
    const { titulo, autor, genero, anoPublicacao, editora, sinopse, foto, url, situacao } = req.body;
    try {
        const novoLivro = await Livro.create({ 
            titulo, 
            autor, 
            genero, 
            anoPublicacao, 
            editora, 
            sinopse, 
            foto, 
            url, 
            situacao 
        });
        res.status(201).json({ success: true, livro: novoLivro });
    } catch (err) {
        console.error('Erro ao criar livro:', err);
        res.status(500).json({ success: false, message: 'Erro ao criar livro' });
    }
});

// Atualizar um livro
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, autor, genero, anoPublicacao, editora, sinopse, foto, url, situacao } = req.body;
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
            livro.url = url;
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
router.get('/:id', async (req, res) => {
    const livroId = req.params.id;

    try {
        const livro = await Livro.findByPk(livroId);
        if (!livro) {
            res.status(404).json({ error: 'Livro não encontrado' });
        } else {
            res.json(livro);
        }
    } catch (err) {
        console.error('Erro ao buscar detalhes do livro:', err);
        res.status(500).json({ error: 'Erro interno ao buscar detalhes do livro' });
    }
});

// Rota para buscar livros com base na consulta
router.get('/search', async (req, res) => {
    const query = req.query.query;

    try {
        const livros = await Livro.findAll({
            where: {
                titulo: {
                    [Op.like]: `%${query}%`
                }
            },
            limit: 10
        });

        res.json({ livros });
    } catch (err) {
        console.error('Erro na consulta:', err);
        res.status(500).json({ error: 'Erro na consulta' });
    }
});

// Rota para buscar livros pelo título
router.get('/buscar-titulo/:titulo', async (req, res) => {
    const titulo = req.params.titulo;

    try {
        const livros = await Livro.findAll({
            where: {
                titulo: {
                    [Op.like]: `%${titulo}%`
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

// Rota de busca de livros pagina ebooks digitação
router.get('/buscar/:titulo', async (req, res) => {
    const titulo = req.params.titulo;

    try {
        const livros = await Livro.findAll({
            where: {
                titulo: {
                    [Op.like]: `%${titulo}%` // Filtro LIKE, ignorando maiúsculas e minúsculas
                }
            },
            attributes: ['id', 'titulo', 'autor', 'genero', 'sinopse', 'foto','download'],
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

// Rota para incrementar a contagem de downloads
router.post('/:id/incrementar-download', async (req, res) => {
    const { id } = req.params; // Obtém o ID do ebook da URL
    try {
        const ebook = await Livro.findByPk(id); // Corrigido para utilizar o modelo Ebook
        if (!ebook) {
            return res.status(404).json({ error: 'Ebook não encontrado' });
        }

        // Incrementa a contagem de downloads
        ebook.download += 1; 
        await ebook.save(); // Salva as mudanças no banco de dados

        // Retorna o valor atualizado do contador de downloads
        res.json({ download: ebook.download }); 
    } catch (error) {
        console.error('Erro ao incrementar o download:', error);
        res.status(500).json({ error: 'Erro ao incrementar o download' });
    }
});


module.exports = router;
