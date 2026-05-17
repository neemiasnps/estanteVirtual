const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Configuracao extends Model {}

Configuracao.init({

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  chave: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  valor: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  sequelize,
  modelName: 'Configuracao',
  tableName: 'configuracoes',
  timestamps: true
});

module.exports = Configuracao;