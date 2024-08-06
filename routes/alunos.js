const express = require('express');
const router = express.Router();
const Aluno = require('../models/aluno');
const Emprestimo = require('../models/emprestimo');
const { Op } = require('sequelize'); // Importar Op para usar filtros LIKE

// Listar todos os alunos
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const offset = (page - 1) * limit;

        const { rows: alunos, count } = await Aluno.findAndCountAll({
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.json({ alunos, totalPages });
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});

// Criar um novo aluno
router.post('/', async (req, res) => {
    const { cpf, nomeCompleto, celular, email, loja } = req.body;
    try {
        const novoAluno = await Aluno.create({ 
            cpf, 
            nomeCompleto, 
            celular, 
            email, 
            loja 
        });
        res.status(201).json({ success: true, aluno: novoAluno });
    } catch (err) {
        console.error('Erro ao criar aluno:', err);
        res.status(500).json({ success: false, message: 'Erro ao criar aluno' });
    }
});

// Atualizar um aluno
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { cpf, nomeCompleto, celular, email, loja, status } = req.body;
    try {
        const aluno = await Aluno.findByPk(id);
        if (aluno) {
            aluno.cpf = cpf;
            aluno.nomeCompleto = nomeCompleto;
            aluno.celular = celular;
            aluno.email = email;
            aluno.loja = loja;
            aluno.status = status;
            await aluno.save();
            res.json({ success: true, aluno });
        } else {
            res.status(404).json({ success: false, message: 'Aluno não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar aluno' });
    }
});

// Excluir um aluno
/*router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const aluno = await Aluno.findByPk(id);
        if (aluno) {
            await aluno.destroy();
            res.json({ message: 'Aluno excluído com sucesso' });
        } else {
            res.status(404).json({ error: 'Aluno não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        res.status(500).json({ error: 'Erro ao excluir aluno' });
    }
});*/

// Rota para buscar detalhes de um aluno por ID
router.get('/:id', (req, res, next) => {
    const alunoId = req.params.id;

    Aluno.findByPk(alunoId)
        .then(aluno => {
            if (!aluno) {
                res.status(404).json({ error: 'Aluno não encontrado' });
            } else {
                res.json(aluno);
            }
        })
        .catch(err => {
            console.error('Erro ao buscar detalhes do aluno:', err);
            res.status(500).json({ error: 'Erro interno ao buscar detalhes do aluno' });
        });
});

// Rota para verificar a existência do CPF
router.get('/verificar-cpf/:cpf', async (req, res) => {
    try {
        const cpf = req.params.cpf;
        console.log(`Verificando CPF: ${cpf}`);

        // Encontre o aluno no banco de dados com o CPF fornecido
        const aluno = await Aluno.findOne({ cpf: cpf });
        if (aluno) {
            return res.json({ success: true, exists: true });
        } else {
            return res.json({ success: true, exists: false });
        }
    } catch (error) {
        console.error('Erro ao verificar CPF:', error);
        res.status(500).json({ success: false, message: 'Erro ao verificar CPF.' });
    }
});

// Rota para buscar aluno por CPF
router.get('/buscar-aluno/:cpf', async (req, res) => {
    const cpf = req.params.cpf;

    try {
        const aluno = await Aluno.findOne({ where: { cpf: cpf } });

        if (aluno) {
            res.json({
                id: aluno.id,
                nome: aluno.nomeCompleto,
                celular: aluno.celular,
                email: aluno.email,
                loja: aluno.loja
            });
        } else {
            res.status(404).json({ error: 'Aluno não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({ error: 'Erro ao buscar aluno' });
    }
});

// Rota para buscar alunos pelo nome
router.get('/buscar-nome/:nome', async (req, res) => {
    const nome = req.params.nome;

    if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    try {
        const alunos = await Aluno.findAll({
            where: {
                nomeCompleto: {
                    [Op.like]: `%${nome}%` // Filtro LIKE, ignorando maiúsculas e minúsculas
                }
            }
        });

        if (alunos.length > 0) {
            res.json(alunos.map(aluno => ({
                id: aluno.id,
                nome: aluno.nomeCompleto,
                cpf: aluno.cpf,
                celular: aluno.celular,
                email: aluno.email,
                loja: aluno.loja
            })));
        } else {
            res.status(404).json({ error: 'Nenhum aluno encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Excluir um aluno
// routes/alunos.js
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const aluno = await Aluno.findByPk(id);

        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        // Verifica se o aluno tem empréstimos
        const emprestimos = await Emprestimo.findAll({
            where: { aluno_id: id }
        });

        if (emprestimos.length > 0) {
            // Se o aluno tem empréstimos, apenas desative o status
            aluno.status = 'inativo'; // ou o valor correspondente para inativo
            await aluno.save();
            return res.json({ message: 'Aluno desativado com sucesso' });
        } else {
            // Caso contrário, exclua o aluno
            await aluno.destroy();
            return res.json({ message: 'Aluno excluído com sucesso' });
        }
    } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        res.status(500).json({ error: 'Erro ao excluir aluno' });
    }
});


module.exports = router;
