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

// Listar todos os livros no auto-complete
router.get('/auto-livros', async (req, res) => {
    try {
        // Buscar todos os livros, incluindo dados de estoque
        const livros = await Livro.findAll({
            include: [Estoque] // Inclui informações da tabela Estoque
        });

        // Retornar os livros em formato JSON
        res.json(livros);

    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ error: 'Erro ao buscar livros' });
    }
});

// Criar um novo livro
router.post('/', async (req, res) => {
    const { titulo, autor, genero, subgenero, anoPublicacao, editora, sinopse, foto, gentileza, situacao } = req.body;
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
    const { titulo, autor, genero, subgenero, anoPublicacao, editora, sinopse, foto, gentileza, situacao } = req.body;
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
            attributes: ['id', 'titulo', 'autor', 'genero', 'sinopse', 'foto', 'situacao'],
            include: [Estoque],
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
            attributes: ['id', 'titulo', 'autor', 'genero', 'sinopse', 'foto','situacao'],
            include: [Estoque], // Incluindo dados de estoque
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
            attributes: ['id', 'titulo', 'autor', 'genero', 'sinopse', 'foto','situacao'],
            include: [Estoque], // Incluindo dados de estoque
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
