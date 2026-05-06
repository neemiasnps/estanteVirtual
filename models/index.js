const sequelize = require('../config/database');

// IMPORTAÇÃO DOS MODELS
const Livro = require('./livro');
const Estoque = require('./estoque');
const Emprestimo = require('./emprestimo');
const EmprestimoLivro = require('./emprestimo_livro');
const Aluno = require('./aluno');
const Genero = require('./genero');
const Subgenero = require('./subgenero');
const Ebook = require('./ebook');

/* =========================
   REGISTRO DOS MODELS
========================= */

const models = {
  Livro,
  Estoque,
  Emprestimo,
  EmprestimoLivro,
  Aluno,
  Genero,
  Subgenero,
  Ebook
};

/* =========================
   ASSOCIAÇÕES AUTOMÁTICAS
========================= */

Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

/* =========================
   RELACIONAMENTOS EXTRAS (APENAS OS QUE NÃO ESTÃO NOS MODELS)
========================= */

// LIVRO → ESTOQUE
Livro.hasOne(Estoque, { foreignKey: 'livro_id' });
Estoque.belongsTo(Livro, { foreignKey: 'livro_id' });

// ALUNO → EMPRESTIMO
Aluno.hasMany(Emprestimo, { foreignKey: 'aluno_id', as: 'emprestimos' });
Emprestimo.belongsTo(Aluno, { foreignKey: 'aluno_id', as: 'aluno' });

// EMPRESTIMO ↔ LIVRO
Emprestimo.belongsToMany(Livro, {
  through: EmprestimoLivro,
  foreignKey: 'emprestimo_id'
});

Livro.belongsToMany(Emprestimo, {
  through: EmprestimoLivro,
  foreignKey: 'livro_id'
});

// ITENS DO EMPRÉSTIMO
Emprestimo.hasMany(EmprestimoLivro, {
  foreignKey: 'emprestimo_id',
  as: 'itens'
});

EmprestimoLivro.belongsTo(Emprestimo, {
  foreignKey: 'emprestimo_id'
});

Livro.hasMany(EmprestimoLivro, {
  foreignKey: 'livro_id'
});

EmprestimoLivro.belongsTo(Livro, {
  foreignKey: 'livro_id'
});

// EBOOK → GENERO / SUBGENERO
Ebook.belongsTo(Genero, { foreignKey: 'genero_id' });
Genero.hasMany(Ebook, { foreignKey: 'genero_id' });

Ebook.belongsTo(Subgenero, { foreignKey: 'subgenero_id' });
Subgenero.hasMany(Ebook, { foreignKey: 'subgenero_id' });

/* =========================
   SINCRONIZAÇÃO
========================= */

sequelize.sync({ alter: false })
  .then(() => {
    console.log('Modelos sincronizados com sucesso.');
  })
  .catch(error => {
    console.error('Erro ao sincronizar modelos:', error);
  });

/* =========================
   EXPORTAÇÃO
========================= */

module.exports = {
  sequelize,
  ...models
};