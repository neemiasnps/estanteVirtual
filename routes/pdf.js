const express = require('express');
const ejs = require('ejs');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const enviarEmail = require('../public/js/mailer');
const Emprestimo = require('../models/emprestimo');
const Aluno = require('../models/aluno');
const Livro = require('../models/livro'); // Ajuste o caminho conforme necessário
const Estoque = require('../models/estoque');

const router = express.Router();

async function gerarPdf(htmlContent) {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf();
        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error('Erro ao gerar o PDF:', error);
        throw error;
    }
}

// Rota para exibir o PDF com os detalhes do empréstimo
router.get('/pdf/:id', async (req, res) => {
    console.log(`Recebida solicitação para o ID: ${req.params.id}`);
    const emprestimoId = req.params.id;

    try {
        // Obter dados do empréstimo
        const emprestimo = await obterDadosEmprestimo(emprestimoId);

        // Renderizar o template EJS para HTML
        const ejsPath = path.join(__dirname, '../views', 'emprestimo.ejs');
        const htmlContent = await ejs.renderFile(ejsPath, { emprestimo });

        // Gerar o PDF
        const pdfBuffer = await gerarPdf(htmlContent);

        // Enviar o PDF como resposta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=emprestimo_${emprestimoId}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Erro ao gerar o PDF:', error);
        res.status(500).send('Erro ao gerar o PDF.');
    }
});

// Função para obter dados do empréstimo e do aluno
async function obterDadosEmprestimo(emprestimoId) {
  try {
    const emprestimo = await Emprestimo.findByPk(emprestimoId, {
      include: [
        { model: Livro, as: 'Livros' },
        { model: Aluno, as: 'Aluno' }
      ]
    });

    if (!emprestimo) {
      throw new Error('Empréstimo não encontrado');
    }

    if (!emprestimo.Aluno || !emprestimo.Livros) {
      throw new Error('Dados do aluno ou livros não encontrados');
    }

    const dataSolicitacao = new Date(emprestimo.data_solicitacao);
    //const dataPrevista = new Date(dataSolicitacao);
    //dataPrevista.setDate(dataSolicitacao.getDate() + 40);
    const dataPrevista = new Date(dataSolicitacao.getTime() + (40 * 24 * 60 * 60 * 1000));

    // Formatar a data
    const formatarData = (data) => data.toISOString().split('T')[0]; // yyyy-mm-dd

    return {
      aluno: {
        nome: emprestimo.Aluno.nomeCompleto || 'Nome não disponível',
        email: emprestimo.Aluno.email || 'Email não disponível',
        loja: emprestimo.Aluno.loja || 'Loja não disponível',
        telefone: emprestimo.Aluno.celular || 'Telefone não disponível'
      },
      emprestimo: {
        id: emprestimo.id,
        //dataSolicitacao: emprestimo.data_solicitacao,
        //dataPrevista: dataPrevista.toISOString().split('T')[0],
        dataSolicitacao: formatarData(dataSolicitacao),
        dataPrevista: formatarData(dataPrevista),
        descricao: emprestimo.descricao
      },
      livros: emprestimo.Livros.map(livro => ({
        id: livro.id,
        titulo: livro.titulo
      }))
    };
  } catch (error) {
    console.error('Erro ao obter dados do empréstimo:', error);
    throw error;
  }
}

