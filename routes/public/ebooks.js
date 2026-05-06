const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const Ebook = require('../../models/ebook');
const Genero = require('../../models/genero');
const Subgenero = require('../../models/subgenero');

/* =========================
   LISTAGEM PAGINADA + BUSCA
========================= */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;

        const search = req.query.search || '';

        const where = {
            situacao: 'Disponível'
        };

        const include = [
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
        ];

        if (search) {
            where[Op.or] = [
                { titulo: { [Op.like]: `%${search}%` } },
                { autor: { [Op.like]: `%${search}%` } },
                { '$Genero.nome$': { [Op.like]: `%${search}%` } },
                { '$Subgenero.nome$': { [Op.like]: `%${search}%` } } // 🔥 subgênero
            ];
        }

        const { rows, count } = await Ebook.findAndCountAll({
            where,
            include,
            limit,
            offset,
            distinct: true,
            order: [['createdAt', 'DESC']]
        });

        const ebooks = rows.map(e => ({
            id: e.id,
            titulo: e.titulo,
            autor: e.autor,
            sinopse: e.sinopse,
            foto: e.foto,
            url: e.url,
            download: e.download,
            genero: e.Genero?.nome || '',
            subgenero: e.Subgenero?.nome || ''
        }));

        res.json({
            livros: ebooks,
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        console.error('Erro ebooks:', error);
        res.status(500).json({ error: 'Erro ao buscar ebooks' });
    }
});

/* =========================
   INCREMENTAR DOWNLOAD
========================= */
router.post('/:id/incrementar-download', async (req, res) => {
    try {
        const ebook = await Ebook.findByPk(req.params.id);

        if (!ebook) {
            return res.status(404).json({ error: 'Ebook não encontrado' });
        }

        ebook.download = (ebook.download || 0) + 1;
        await ebook.save();

        res.json({ download: ebook.download });

    } catch (error) {
        console.error('Erro ao incrementar download:', error);
        res.status(500).json({ error: 'Erro ao incrementar download' });
    }
});

module.exports = router;