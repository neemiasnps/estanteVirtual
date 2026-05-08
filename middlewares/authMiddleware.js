const TEMPO_INATIVIDADE = 30 * 60 * 1000;

function authMiddleware(req, res, next) {
  const usuario = req.session.usuario;

  if (!usuario) {
    return res.status(401).json({ autenticado: false });
  }

  const agora = Date.now();
  const ultimo = usuario.ultimoAcesso || agora;

  if (agora - ultimo > TEMPO_INATIVIDADE) {
    req.session.destroy(() => {});
    return res.status(401).json({
      autenticado: false,
      expirado: true
    });
  }

  // atualiza atividade
  req.session.usuario.ultimoAcesso = agora;

  return next();
}

module.exports = authMiddleware;