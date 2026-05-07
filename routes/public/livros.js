const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const { Livro, Estoque, Genero, Subgenero } = require('../../models');

/* =========================
   LISTAGEM PÚBLICA
   ======================== */
router.get('/', async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const where = {
            situacao: 'Disponível'
        };

        // 🔎 busca principal (título e autor + gênero + subgênero)
        if (search) {
            where[Op.or] = [
                { titulo: { [Op.like]: `%${search}%` } },
                { autor: { [Op.like]: `%${search}%` } },

                // ✔ ADICIONADO (sem quebrar sua lógica)
                { '$Genero.nome$': { [Op.like]: `%${search}%` } },
                { '$Subgenero.nome$': { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Livro.findAndCountAll({
            where,
            include: [
                {
                    model: Estoque,
                    required: false
                },
                {
                    model: Genero,
                    attributes: ['nome'],
                    required: false
                },
                {
                    model: Subgenero,
                    attributes: ['nome'],
                    required: false
                }
            ],
            distinct: true,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        // 🔥 LOGS IMPORTANTES
        console.log('📊 Total encontrados:', count);
        console.log('📚 Quantidade retornada (rows):', rows.length);

        if (rows.length > 0) {
            console.log('📖 Primeiro livro:', rows[0].titulo);
        } else {
            console.log('⚠️ Nenhum livro encontrado');
        }

        res.json({
            livros: rows,
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});


/* =========================
   DETALHES DO LIVRO
   ======================= */
router.get('/:id', async (req, res) => {

    try {

        const livro = await Livro.findByPk(req.params.id, {
            include: [
                {
                    model: Estoque
                },
                {
                    model: Genero,
                    attributes: ['nome']
                },
                {
                    model: Subgenero,
                    attributes: ['nome']
                }
            ]
        });

        if (!livro) {
            return res.status(404).json({
                error: 'Livro não encontrado'
            });
        }

        res.json(livro);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});


module.exports = router;