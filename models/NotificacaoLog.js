const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class NotificacaoLog extends Model {}

NotificacaoLog.init({

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  // RELACIONAMENTOS
  emprestimo_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  emprestimo_livro_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  aluno_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  // CANAL
  canal: {
    type: DataTypes.ENUM('email', 'whatsapp'),
    allowNull: false
  },

  // EVENTO
  tipo: {
    type: DataTypes.ENUM(
      'novo_emprestimo',
      'finalizacao',
      'lembrete',
      'atraso',
      'avaliacao'
    ),
    allowNull: false
  },

  // DESTINATÁRIO
  destinatario: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // TELEFONE (WHATSAPP)
  telefone: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // TEMPLATE / PROVIDER
  template_id: {
    type: DataTypes.STRING,
    allowNull: true
  },

  provider_message_id: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // STATUS
  status: {
    type: DataTypes.ENUM('pendente', 'enviado', 'erro'),
    defaultValue: 'pendente'
  },

  erro: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // DEBUG
  payload: {
    type: DataTypes.JSON,
    allowNull: true
  },

  response: {
    type: DataTypes.JSON,
    allowNull: true
  }

}, {
  sequelize,
  modelName: 'NotificacaoLog',
  tableName: 'notificacao_logs',
  timestamps: true,
});

module.exports = NotificacaoLog;