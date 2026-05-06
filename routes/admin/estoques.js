const express = require('express');
const router = express.Router();

const Estoque = require('../../models/estoque');

// ===============================
// ATUALIZAR ESTOQUE
// ===============================
router.post('/atualizar-estoque', async (req, res) => {
    try {
        const { livro_id, quantidade } = req.body;

        let estoque = await Estoque.findOne({ where: { livro_id } });

        if (!estoque) {
            estoque = await Estoque.create({
                livro_id,
                estoque_total: quantidade,
                estoque_disponivel: quantidade
            });
        } else {
            estoque.estoque_total = quantidade;
            estoque.estoque_disponivel = quantidade - estoque.estoque_locado;
            await estoque.save();
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        res.status(500).json({ success: false });
    }
});


// ===============================
// BUSCAR ESTOQUE POR LIVRO
// ===============================
router.get('/:idLivro', async (req, res) => {
    try {
        const idLivro = parseInt(req.params.idLivro, 10);

        const estoque = await Estoque.findOne({
            where: { livro_id: idLivro }
        });

        if (!estoque) {
            return res.json({ estoque_total: 0 });
        }

        res.json({ estoque_total: estoque.estoque_total });

    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ error: 'Erro ao buscar estoque' });
    }
});

module.exports = router;