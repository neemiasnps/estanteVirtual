const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');

const { enviarEmailNovaAvaliacao } = require('../../services/emailService');

const { AvaliacaoLivro, Livro, Aluno } = require('../../models');

router.post('/', async (req, res) => {

    try {

        const {
            livro_id,
            aluno_id,
            estrelas,
            comentario
        } = req.body;

        // BUSCAR DADOS
        const livro = await Livro.findByPk(livro_id);

        const aluno = await Aluno.findByPk(aluno_id);

        // CRIAR AVALIAÇÃO
        const avaliacao = await AvaliacaoLivro.create({

            livro_id,
            aluno_id,
            estrelas,
            comentario,
            aprovado: null

        });

        // ENVIAR E-MAIL
        await enviarEmailNovaAvaliacao({

            livro: livro?.titulo || '-',
            aluno: aluno?.nomeCompleto || aluno?.nome || '-',
            estrelas,
            comentario

        });

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