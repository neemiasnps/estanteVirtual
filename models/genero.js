const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Genero = sequelize.define('Genero', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'Generos',
  timestamps: true,
});

module.exports = Genero;
