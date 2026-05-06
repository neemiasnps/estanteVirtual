const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

// LOGIN
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });

  if (!usuario) {
    return res.status(400).json({ error: 'Usuário não encontrado' });
  }

  const ok = await bcrypt.compare(senha, usuario.senha);

  if (!ok) {
    return res.status(400).json({ error: 'Senha inválida' });
  }

  req.session.usuario = {
    id: usuario.id,
    nome: usuario.nome
  };

  res.json({ success: true });
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

module.exports = router;