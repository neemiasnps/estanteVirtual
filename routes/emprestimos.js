const express = require('express');
const router = express.Router();
const Emprestimo = require('../models/emprestimo');
const Livro = require('../models/livro');
const Estoque = require('../models/estoque');
const EmprestimoLivro = require('../models/emprestimo_livro');
const Aluno = require('../models/aluno');
const { Op } = require('sequelize');

function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}-${mes}-${ano}`;
}

// Rota para salvar um novo empréstimo
router.post('/', async (req, res) => {
    try {
        const { aluno_id, livros, quantidade_livros, data_solicitacao, descricao } = req.body;

        // Cria um novo empréstimo
        const emprestimo = await Emprestimo.create({
            aluno_id: aluno_id,
            quantidade_livros: quantidade_livros,
            data_solicitacao: data_solicitacao,
            descricao: descricao,
            situacao: 'em andamento'
        });

        // Recupera o ID do empréstimo criado
        const emprestimoId = emprestimo.id;
        console.log(`ID do Empréstimo: ${emprestimoId}`);

        // Associa os livros ao empréstimo e atualiza o estoque
        for (const livroId of livros) {
            console.log(`Associando Livro ID: ${livroId} ao Emprestimo ID: ${emprestimoId}`);

            // Cria o registro na tabela EmprestimoLivro
            await EmprestimoLivro.create({
                emprestimo_id: emprestimoId,
                livro_id: livroId
            });

            // Atualiza o estoque do livro
            const estoque = await Estoque.findOne({ where: { livro_id: livroId } });
            if (estoque) {
                estoque.estoque_locado += 1;
                estoque.estoque_disponivel -= 1;
                await estoque.save();
                console.log(`Estoque do Livro ID: ${livroId} atualizado.`);
            } else {
                console.error(`Estoque não encontrado para o Livro ID: ${livroId}`);
            }
        }

        res.json(emprestimo);
    } catch (error) {
        console.error('Erro ao salvar o empréstimo:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para buscar um empréstimo por ID
router.get('/:id', async (req, res) => {
    try {
        const emprestimoId = req.params.id;
        console.log(`Buscando empréstimo com ID: ${emprestimoId}`);

        // Busca o empréstimo pelo ID
        const emprestimo = await Emprestimo.findByPk(emprestimoId, {
            include: [
                {
                    model: Aluno, // Inclui os dados do aluno associado
                    attributes: ['cpf', 'id', 'nomeCompleto', 'celular', 'email', 'loja']
                },
                {
                    model: Livro, // Inclui os livros associados
                    through: { attributes: [] }, // Remove os atributos da tabela intermediária
                    attributes: ['id', 'titulo', 'autor', 'genero']
                }
            ]
        });

        if (!emprestimo) {
            console.log('Empréstimo não encontrado');
            return res.status(404).json({ message: 'Empréstimo não encontrado' });
        }

        console.log('Empréstimo encontrado:', emprestimo);

        // Retorna os dados do empréstimo com informações do aluno e livros
        res.json({
            emprestimo: {
                id: emprestimo.id,
                aluno: emprestimo.Aluno, // Dados do aluno
                data_solicitacao: emprestimo.data_solicitacao,
                data_devolucao: emprestimo.data_devolucao,
                descricao: emprestimo.descricao,
                situacao: emprestimo.situacao
            },
            livros: emprestimo.Livros // Livros associados
        });
    } catch (error) {
        console.error('Erro ao buscar o empréstimo:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Atualizar um empréstimo existente
router.put('/:id', async (req, res) => {
    try {
        const emprestimoId = req.params.id;
        const { aluno_id, livros, quantidade_livros, data_solicitacao, descricao } = req.body;

        // Encontrar o empréstimo e atualizar
        const emprestimo = await Emprestimo.findByPk(emprestimoId);

        if (!emprestimo) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }

        // Atualizar os dados do empréstimo
        await emprestimo.update({
            aluno_id,
            quantidade_livros,
            data_solicitacao,
            descricao
        });

        // Atualizar a relação com os livros se necessário

        res.status(200).json({ message: 'Empréstimo atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar o empréstimo:', error);
        res.status(500).json({ error: 'Erro ao atualizar o empréstimo' });
    }
});

// Rota para excluir um empréstimo
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // Encontrar o empréstimo pelo ID, incluindo os livros associados
        const emprestimo = await Emprestimo.findByPk(id, {
            include: [
                { model: Livro, as: 'Livros' }
            ]
        });

        if (!emprestimo) {
            return res.status(404).json({ message: 'Empréstimo não encontrado.' });
        }

        // Atualizar o estoque dos livros associados
        if (emprestimo.Livros && Array.isArray(emprestimo.Livros)) {
            for (const livro of emprestimo.Livros) {
                const estoque = await Estoque.findOne({ where: { livro_id: livro.id } });
                if (estoque) {
                    estoque.estoque_disponivel += 1;
                    estoque.estoque_locado -= 1;
                    await estoque.save();
                    console.log(`Estoque do Livro ID: ${livro.id} atualizado.`);
                } else {
                    console.error(`Estoque não encontrado para o Livro ID: ${livro.id}`);
                }
            }
        }

        // Excluir os registros na tabela intermediária
        await EmprestimoLivro.destroy({ where: { emprestimo_id: id } });

        // Excluir o empréstimo
        await emprestimo.destroy();

        res.status(200).json({ message: 'Empréstimo e associações excluídos com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir o empréstimo:', error);
        res.status(500).json({ message: 'Erro ao excluir o empréstimo.' });
    }
});

// Rota para exibir o PDF com os detalhes do empréstimo
router.get('/pdf/:id', async (req, res) => {
    const emprestimoId = req.params.id;

    // Aqui você deve buscar as informações do empréstimo pelo ID
    // Exemplo fictício:
    const emprestimo = {
        nome: 'João Silva',
        celular: '123456789',
        email: 'joao.silva@example.com',
        loja: 'Araucária',
        dataSolicitacao: '2024-07-28',
        livros: [
            { titulo: 'Livro A', autor: 'Autor A' },
            { titulo: 'Livro B', autor: 'Autor B' }
        ],
        descricao: 'Descrição do empréstimo.'
    };

    // Gerar o conteúdo HTML para o PDF
    const htmlContent = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { width: 100%; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; }
                .section { margin-bottom: 20px; }
                .section h2 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Detalhes do Empréstimo</h1>
                </div>
                <div class="section">
                    <h2>Informações do Aluno</h2>
                    <p><strong>Nome:</strong> ${emprestimo.nome}</p>
                    <p><strong>Celular:</strong> ${emprestimo.celular}</p>
                    <p><strong>Email:</strong> ${emprestimo.email}</p>
                    <p><strong>Loja:</strong> ${emprestimo.loja}</p>
                </div>
                <div class="section">
                    <h2>Detalhes do Empréstimo</h2>
                    <p><strong>Data da Solicitação:</strong> ${emprestimo.dataSolicitacao}</p>
                    <p><strong>Previsão de Entrega:</strong> ${new Date(new Date(emprestimo.dataSolicitacao).getTime() + (40 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}</p>
                </div>
                <div class="section">
                    <h2>Livros Emprestados</h2>
                    <ul>
                        ${emprestimo.livros.map(livro => `<li>${livro.titulo} - ${livro.autor}</li>`).join('')}
                    </ul>
                </div>
                <div class="section">
                    <h2>Descrição</h2>
                    <p>${emprestimo.descricao}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const nomeArquivo = `emprestimo_${emprestimoId}.pdf`;
        await gerarPdf(htmlContent, nomeArquivo);
        res.sendFile(`${__dirname}/${nomeArquivo}`);
    } catch (error) {
        console.error('Erro ao gerar o PDF:', error);
        res.status(500).send('Erro ao gerar o PDF.');
    }
});

// Rota para listar empréstimos com paginação e filtro
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const filtro = req.query.filtro || 'todos'; // Obtém o filtro da query string

    try {
        // Log para depuração
        console.log(`Paginação: página ${page}, limite ${limit}, offset ${offset}`);
        console.log(`Filtro recebido: ${filtro}`);

        // Definir a cláusula `where` com base no filtro
        let whereClause = {};
        if (filtro === 'em_andamento') {
            whereClause.situacao = 'em andamento';
        } else if (filtro === 'finalizado') {
            whereClause.situacao = 'finalizado';
        } else if (filtro === 'todos') {
            // Se filtro for 'todos', não aplica nenhum filtro
            whereClause = {}; 
        }

        console.log(`Cláusula WHERE: ${JSON.stringify(whereClause)}`); // Adicione isto para depuração

        // Consultar o banco de dados com a cláusula WHERE condicional
        const { count, rows } = await Emprestimo.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            attributes: ['id', 'data_solicitacao', 'situacao'],
            include: [
                {
                    model: Aluno,
                    attributes: ['nomeCompleto', 'loja']
                }
            ],
            order: [['id', 'DESC']]
        });

        // Log para depuração
        console.log(`Total de registros: ${count}`);
        console.log(`Empréstimos encontrados: ${rows.length}`);

        // Mapeamento dos dados recebidos
        const emprestimos = rows.map(emprestimo => ({
            id: emprestimo.id,
            nomeAluno: emprestimo.Aluno ? emprestimo.Aluno.nomeCompleto : 'Desconhecido',
            loja: emprestimo.Aluno ? emprestimo.Aluno.loja : 'N/A',
            data_solicitacao: emprestimo.data_solicitacao,
            situacao: emprestimo.situacao
        }));

        // Total de páginas baseado na contagem total e no limite por página
        const totalPages = Math.ceil(count / limit);

        // Resposta JSON
        res.json({
            emprestimos,
            totalPages
        });
    } catch (error) {
        console.error('Erro ao listar empréstimos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para buscar um empréstimo pelo ID
router.get('/buscar/:id', async (req, res) => {
    const emprestimoId = parseInt(req.params.id);

    if (isNaN(emprestimoId)) {
        return res.status(400).json({ message: 'ID inválido' });
    }

    try {
        // Encontre o empréstimo pelo ID
        const emprestimo = await Emprestimo.findOne({
            where: { id: emprestimoId },
            attributes: ['id', 'data_solicitacao', 'situacao'],
            include: [
                {
                    model: Aluno,
                    attributes: ['nomeCompleto', 'loja']
                }
            ]
        });

        if (emprestimo) {
            // Responde com os dados do empréstimo
            res.json({
                id: emprestimo.id,
                nomeAluno: emprestimo.Aluno ? emprestimo.Aluno.nomeCompleto : 'Desconhecido',
                loja: emprestimo.Aluno ? emprestimo.Aluno.loja : 'N/A',
                data_solicitacao: emprestimo.data_solicitacao,
                situacao: emprestimo.situacao
            });
        } else {
            res.status(404).json({ message: 'Empréstimo não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar empréstimo:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;
