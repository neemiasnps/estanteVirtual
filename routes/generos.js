const express = require('express');
const router = express.Router();
const Genero = require('../models/genero');
const Subgenero = require('../models/subgenero');
const { Op } = require('sequelize');

// Rota para buscar todos os gêneros
router.get('/buscar-generos', async (req, res) => {
    try {
        const generos = await Genero.findAll({
            attributes: ['id', 'nome'],
            order: [['nome', 'ASC']]
        });

        if (generos.length > 0) {
            res.json(generos);
        } else {
            res.status(404).json({ message: 'Nenhum gênero encontrado.' });
        }
    } catch (error) {
        console.error('Erro ao buscar gêneros:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para buscar subgêneros por gênero
router.get('/subgeneros', async (req, res) => {
    const { genero_id } = req.query;

    console.log('Recebendo genero_id:', genero_id); // Log para verificar o valor recebido

    try {
        const subgeneros = await Subgenero.findAll({
            where: { genero_id: genero_id }, // Chave estrangeira deve ser 'generoId' e não 'genero_id'
            attributes: ['id', 'nome'],
            order: [['nome', 'ASC']]
        });

        if (subgeneros.length > 0) {
            res.json(subgeneros);
        } else {
            res.status(404).json({ message: 'Nenhum subgênero encontrado para o gênero fornecido.' });
        }
    } catch (error) {
        console.error('Erro ao buscar subgêneros:', error); // Log do erro no servidor
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;