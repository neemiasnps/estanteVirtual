const express = require('express');
const router = express.Router();

const Subgenero = require('../../models/subgenero');

// ===============================
// SUBGÊNEROS POR GÊNERO
// ===============================
router.get('/:generoId', async (req, res) => {
    try {
        const subgeneros = await Subgenero.findAll({
            where: { genero_id: req.params.generoId },
            attributes: ['id', 'nome'],
            order: [['nome', 'ASC']]
        });

        res.json(subgeneros);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar subgêneros' });
    }
});

module.exports = router;