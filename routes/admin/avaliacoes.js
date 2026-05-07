const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');

const {
    AvaliacaoLivro,
    Livro,
    Aluno
} = require('../../models');

/* =========================
   LISTAR AVALIAÇÕES
========================= */
router.get('/', async (req, res) => {

    try {

        const {
            livro,
            status
        } = req.query;

        let where = {};

        // FILTRO STATUS
        if (status === 'aprovado') where.aprovado = true;

        if (status === 'reprovado') where.aprovado = false;

        if (status === 'pendente') where.aprovado = null;

        // FILTRO LIVRO
        let includeLivro = {
            model: Livro
        };

        if (livro) {

            includeLivro.where = {
                titulo: {
                    [Op.like]: `%${livro}%`
                }
            };

        }

        const avaliacoes = await AvaliacaoLivro.findAll({

            where,

            include: [
                includeLivro,
                {
                    model: Aluno
                }
            ],

            order: [['createdAt', 'DESC']]

        });

        res.json(avaliacoes);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            sucesso: false,
            mensagem: error.message
        });

    }

});


/* =========================
   ATUALIZAR STATUS
========================= */
router.put('/:id/status', async (req, res) => {

    try {

        const { id } = req.params;

        const { aprovado } = req.body;

        const avaliacao = await AvaliacaoLivro.findByPk(id);

        if (!avaliacao) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Avaliação não encontrada'
            });

        }

        avaliacao.aprovado = aprovado;

        await avaliacao.save();

        res.json({
            sucesso: true,
            avaliacao
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            sucesso: false,
            mensagem: error.message
        });

    }

});


module.exports = router;