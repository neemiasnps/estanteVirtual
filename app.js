require('dotenv').config();
const express = require("express");
const path = require("path");
const sequelize = require("./config/database"); // Verifique o caminho
const cors = require("cors");
const garantirAutenticado = require("./routes/auth");
const session = require("express-session");
const sessionStore = new session.MemoryStore();
const axios = require("axios");
//const { parseString } = require('xml2js');
const xml2js = require("xml2js");

const app = express();
const PORT = process.env.PORT || 3000; // Usa a variável de ambiente PORT fornecida pelo Replit

// Configuração do middleware de sessão
app.use(
  session({
    secret: 'biblioteca_nichele',
    resave: false,
    saveUninitialized: false,
    rolling: true, // renova tempo a cada requisição
    cookie: {
      maxAge: 30 * 60 * 1000, // 30 minutos
      httpOnly: true
    }
  })
);

app.get('/api/auth/status', (req, res) => {
  res.json({
    autenticado: !!req.session.usuario
  });
});

// Middlewares
app.use(express.json()); // Para JSON
app.use(express.urlencoded({ extended: true })); // Para dados de formulários

app.use(
    cors({
        origin: "http://bibliotecanichele.com.br/",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // Permite cookies se necessário
        preflightContinue: true, // Melhora o gerenciamento de preflight
    }),
);

// Arquivos Estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rotas
//app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/homes", require("./routes/homes"));

app.use("/api/auth", require("./routes/auth"));


// ROTAS PÚBLICAS
app.use("/api/public/livros", require("./routes/public/livros"));
app.use("/api/public/ebooks", require("./routes/public/ebooks"));
//app.use("/api/public/generos", require("./routes/public/generos"));
app.use("/api/public/audiobooks", require("./routes/public/audiobooks"));
app.use("/api/public/contato", require("./routes/public/contato"));

// ROTAS ADMIN (COM AUTENTICAÇÃO)
app.use("/api/admin/livros", garantirAutenticado, require("./routes/admin/livros"));
app.use("/api/admin/ebooks", garantirAutenticado, require("./routes/admin/ebooks"));
app.use("/api/admin/alunos", garantirAutenticado, require("./routes/admin/alunos"));
app.use("/api/admin/generos", garantirAutenticado, require("./routes/admin/generos"));
app.use("/api/admin/subgeneros", garantirAutenticado, require("./routes/admin/subgeneros"));
app.use("/api/admin/estoques", garantirAutenticado, require("./routes/admin/estoques"));
app.use("/api/admin/emprestimos", garantirAutenticado, require("./routes/admin/emprestimos"));


// APIs protegidas
//Livros
app.get("/gerenciar_livros/novo", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "livro-form.html"));
});
app.get("/gerenciar_livros/editar/:id", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "livro-form.html"));
});

//Ebook
app.get("/gerenciar_ebooks/novo", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "ebook-form.html"));
});
app.get("/gerenciar_ebooks/editar/:id", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "ebook-form.html"));
});

//Alunos
app.get("/gerenciar_alunos/novo", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "aluno-form.html"));
});
app.get("/gerenciar_alunos/editar/:id", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "aluno-form.html"));
});

app.use("/api/generos", garantirAutenticado, require("./routes/admin/generos"));
app.use("/api/subgeneros", garantirAutenticado, require("./routes/admin/subgeneros"));

//Emprestimos
app.get("/gerenciar_emprestimos/novo", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "requisicao-form.html"));
});
app.get("/gerenciar_emprestimos/editar/:id", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "requisicao-form.html"));
});

// Rota Principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Rotas Autenticadas
app.get("/gerenciar_alunos", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gerenciar_alunos.html"));
});

app.get("/gerenciar_livros", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gerenciar_livros.html"));
});

app.get("/gerenciar_ebooks", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gerenciar_ebooks.html"));
});

app.get("/gerenciar_emprestimos", garantirAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gerenciar_emprestimos.html"));
});

app.get("/contato", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "contato.html"));
});

app.get("/ebooks", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "ebooks.html"));
});

app.get("/como_funciona", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "como_funciona.html"));
});

app.get("/livros", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "livros.html"));
});

app.get("/audiobooks", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "audiobooks.html"));
});


// Teste de Conexão com o Banco de Dados
sequelize
    .authenticate()
    .then(() => {
        console.log("Conexão com o banco de dados foi bem-sucedida.");
    })
    .catch((err) => {
        console.error("Erro ao conectar ao banco de dados:", err);
    });

// Sincronização do Banco de Dados e Início do Servidor
sequelize
    .sync()
    .then(async () => {

         if (process.env.CRON === 'true') {
            console.log('Excecutando rotina de lembrete (CRON)...');
        // Inicia rotina automática de lembrete

	const executarLembretes = require("./jobs/lembreteEmprestimos");

	await executarLembretes();

         return;
	}

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Erro ao sincronizar o banco de dados:", err);
    });

// Tratamento de Rota Não Encontrada (404)
app.use((req, res, next) => {
    res.status(404).json({ error: "Rota não encontrada" });
});

// Tratamento de Erros Internos do Servidor (500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Ocorreu um erro interno no servidor" });
});
