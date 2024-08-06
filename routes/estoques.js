const express = require('express');
const router = express.Router();
const Estoque = require('../models/estoque');

// Rota para atualizar estoque
router.post('/atualizar-estoque', async (req, res) => {
    try {
        const { livro_id, quantidade } = req.body;

        // Encontre o registro de estoque do livro
        let estoque = await Estoque.findOne({ where: { livro_id } });

        if (!estoque) {
            estoque = await Estoque.create({
                livro_id,
                estoque_total: quantidade,
                estoque_disponivel: quantidade
            });
        } else {
            // Atualize o estoque
            estoque.estoque_total = quantidade;
            estoque.estoque_disponivel = quantidade - estoque.estoque_locado;
            await estoque.save();
        }

        res.json({ success: true, message: 'Estoque atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar o estoque:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar o estoque.' });
    }
});

// Rota para buscar o estoque total de um livro pelo ID
router.get('/:idLivro', async (req, res) => {
    const idLivro = parseInt(req.params.idLivro, 10);

    // Verifica se o idLivro é um número válido
    if (isNaN(idLivro)) {
        return res.status(400).json({ error: 'ID do livro inválido.' });
    }

    try {
        const estoque = await Estoque.findOne({
            where: { livro_id: idLivro }
        });

        if (!estoque) {
            return res.status(404).json({ error: 'Estoque não encontrado para o livro.' });
        } else {
            return res.json({ estoque_total: estoque.estoque_total });
        }
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        return res.status(500).json({ error: 'Erro ao buscar estoque.' });
    }
});

module.exports = router;
