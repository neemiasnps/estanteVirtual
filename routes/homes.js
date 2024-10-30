const express = require('express');
const router = express.Router();
const Ebook = require('../models/ebook');
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


module.exports = router;

