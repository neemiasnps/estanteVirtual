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

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { livro, status } = req.query;

        let where = {};

        if (status === 'aprovado') where.aprovado = true;
        if (status === 'reprovado') where.aprovado = false;
        if (status === 'pendente') where.aprovado = null;

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

        const {
            rows: avaliacoes,
            count
        } = await AvaliacaoLivro.findAndCountAll({

            where,

            include: [
                includeLivro,
                {
                    model: Aluno
                }
            ],

            limit,
            offset,

            order: [
                ['createdAt', 'DESC']
            ]

        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            avaliacoes,
            totalPages
        });

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