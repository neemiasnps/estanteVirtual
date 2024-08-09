const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');

// Rota para criar um novo usuário
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const hashedPassword = await bcrypt.hash(senha, 10);
    const usuario = await Usuario.create({ nome, email, senha: hashedPassword });
    res.status(201).json(usuario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota para login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Verifique se os campos são fornecidos
        if (!email || !senha) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
        }

        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            return res.status(400).json({ error: 'E-mail não cadastrado' });
        }

        const isMatch = await bcrypt.compare(senha, usuario.senha);

        if (!isMatch) {
            return res.status(400).json({ error: 'Senha inválida' });
        }

        res.status(200).json({ message: 'Login realizado com sucesso' });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Middleware para verificar se o usuário está logado
function garantirAutenticado(req, res, next) {
  if (req.session && req.session.usuario) {
    return next(); // Usuário está logado, continuar para a página
  } else {
    res.redirect('/login'); // Redirecionar para a página de login
  }
}

// Rota que requer autenticação
router.get('/gerenciar_alunos', garantirAutenticado, (req, res) => {
  res.render('gerenciar_alunos'); // Renderiza a página do perfil do usuário
});


module.exports = router;
