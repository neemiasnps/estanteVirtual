const express = require('express');

const router = express.Router();

/* =========================
   PÁGINA VISUAL DO LIVRO
========================= */
router.get('/:id', async (req, res) => {

    try {

        res.render('livro_detalhes', {
            livroId: req.params.id
        });

    } catch (error) {

        console.error(error);

        res.status(500).send('Erro ao carregar livro');

    }

});

module.exports = router;