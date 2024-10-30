const express = require('express');
const path = require('path');
const sequelize = require('./config/database'); // Verifique o caminho
const cors = require('cors');
const garantirAutenticado = require('./routes/auth');
const session = require('express-session');
const sessionStore = new session.MemoryStore();

const app = express();
const PORT = process.env.PORT || 3000; // Usa a variável de ambiente PORT fornecida pelo Replit

// Configuração do middleware de sessão
app.use(session({
    store: sessionStore,
    secret: 'seu_segredo', // Substitua por uma string secreta
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // Defina como `true` se você usar HTTPS
        maxAge: 30 * 60 * 1000 // Tempo de expiração da sessão: 30 minutos
    }
}));

// Middlewares  
app.use(express.json()); // Para JSON
app.use(express.urlencoded({ extended: true })); // Para dados de formulários
app.use(cors({
  origin: 'https://biblioteca-nichele.onrender.com'
}));

// Arquivos Estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/livros', require('./routes/livros'));
app.use('/api/emprestimos', require('./routes/emprestimos'));
app.use('/api/estoques', require('./routes/estoques'));
app.use('/api/contato', require('./routes/contato'));
app.use('/api/alunos', require('./routes/alunos'));
app.use('/api/ebooks', require('./routes/ebooks'));
app.use('/api/homes', require('./routes/homes'));
app.use('/api/pdf', require('./routes/pdf'));

// Rota Principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Rotas Autenticadas
app.get('/gerenciar_alunos', garantirAutenticado, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'gerenciar_alunos.html'));
});

app.get('/gerenciar_livros', garantirAutenticado, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'gerenciar_livros.html'));
});

app.get('/gerenciar_ebooks', garantirAutenticado, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'gerenciar_ebooks.html'));
});

app.get('/gerenciar_emprestimos', garantirAutenticado, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'gerenciar_emprestimos.html'));
});

app.get('/contato', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contato.html'));
});

app.get('/ebooks', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ebooks.html'));
});

app.get('/como_funciona', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'como_funciona.html'));
});

app.get('/livros', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'livros.html'));
});

// Teste de Conexão com o Banco de Dados
sequelize.authenticate()
    .then(() => {
        console.log('Conexão com o banco de dados foi bem-sucedida.');
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados:', err);
    });

// Sincronização do Banco de Dados e Início do Servidor
sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Erro ao sincronizar o banco de dados:', err);
    });

// Tratamento de Rota Não Encontrada (404)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de Erros Internos do Servidor (500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor' });
});
