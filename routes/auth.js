// routes/auth.js
const express = require('express');
const router = express.Router();

function garantirAutenticado(req, res, next) {
  if (req.session && req.session.usuario) {
    return next(); // Usuário está logado, continuar para a página
  } else {
    res.redirect('/'); // Redirecionar para a página de login
  }
}

// Exporte a função para uso em outros arquivos
module.exports = garantirAutenticado;
