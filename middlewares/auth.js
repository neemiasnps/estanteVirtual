function garantirAutenticado(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.status(401).json({ autenticado: false });
}

module.exports = garantirAutenticado;