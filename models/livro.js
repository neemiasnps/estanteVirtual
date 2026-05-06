const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Livro = sequelize.define('Livro', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  autor: {
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

  genero_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  subgenero_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  somaLocados: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'Livros',
  timestamps: true
});

/* =========================
   ASSOCIAÇÕES
========================= */
Livro.associate = (models) => {

  Livro.belongsTo(models.Genero, {
    foreignKey: 'genero_id'
  });

  Livro.belongsTo(models.Subgenero, {
    foreignKey: 'subgenero_id'
  });

  Livro.hasOne(models.Estoque, {
    foreignKey: 'livro_id'
  });

};

module.exports = Livro;