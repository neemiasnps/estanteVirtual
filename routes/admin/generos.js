const express = require('express');
const router = express.Router();

const Genero = require('../../models/genero');

// ===============================
// LISTAR GÊNEROS
// ===============================
router.get('/', async (req, res) => {
    try {
        const generos = await Genero.findAll({
            attributes: ['id', 'nome'],
            order: [['nome', 'ASC']]
        });

        res.json(generos);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar gêneros' });
    }
});

module.exports = router;