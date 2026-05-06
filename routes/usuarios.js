const express = require('express');
const router = express.Router();

const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const user = await Usuario.findOne({ where: { email } });

  if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });

  const ok = await bcrypt.compare(senha, user.senha);

  if (!ok) return res.status(400).json({ error: 'Senha inválida' });

  req.session.usuario = {
    id: user.id,
    nome: user.nome
  };

  res.json({ ok: true });
});

module.exports = router;