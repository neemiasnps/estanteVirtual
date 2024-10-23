const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ebook = sequelize.define('Ebook', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  autor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  genero: {
    type: DataTypes.STRING,
    allowNull: false
  },
  anoPublicacao: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  editora: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sinopse: {
    type: DataTypes.TEXT
  },
  foto: {
    type: DataTypes.STRING
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  situacao: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Disponível'
  },
  download: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0      
  }
});

module.exports = Ebook;
