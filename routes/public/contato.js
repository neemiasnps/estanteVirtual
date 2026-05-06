const express = require('express');
const router = express.Router();
const contatoService = require('../../services/contatoService');

router.post('/', async (req, res) => {
    try {
        await contatoService.enviarContato(req.body);

        return res.status(200).json({
            message: 'Mensagem enviada com sucesso!'
        });

    } catch (error) {
        console.error('Erro contato:', error);

        return res.status(500).json({
            message: 'Erro ao enviar mensagem'
        });
    }
});

module.exports = router;