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
    const { titulo, autor, genero, subgenero, anoPublicacao, editora, sinopse, foto, url, situacao } = req.body;
    try {
        const novoLivro = await Livro.create({ 
            titulo, 
            autor, 
            genero, 
            subgenero,
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
    const { titulo, autor, genero, subgenero, anoPublicacao, editora, sinopse, foto, url, situacao } = req.body;
    try {
        const livro = await Livro.findByPk(id);
        if (livro) {
            livro.titulo = titulo;
            livro.autor = autor;
            livro.genero = genero;
            livro.subgenero = subgenero;
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
            attributes: ['id', 'titulo', 'autor', 'genero', 'sinopse', 'foto','url','download'],
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

// Rota para buscar livros por genero
router.get('/buscar-genero/:genero', async (req, res) => {
    const genero = req.params.genero;
    const pagina = parseInt(req.query.pagina) || 1; // Página atual, padrão é 1
    const livrosPorPagina = 12; // Limite de livros por página
    const offset = (pagina - 1) * livrosPorPagina; // Calcula o deslocamento (offset) para a consulta

    console.log('Gênero recebido:', genero);
    console.log('Página recebida:', pagina);

    try {
        // Contagem total de livros para calcular o total de páginas
        const totalLivros = await Livro.count({
            where: {
                genero: {
                    [Op.eq]: genero
                }
            }
        });

        const totalPages = Math.ceil(totalLivros / livrosPorPagina); // Calcula o total de páginas

        // Consulta de livros com limitação de resultados por página
        const livros = await Livro.findAll({
            where: {
                genero: {
                    [Op.eq]: genero
                }
            },
            attributes: ['id', 'titulo', 'autor', 'genero', 'sinopse', 'foto','url','download'],
            limit: livrosPorPagina,
            offset: offset,
        });

        console.log('Livros encontrados:', livros);

        if (livros.length > 0) {
            res.json({
                livros,          // Livros da página atual
                totalPages,      // Total de páginas
                paginaAtual: pagina, // Página atual
                totalLivros      // Total de livros encontrados
            });
        } else {
            res.status(404).json({ message: 'Nenhum livro encontrado para o gênero selecionado.' });
        }
    } catch (error) {
        console.error('Erro ao buscar livros por gênero:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota de busca de livros por título ou autor
router.get('/buscarAll/:search', async (req, res) => {
    const searchTerm = req.params.search;

    try {
        const livros = await Livro.findAll({
            where: {
                [Op.or]: [
                    {
                        titulo: {
                            [Op.like]: `%${searchTerm}%` // Filtro LIKE no título
                        }
                    },
                    {
                        autor: {
                            [Op.like]: `%${searchTerm}%` // Filtro LIKE no autor
                        }
                    },
                    {
                        genero: {
                            [Op.like]: `%${searchTerm}%` // Filtro LIKE no genero
                        }
                    },
                    {
                        subgenero: {
                            [Op.like]: `%${searchTerm}%` // Filtro LIKE no subgenero
                        }
                    }
                ]
            },
            attributes: ['id', 'titulo', 'autor', 'genero', 'sinopse', 'foto', 'url','download'],
        });

        if (livros.length > 0) {
            res.json(livros);
        } else {
            res.status(404).json({ message: 'Nenhum livro encontrado com o título ou autor fornecido.' });
        }
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota de busca de livros por título, autor, gênero ou subgênero com paginação
router.get('/buscarAll2/:search', async (req, res) => {
    const searchTerm = req.params.search;
    const { pagina = 1 } = req.query; // Número da página, padrão é 1
    const limitePorPagina = 12; // Limite de livros por página

    try {
        // Consulta com filtros e paginação
        const { count, rows: livros } = await Livro.findAndCountAll({
            where: {
                [Op.or]: [
                    {
                        titulo: {
                            [Op.like]: `%${searchTerm}%` // Filtro LIKE no título
                        }
                    },
                    {
                        autor: {
                            [Op.like]: `%${searchTerm}%` // Filtro LIKE no autor
                        }
                    },
                    {
                        genero: {
                            [Op.like]: `%${searchTerm}%` // Filtro LIKE no gênero
                        }
                    },
                    {
                        subgenero: {
                            [Op.like]: `%${searchTerm}%` // Filtro LIKE no subgênero
                        }
                    }
                ]
            },
            attributes: ['id', 'titulo', 'autor', 'genero', 'sinopse', 'foto', 'url', 'download'],
            limit: limitePorPagina,
            offset: (pagina - 1) * limitePorPagina // Cálculo do deslocamento para a paginação
        });

        if (livros.length > 0) {
            res.json({
                totalLivros: count,
                totalPaginas: Math.ceil(count / limitePorPagina),
                paginaAtual: Number(pagina),
                livros
            });
        } else {
            res.status(404).json({ message: 'Nenhum livro encontrado com os critérios fornecidos.' });
        }
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
