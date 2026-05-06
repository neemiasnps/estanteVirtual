const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');

const { Ebook, Genero, Subgenero } = require('../../models');

// ===============================
// LISTAGEM (PAGINAÇÃO + BUSCA)
// ===============================
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        const where = {};

        if (search) {
            where.titulo = {
                [Op.like]: `%${search}%`
            };
        }

        const { rows: ebooks, count } = await Ebook.findAndCountAll({
            where,
            include: [
                { model: Genero, attributes: ['id', 'nome'], required: false },
                { model: Subgenero, attributes: ['id', 'nome'], required: false }
            ],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({ ebooks, totalPages });

    } catch (error) {
        console.error('Erro ao buscar eBooks:', error);
        res.status(500).json({ error: 'Erro ao buscar eBooks' });
    }
});


// ===============================
// BUSCAR POR ID (EDIÇÃO)
// ===============================
router.get('/:id', async (req, res) => {
    try {
        const ebook = await Ebook.findByPk(req.params.id, {
            include: [
                { model: Genero },
                { model: Subgenero }
            ]
        });

        if (!ebook) {
            return res.status(404).json({ error: 'eBook não encontrado' });
        }

        res.json({
            id: ebook.id,
            titulo: ebook.titulo,
            autor: ebook.autor,
            genero_id: ebook.genero_id,
            subgenero_id: ebook.subgenero_id,
            anoPublicacao: ebook.anoPublicacao,
            editora: ebook.editora,
            sinopse: ebook.sinopse,
            foto: ebook.foto,
            url: ebook.url,
            situacao: ebook.situacao,
            download: ebook.download
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar eBook' });
    }
});


// ===============================
// CRIAR EBOOK
// ===============================
router.post('/', async (req, res) => {
    try {
        const novo = await Ebook.create({
            titulo: req.body.titulo,
            autor: req.body.autor,
            genero_id: req.body.genero_id,
            subgenero_id: req.body.subgenero_id,
            anoPublicacao: req.body.anoPublicacao,
            editora: req.body.editora,
            sinopse: req.body.sinopse,
            foto: req.body.foto,
            url: req.body.url,
            situacao: req.body.situacao,
            download: 0
        });

        res.status(201).json(novo);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar eBook' });
    }
});


// ===============================
// ATUALIZAR EBOOK
// ===============================
router.put('/:id', async (req, res) => {
    try {
        const ebook = await Ebook.findByPk(req.params.id);

        if (!ebook) {
            return res.status(404).json({ error: 'eBook não encontrado' });
        }

        await ebook.update({
            titulo: req.body.titulo,
            autor: req.body.autor,
            genero_id: req.body.genero_id,
            subgenero_id: req.body.subgenero_id,
            anoPublicacao: req.body.anoPublicacao,
            editora: req.body.editora,
            sinopse: req.body.sinopse,
            foto: req.body.foto,
            url: req.body.url,
            situacao: req.body.situacao
        });

        res.json(ebook);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar eBook' });
    }
});


// ===============================
// EXCLUIR EBOOK
// ===============================
router.delete('/:id', async (req, res) => {
    try {
        const ebook = await Ebook.findByPk(req.params.id);

        if (!ebook) {
            return res.status(404).json({ error: 'eBook não encontrado' });
        }

        await ebook.destroy();

        res.json({ message: 'eBook excluído com sucesso' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir eBook' });
    }
});


// ===============================
// BUSCA POR TÍTULO (AUTOCOMPLETE)
// ===============================
router.get('/buscar-titulo/:titulo', async (req, res) => {
    try {
        const ebooks = await Ebook.findAll({
            where: {
                titulo: {
                    [Op.like]: `%${req.params.titulo}%`
                }
            },
            attributes: ['id', 'titulo', 'autor', 'situacao']
        });

        res.json(ebooks);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro na busca' });
    }
});


module.exports = router;