// Rota para enviar e-mail
router.post('/enviar-email/:id', async (req, res) => {
  const emprestimoId = req.params.id;

  try {
    const dadosEmprestimo = await obterDadosEmprestimo(emprestimoId);
    const assunto = `Biblioteca Nichele - Requisição n° ${dadosEmprestimo.emprestimo.id}`;
    const corpo = comporCorpoEmail(dadosEmprestimo);

    await enviarEmail(dadosEmprestimo.aluno.email, assunto, corpo);

    res.status(200).send('E-mail enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).send('Erro ao enviar e-mail.');
  }
});

function comporCorpoEmail(dadosEmprestimo) {
  const { aluno, emprestimo, livros } = dadosEmprestimo;

  function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}-${mes}-${ano}`;
  }

  const dataSolicitacaoFormatada = formatarData(emprestimo.dataSolicitacao);
  const dataPrevistaFormatada = formatarData(emprestimo.dataPrevista);

  const tabelaLivros = livros.map(livro => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${livro.id}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${livro.titulo}</td>
    </tr>
  `).join('');

  return `
    <html>
      <head>
        <style>
          .container {
            width: 80%;
            margin: auto;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .header {
            background-color: #26a69a;
            color: white;
            padding: 10px 0;
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f4f4f4;
          }
          p {
            margin: 0;
            padding: 0 0 10px;
          }
          .footer {
            margin-top: 20px;
            padding: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Detalhes do Empréstimo</h2>
          </div>
          <p></p>
          <p><strong>Aluno:</strong> ${aluno.nome}</p>
          <p><strong>E-mail:</strong> ${aluno.email}</p>
          <p><strong>Loja:</strong> ${aluno.loja}</p>
          <p><strong>Telefone:</strong> ${aluno.telefone}</p>
          <p><strong>Data da Solicitação:</strong> ${dataSolicitacaoFormatada}</p>
          <p><strong>Data Prevista:</strong> ${dataPrevistaFormatada}</p>
          <p><strong>Descrição:</strong> ${emprestimo.descricao}</p>
          <h4>Livros Emprestados:</h4>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
              </tr>
            </thead>
            <tbody>
              ${tabelaLivros}
            </tbody>
          </table>
          <div class="footer">
            <p>Este é um e-mail automático gerado pelo sistema de gerenciamento de empréstimos da Biblioteca Nichele.</p>
            <p>Para mais informações, entre em contato conosco através do e-mail <a href="mailto:treinamento@nichele.com.br">treinamento@nichele.com.br</a>.</p>
            <p>Endereço: R. Francisco Derosso, 3680 - Xaxim, Curitiba - PR, 81720-000</p>
          </div>
        </div>
      </body>
    </html>
  `;
}


// Rota para finalizar o empréstimo
router.post('/finalizar/:id', async (req, res) => {
    const emprestimoId = req.params.id;

    try {
        const emprestimo = await Emprestimo.findByPk(emprestimoId, {
            include: [
                { model: Livro, as: 'Livros' }
            ]
        });

        if (!emprestimo) {
            throw new Error('Empréstimo não encontrado');
        }

        emprestimo.situacao = 'finalizado';
        emprestimo.data_devolucao = new Date().toISOString().split('T')[0]; // Data atual no formato yyyy-mm-dd
        await emprestimo.save();

        // Atualizar o estoque dos livros
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

        const dadosEmprestimo = await obterDadosEmprestimo(emprestimoId);
        const assunto = `Biblioteca Nichele - Requisição n° ${dadosEmprestimo.emprestimo.id}`;
        const corpo = comporCorpoEmailFinalizado(dadosEmprestimo);
        await enviarEmail(dadosEmprestimo.aluno.email, assunto, corpo);

        res.status(200).send('Empréstimo finalizado e e-mail enviado com sucesso!');
    } catch (error) {
        console.error('Erro ao finalizar o empréstimo:', error);
        res.status(500).send('Erro ao finalizar o empréstimo.');
    }
});



function comporCorpoEmailFinalizado(dadosEmprestimo) {
  const { aluno, emprestimo } = dadosEmprestimo;

  function formatarData(data) {
    const [ano, mes, dia] = data.split('-');
    return `${dia}-${mes}-${ano}`;
  }

  const dataDevolucaoFormatada = formatarData(new Date().toISOString().split('T')[0]);

  return `
    <html>
      <head>
        <style>
          .container {
            width: 80%;
            margin: auto;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          .header {
            background-color: #26a69a;
            color: white;
            padding: 10px 0;
            text-align: center;
          }
          p {
            margin: 0;
            padding: 0 0 10px;
          }
          .footer {
            margin-top: 20px;
            padding: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Empréstimo Finalizado</h2>
          </div>
          <p></p>
          <p>Prezado(a) ${aluno.nome},</p>
          <p>Seu empréstimo do livro foi finalizado com sucesso.</p>
          <p><strong>Data da Devolução:</strong> ${dataDevolucaoFormatada}</p>
          <div class="footer">
            <p>Este é um e-mail automático gerado pelo sistema de gerenciamento de empréstimos da Biblioteca Nichele.</p>
            <p>Para mais informações, entre em contato conosco através do e-mail <a href="mailto:treinamento@nichele.com.br">treinamento@nichele.com.br</a>.</p>
            <p>Endereço: R. Francisco Derosso, 3680 - Xaxim, Curitiba - PR, 81720-000</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

module.exports = router;