const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('estantevirtual', 'estantevirtual', 'Nichele@2024', {
  host: 'estantevirtual.mysql.dbaas.com.br',
  port: 3306,
  dialect: 'mysql'
});

/*const sequelize = new Sequelize('sql10718959', 'sql10718959', 'MvPhEmM9ZW', {
  host: 'sql10.freesqldatabase.com',
  port: 3306,
  dialect: 'mysql'
});*/

sequelize.authenticate()
.then(() => console.log('Conexão com o banco de dados estabelecida com sucesso.'))
.catch(err => console.error('Não foi possível conectar ao banco de dados:', err));

module.exports = sequelize;