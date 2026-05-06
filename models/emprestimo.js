const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Emprestimo extends Model {}

Emprestimo.init({

  aluno_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  quantidade_livros: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  data_solicitacao: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  observacao: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  sequelize,
    modelName: 'Emprestimo',
    timestamps: true
});

module.exports = Emprestimo;