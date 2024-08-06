const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Estoque = require('./estoque'); // Importe o modelo Estoque

const Livro = sequelize.define('Livro', {
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
  gentileza: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sinopse: {
    type: DataTypes.TEXT
  },
  foto: {
    type: DataTypes.STRING
  },
  situacao: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Disponível'
  },
}, {
  hooks: {
    afterCreate: async (livro, options) => {
      try {
        await Estoque.create({
          livro_id: livro.id,
          estoque_total: 1, //estoque inicial do livro adicionado
          estoque_locado: 0,
          estoque_disponivel: 1
        });
      } catch (error) {
        console.error('Erro ao criar registro de estoque para o livro:', error);
      }
    }
  }
});

Livro.hasOne(Estoque, { foreignKey: 'livro_id' });
Estoque.belongsTo(Livro, { foreignKey: 'livro_id' });

module.exports = Livro;
