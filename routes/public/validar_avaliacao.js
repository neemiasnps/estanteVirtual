const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');

const {
    Aluno,
    Emprestimo,
    EmprestimoLivro,
    AvaliacaoLivro
} = require('../../models');

router.post('/', async (req, res) => {

    try {

        const {
            livro_id,
            identificacao
        } = req.body;

        // BUSCAR ALUNO
        const aluno = await Aluno.findOne({

            where: {
                status: 'ativo',
                [Op.or]: [
                    { cpf: identificacao },
                    { email: identificacao }
                ]
            }

        });

        if (!aluno) {

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Aluno não encontrado.'
            });

        }

        // VERIFICAR SE JÁ AVALIOU
        const jaAvaliou = await AvaliacaoLivro.findOne({

            where: {
                livro_id,
                aluno_id: aluno.id
            }

        });

        if (jaAvaliou) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Você já avaliou este livro.'
            });

        }

        // VERIFICAR EMPRÉSTIMO DEVOLVIDO
        const emprestimo = await EmprestimoLivro.findOne({

            where: {
                livro_id,
                status: 'devolvido'
            },

            include: [
                {
                    model: Emprestimo,
                    where: {
                        aluno_id: aluno.id
                    }
                }
            ]

        });

        if (!emprestimo) {

            return res.status(403).json({
                sucesso: false,
                mensagem: 'Somente alunos que já devolveram este livro podem avaliá-lo.'
            });

        }

        res.json({
            sucesso: true,
            aluno
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