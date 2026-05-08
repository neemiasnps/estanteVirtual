const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

// LOGIN
router.post('/login', async (req, res) => {

  try {

    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: 'Informe e-mail e senha'
      });
    }

    const usuario = await Usuario.findOne({
      where: { email }
    });

    if (!usuario) {
      return res.status(404).json({
        message: 'Usuário não cadastrado'
      });
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senha);

    if (!senhaOk) {
      return res.status(401).json({
        message: 'Senha inválida'
      });
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      ultimoAcesso: Date.now()
    };

    return res.json({
      autenticado: true,
      message: 'Login realizado com sucesso',
      usuario: {
        nome: usuario.nome
      }
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: 'Erro interno no servidor'
    });

  }

});

// STATUS
router.get('/status', (req, res) => {
  if (!req.session.usuario) {
    return res.json({ autenticado: false });
  }

  return res.json({
    autenticado: true,
    usuario: req.session.usuario
  });
});

// LOGOUT
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ autenticado: false });
  });
});

module.exports = router;