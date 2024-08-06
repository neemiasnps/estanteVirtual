const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Emprestimo = require('./emprestimo');
const Livro = require('./livro');

class EmprestimoLivro extends Model {}

EmprestimoLivro.init({
  emprestimo_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Emprestimo,
      key: 'id'
    }
  },
  livro_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Livro,
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'EmprestimoLivro'
});

module.exports = EmprestimoLivro;
