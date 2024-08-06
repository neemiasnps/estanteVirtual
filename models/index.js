const sequelize = require('./config/database');
const Livro = require('./models/livro');
const Estoque = require('./models/estoque');
const Emprestimo = require('./models/emprestimo');
const EmprestimoLivro = require('./models/emprestimo_livro');
const Aluno = require('./models/aluno');

// Definindo os relacionamentos
Livro.hasOne(Estoque, { foreignKey: 'livro_id' });
Estoque.belongsTo(Livro, { foreignKey: 'livro_id' });

Emprestimo.belongsTo(Aluno, { foreignKey: 'aluno_id' });
Aluno.hasMany(Emprestimo, { foreignKey: 'aluno_id' });

Emprestimo.belongsToMany(Livro, { through: EmprestimoLivro, foreignKey: 'emprestimo_id' });
Livro.belongsToMany(Emprestimo, { through: EmprestimoLivro, foreignKey: 'livro_id' });

// Sincronizando os modelos
sequelize.sync({ alter: true }).then(() => {
  console.log('Modelos sincronizados com o banco de dados.');
}).catch(error => {
  console.error('Erro ao sincronizar os modelos:', error);
});
