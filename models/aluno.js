const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // ajuste o caminho conforme necessário

class Aluno extends Model {}

Aluno.init({
    cpf: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    nomeCompleto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    celular: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    loja: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING, // Ou use `DataTypes.ENUM` se tiver valores específicos
        allowNull: false,
        defaultValue: 'ativo' // ou 'inativo', dependendo do que você preferir como padrão
    }
}, {
    sequelize,
    modelName: 'Alunos'
});

module.exports = Aluno;
