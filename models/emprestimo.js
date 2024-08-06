const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Aluno = require('./aluno');
const Livro = require('./livro');
const EmprestimoLivro = require('./emprestimo_livro');

class Emprestimo extends Model {}

Emprestimo.init({
  data_solicitacao: {
    type: DataTypes.DATE,
    allowNull: false
  },
  quantidade_livros: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT
  },
  situacao: {
    type: DataTypes.ENUM('em andamento', 'finalizado'),
    allowNull: false,
    defaultValue: 'em andamento'
  },
  data_devolucao: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'Emprestimo'
});

// Definir relacionamentos
Emprestimo.belongsTo(Aluno, { foreignKey: 'aluno_id' });
Aluno.hasMany(Emprestimo, { foreignKey: 'aluno_id' });

Emprestimo.belongsToMany(Livro, { through: EmprestimoLivro, foreignKey: 'emprestimo_id' });
Livro.belongsToMany(Emprestimo, { through: EmprestimoLivro, foreignKey: 'livro_id' });

module.exports = Emprestimo;
