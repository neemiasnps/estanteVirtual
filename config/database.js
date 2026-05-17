const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'estantevirtual',
  process.env.DB_USER || 'estantevirtual',
  process.env.DB_PASS || 'Nichele@2024',
  {
    host: process.env.DB_HOST || 'estantevirtual.mysql.dbaas.com.br',
    port: 3306,
    dialect: 'mysql',

    // 🔥 BLINDAGEM DE CONEXÃO
    pool: {
      max: 10,        // máximo de conexões simultâneas
      min: 0,
      acquire: 30000, // tempo máximo para pegar conexão
      idle: 10000     // fecha conexão ociosa
    },

    dialectOptions: {
      connectTimeout: 60000
    },

    logging: false, // evita overload no log em produção
    retry: {
      max: 5
    }
  }
);

// 🔥 AUTO-RETRY DE CONEXÃO (ANTI-QUEDA)
async function safeConnect() {
  let attempts = 0;

  while (attempts < 5) {
    try {
      await sequelize.authenticate();
      console.log('✔ Conexão com banco OK');
      return;
    } catch (err) {
      attempts++;
      console.error(`❌ Tentativa ${attempts} falhou:`, err.message);

      await new Promise(res => setTimeout(res, 5000)); // espera 5s
    }
  }

  console.error('🚨 Falha crítica ao conectar no banco após múltiplas tentativas');
}

safeConnect();

module.exports = sequelize;