const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const user = await User.findOne({ where: { email, senha } });
        if (user) {
            res.json({ success: true, message: 'Login bem-sucedido' });
        } else {
            res.json({ success: false, message: 'Email ou senha incorretos' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

module.exports = router;

router.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.json({ success: false, message: 'Email já cadastrado' });
        }
        const user = await User.create({ nome, email, senha });
        res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
});

