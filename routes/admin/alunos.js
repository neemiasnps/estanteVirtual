const express = require('express');
const router = express.Router();
const Aluno = require('../../models/aluno');
const { Op } = require('sequelize');


// ===============================
// LISTAR (COM PAGINAÇÃO + BUSCA)
// ===============================
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';

        const where = {};

        if (search) {
            where.nomeCompleto = {
                [Op.like]: `%${search}%`
            };
        }

        const { rows: alunos, count } = await Aluno.findAndCountAll({
            where,
            limit,
            offset,
            order: [['id', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({ alunos, totalPages });

    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        res.status(500).json({ error: 'Erro ao buscar alunos' });
    }
});


// ===============================
// BUSCAR POR CPF
// ===============================
router.get('/buscar-aluno/:cpf', async (req, res) => {
    try {
        const cpf = (req.params.cpf || '').replace(/\D/g, '');

        // 🔥 validação básica
        if (!cpf || cpf.length !== 11) {
            return res.status(400).json({
                success: false,
                message: 'CPF inválido'
            });
        }

        const aluno = await Aluno.findOne({
            where: { cpf },
            attributes: ['id', 'nomeCompleto', 'celular', 'email', 'loja', 'status']
        });

        // 🔥 não encontrado
        if (!aluno) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não cadastrado'
            });
        }

        // 🔥 sucesso padronizado
        return res.status(200).json({
            success: true,
            data: aluno
        });

    } catch (error) {
        console.error('Erro ao buscar aluno por CPF:', error);

        return res.status(500).json({
            success: false,
            message: 'Erro interno ao buscar aluno'
        });
    }
});


// ===============================
// BUSCAR POR ID (EDIÇÃO)
// ===============================
router.get('/:id', async (req, res) => {
    try {
        const aluno = await Aluno.findByPk(req.params.id);

        if (!aluno) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        res.json(aluno);

    } catch (error) {
        console.error('Erro ao buscar aluno:', error);
        res.status(500).json({ error: 'Erro ao buscar aluno' });
    }
});


// ===============================
// CRIAR
// ===============================
router.post('/', async (req, res) => {
    try {
        const { cpf, nomeCompleto, celular, email, loja, status } = req.body;

        const cpfLimpo = cpf.replace(/\D/g, '');
        
        // Verifica CPF duplicado
        const cpfExiste = await Aluno.findOne({ where: { cpf: cpfLimpo } });

        if (cpfExiste) {
            return res.status(400).json({
                success: false,
                message: 'CPF já cadastrado'
            });
        }

        const novoAluno = await Aluno.create({
             cpf: cpfLimpo,
            nomeCompleto,
            celular,
            email,
            loja,
            status: status || 'ativo'
        });

        res.status(201).json({ success: true, aluno: novoAluno });

    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        res.status(500).json({ success: false, message: 'Erro ao criar aluno' });
    }
});


// ===============================
// ATUALIZAR
// ===============================
router.put('/:id', async (req, res) => {
    try {
        const { cpf, nomeCompleto, celular, email, loja, status } = req.body;

        const aluno = await Aluno.findByPk(req.params.id);

        if (!aluno) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado'
            });
        }

        const cpfLimpo = cpf.replace(/\D/g, '');

        // Verifica CPF duplicado (exceto o próprio registro)
        const cpfExiste = await Aluno.findOne({
            where: {
                cpf: cpfLimpo,
                id: { [Op.ne]: aluno.id }
            }
        });

        if (cpfExiste) {
            return res.status(400).json({
                success: false,
                message: 'CPF já cadastrado'
            });
        }

        await aluno.update({
            cpf: cpfLimpo,
            nomeCompleto,
            celular,
            email,
            loja,
            status
        });

        res.json({ success: true, aluno });

    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar aluno' });
    }
});


// ===============================
// EXCLUIR
// ===============================
router.delete('/:id', async (req, res) => {
    try {
        const aluno = await Aluno.findByPk(req.params.id);

        if (!aluno) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado'
            });
        }

        await aluno.destroy();

        res.json({
            success: true,
            message: 'Aluno excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir aluno'
        });
    }
});


// ===============================
// VALIDAR CPF (USADO NO FRONT)
// ===============================
router.get('/verificar-cpf/:cpf', async (req, res) => {
    try {
        const cpf = req.params.cpf.replace(/\D/g, '');

        const aluno = await Aluno.findOne({
            where: { cpf }
        });

        res.json({
            success: true,
            exists: !!aluno
        });

    } catch (error) {
        console.error('Erro ao verificar CPF:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar CPF'
        });
    }
});


module.exports = router;