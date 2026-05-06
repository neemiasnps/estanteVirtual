const sequelize = require('../../config/database');
const express = require('express');
const router = express.Router();

const { Op } = require('sequelize');

const { Livro, Estoque, Emprestimo } = require('../../models');

/* =========================
   LISTAGEM PAGINADA
========================= */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const offset = (page - 1) * limit;

        const { rows, count } = await Livro.findAndCountAll({
            where: { situacao: 'Disponível' },
            include: [{ model: Estoque, required: false }],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            livros: rows,
            totalPages: Math.ceil(count / limit)
        });

    } catch (error) {
        console.error('Erro ao listar livros:', error);
        res.status(500).json({ error: 'Erro ao buscar livros' });
    }
});


/* =========================
   CRIAÇÃO
   ======================== */
router.post('/', async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            titulo,
            autor,
            genero_id,
            subgenero_id,
            anoPublicacao,
            editora,
            sinopse,
            foto,
            gentileza,
            situacao
        } = req.body;

        const livro = await Livro.create({
            titulo,
            autor,
            genero_id: Number(genero_id),
            subgenero_id: Number(subgenero_id),
            anoPublicacao,
            editora,
            sinopse,
            foto,
            gentileza,
            situacao: situacao ? 'Disponível' : 'Indisponível',
            somaLocados: 0
        }, { transaction: t });

        await Estoque.findOrCreate({
            where: { livro_id: livro.id },
            defaults: {
                livro_id: livro.id,
                estoque_total: 1,
                estoque_locado: 0,
                estoque_disponivel: 1
            },
            transaction: t
        });

        await t.commit();

        return res.json(livro);

    } catch (error) {
        await t.rollback();
        console.error('Erro ao criar livro:', error);
        return res.status(500).json({ error: 'Erro ao criar livro' });
    }
});


/* =========================
   ATUALIZAÇÃO
   ======================== */
router.put('/:id', async (req, res) => {
    try {

        const livro = await Livro.findByPk(req.params.id);

        if (!livro) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        const {
            titulo,
            autor,
            genero_id,
            subgenero_id,
            anoPublicacao,
            editora,
            sinopse,
            foto,
            gentileza,
            situacao
        } = req.body;

        await livro.update({
            titulo,
            autor,
            genero_id: Number(genero_id),
            subgenero_id: Number(subgenero_id),
            anoPublicacao,
            editora,
            sinopse,
            foto,
            gentileza,
            situacao: situacao ? 'Disponível' : 'Indisponível'
        });

        res.json({ message: 'Livro atualizado com sucesso' });

    } catch (error) {
        console.error('Erro ao atualizar livro:', error);
        res.status(500).json({ error: 'Erro ao atualizar livro' });
    }
});


/* =========================
   AUTOCOMPLETE (LEVE)
========================= */
router.get('/auto-livros', async (req, res) => {
    try {
        const livros = await Livro.findAll({
            attributes: ['id', 'titulo'],
            include: [{
                model: Estoque,
                required: true,
                where: {
                    estoque_disponivel: { [Op.gt]: 0 }
                }
            }],
            order: [['titulo', 'ASC']]
        });

        res.json(livros);

    } catch (error) {
        console.error('Erro autocomplete:', error);
        res.status(500).json({ error: 'Erro ao carregar livros' });
    }
});


/* =========================
   BUSCAR POR ID (PADRÃO)
========================= */
router.get('/:id', async (req, res) => {
    try {

        const livro = await Livro.findByPk(req.params.id, {
            include: [
                { model: Estoque, required: false }
            ]
        });

        if (!livro) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        // 🔥 resposta simples e segura
        res.json({
            id: livro.id,
            titulo: livro.titulo,
            autor: livro.autor,
            genero_id: livro.genero_id,
            subgenero_id: livro.subgenero_id,
            anoPublicacao: livro.anoPublicacao,
            editora: livro.editora,
            sinopse: livro.sinopse,
            foto: livro.foto,
            gentileza: livro.gentileza,
            situacao: livro.situacao,
            estoque: livro.Estoque || null
        });

    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        res.status(500).json({ error: 'Erro ao buscar livro' });
    }
});


/* =========================
   EXCLUSÃO SEGURA
========================= */
router.delete('/:id', async (req, res) => {
    try {

        const livro = await Livro.findByPk(req.params.id);

        if (!livro) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }

        const emprestimos = await Emprestimo.findAll({
            include: {
                model: Livro,
                where: { id: livro.id }
            }
        });

        if (emprestimos.length > 0) {
            livro.situacao = 'indisponível';
            await livro.save();

            return res.json({ message: 'Livro marcado como indisponível' });
        }

        await livro.destroy();

        res.json({ message: 'Livro excluído com sucesso' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir livro' });
    }
});


module.exports = router;