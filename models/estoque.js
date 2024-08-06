const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Estoque = sequelize.define('Estoque', {
  livro_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Se livro_id deve ser único na tabela
    references: {
      model: 'Livros', // Nome da tabela referenciada
      key: 'id'
    }
  },
  estoque_total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  estoque_locado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  estoque_disponivel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, 
{
  tableName: 'Estoques' // Especifique o nome correto da tabela no banco de dados
});

module.exports = Estoque;
