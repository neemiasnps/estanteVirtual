const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const { AvaliacaoLivro, Aluno } = require('../../models');


router.get('/:livroId', async (req, res) => {

    try {

        const avaliacoes = await AvaliacaoLivro.findAll({

            where: {
                livro_id: req.params.livroId,
                aprovado: true
            },

            include: [
                {
                    model: Aluno,
                    attributes: ['nomeCompleto']
                }
            ],

            order: [['createdAt', 'DESC']]

        });

        // média das estrelas
        const totalAvaliacoes = avaliacoes.length;

        const somaEstrelas = avaliacoes.reduce((total, item) => {
            return total + item.estrelas;
        }, 0);

        const mediaAvaliacoes = totalAvaliacoes > 0
            ? (somaEstrelas / totalAvaliacoes).toFixed(1)
            : 0;

        res.json({
            mediaAvaliacoes,
            totalAvaliacoes,
            avaliacoes
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;