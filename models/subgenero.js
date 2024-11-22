const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Genero = require('./genero');

const Subgenero = sequelize.define('Subgenero', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'Subgeneros',
  timestamps: true,
});

// Relacionamento: Um gênero possui muitos subgêneros
Genero.hasMany(Subgenero, {
  foreignKey: 'genero_id',
  as: 'Subgeneros',
});

Subgenero.belongsTo(Genero, {
  foreignKey: 'genero_id',
  as: 'Generos',
});

module.exports = Subgenero;
