const express = require('express');
const router = express.Router();

const { enviarEmailNovaAvaliacao } = require('../../services/emailService');

const {
    AvaliacaoLivro,
    Livro,
    Aluno
} = require('../../models');

router.post('/', async (req, res) => {

    try {

        const {
            livro_id,
            aluno_id,
            estrelas,
            comentario
        } = req.body;

        // VALIDAÇÕES BÁSICAS
        if (!livro_id || !aluno_id) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Dados inválidos.'
            });

        }

        // VERIFICAR SE JÁ EXISTE AVALIAÇÃO
        const avaliacaoExistente = await AvaliacaoLivro.findOne({

            where: {
                livro_id,
                aluno_id
            }

        });

        if (avaliacaoExistente) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Você já avaliou este livro.'
            });

        }

        // BUSCAR DADOS
        const [livro, aluno] = await Promise.all([
            Livro.findByPk(livro_id),
            Aluno.findByPk(aluno_id)
        ]);

        // CRIAR AVALIAÇÃO
        const avaliacao = await AvaliacaoLivro.create({

            livro_id,
            aluno_id,
            estrelas,
            comentario,
            aprovado: null

        });

        // ENVIAR E-MAIL
        try {

            await enviarEmailNovaAvaliacao({

                livro: livro?.titulo || '-',
                aluno: aluno?.nomeCompleto || aluno?.nome || '-',
                estrelas,
                comentario

            });

        } catch (emailError) {

            console.error(
                '[AVALIACAO] Erro ao enviar e-mail:',
                emailError
            );

        }

        return res.json({

            sucesso: true,
            avaliacao

        });

    } catch (error) {

        console.error(error);

        // PROTEÇÃO CONTRA DUPLICIDADE
        if (
            error.name === 'SequelizeUniqueConstraintError' ||
            error.original?.code === 'ER_DUP_ENTRY'
        ) {

            return res.status(400).json({
                sucesso: false,
                mensagem: 'Você já avaliou este livro.'
            });

        }

        return res.status(500).json({

            sucesso: false,
            mensagem: 'Erro ao salvar avaliação.'

        });

    }

});

module.exports = router;