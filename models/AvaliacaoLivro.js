const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AvaliacaoLivro = sequelize.define('AvaliacaoLivro', {

    livro_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    aluno_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    estrelas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },

    comentario: {
        type: DataTypes.TEXT
    },

    aprovado: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }

}, {
    tableName: 'AvaliacoesLivros',
    timestamps: true
});

AvaliacaoLivro.associate = (models) => {

    AvaliacaoLivro.belongsTo(models.Livro, {
        foreignKey: 'livro_id'
    });

    AvaliacaoLivro.belongsTo(models.Aluno, {
        foreignKey: 'aluno_id'
    });

};

module.exports = AvaliacaoLivro;