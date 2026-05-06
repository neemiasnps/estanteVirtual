const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Emprestimo = require('./emprestimo');
const Livro = require('./livro');

class EmprestimoLivro extends Model {}

EmprestimoLivro.init({

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  emprestimo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  livro_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  data_retirada: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  prazo_dias: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 40
  },

  data_devolucao_prevista: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  data_devolucao_real: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM(
      'pendente',
      'em andamento',
      'devolvido',
      'atrasado',
      'cancelado',
      'extraviado',
      'indenizado'
    ),
    allowNull: false,
    defaultValue: 'pendente'
  },

  ultimo_lembrete: {
    type: DataTypes.DATE,
    allowNull: true
  },

  valor_indenizacao: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },

  observacao: {
    type: DataTypes.TEXT,
    allowNull: true
  }

}, {
  sequelize,
  modelName: 'EmprestimoLivro'
});

/* RELACIONAMENTOS */
EmprestimoLivro.belongsTo(Emprestimo, { foreignKey: 'emprestimo_id' });
Emprestimo.hasMany(EmprestimoLivro, { foreignKey: 'emprestimo_id' });

EmprestimoLivro.belongsTo(Livro, { foreignKey: 'livro_id' });
Livro.hasMany(EmprestimoLivro, { foreignKey: 'livro_id' });

module.exports = EmprestimoLivro;