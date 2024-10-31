const express = require('express');
const router = express.Router();
const Ebook = require('../models/ebook');
const Livro = require('../models/livro');
const { Op } = require('sequelize');

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

module.exports = router;

