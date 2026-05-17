require('dotenv').config();
const express = require("express");
const path = require("path");
const sequelize = require("./config/database"); // Verifique o caminho
const cors = require("cors");
const authMiddleware = require("./middlewares/authMiddleware");
const session = require("express-session");
const axios = require("axios");
const xml2js = require("xml2js");
const {inicializarConfiguracoes} = require('./services/configuracaoService');

const app = express();
const PORT = process.env.PORT || 3000; // Usa a variável de ambiente PORT fornecida pelo Replit

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

// Configuração do middleware de sessão
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'biblioteca_nichele',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 30 * 60 * 1000, // 30 minutos
      httpOnly: true,
      sameSite: 'lax'
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
        origin: "https://bibliotecanichele.com.br",
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

app.use("/api/public/avaliacoes", require("./routes/public/avaliacoes"));
app.use("/api/public/validar-avaliacao", require("./routes/public/validar_avaliacao"));
app.use("/api/public/salvar-avaliacao", require("./routes/public/salvar_avaliacao"));

app.use("/livro", require("./routes/public/livro"));


// ROTAS ADMIN (COM AUTENTICAÇÃO)
app.use("/api/admin/livros", authMiddleware, require("./routes/admin/livros"));
app.use("/api/admin/ebooks", authMiddleware, require("./routes/admin/ebooks"));
app.use("/api/admin/alunos", authMiddleware, require("./routes/admin/alunos"));
app.use("/api/admin/generos", authMiddleware, require("./routes/admin/generos"));
app.use("/api/admin/subgeneros", authMiddleware, require("./routes/admin/subgeneros"));
app.use("/api/admin/estoques", authMiddleware, require("./routes/admin/estoques"));
app.use("/api/admin/emprestimos", authMiddleware, require("./routes/admin/emprestimos"));
app.use("/api/admin/avaliacoes", authMiddleware, require("./routes/admin/avaliacoes"));
app.use("/api/admin/configuracoes", authMiddleware, require("./routes/admin/configuracoes"));


// APIs protegidas
//Livros
app.get("/gerenciar_livros/novo", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "livro-form.html"));
});
app.get("/gerenciar_livros/editar/:id", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "livro-form.html"));
});

//Ebook
app.get("/gerenciar_ebooks/novo", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "ebook-form.html"));
});
app.get("/gerenciar_ebooks/editar/:id", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "ebook-form.html"));
});

//Alunos
app.get("/gerenciar_alunos/novo", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "aluno-form.html"));
});
app.get("/gerenciar_alunos/editar/:id", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "aluno-form.html"));
});

app.use("/api/generos", authMiddleware, require("./routes/admin/generos"));
app.use("/api/subgeneros", authMiddleware, require("./routes/admin/subgeneros"));

//Emprestimos
app.get("/gerenciar_emprestimos/novo", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "requisicao-form.html"));
});
app.get("/gerenciar_emprestimos/editar/:id", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "requisicao-form.html"));
});

// Rota Principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Rotas Autenticadas
app.get("/gerenciar_alunos", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gerenciar_alunos.html"));
});

app.get("/gerenciar_livros", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gerenciar_livros.html"));
});

app.get("/gerenciar_ebooks", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gerenciar_ebooks.html"));
});

app.get("/gerenciar_emprestimos", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gerenciar_emprestimos.html"));
});

app.get("/gerenciar_avaliacoes", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gerenciar_avaliacoes.html"));
});

app.get("/gerenciar_configuracoes", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "gerenciar_configuracoes.html"));
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

        await inicializarConfiguracoes();

        if (process.env.CRON === 'true') {
            console.log('🟡 Iniciando CRONs...');

            try {
                const iniciarLembretesEmprestimos = require("./jobs/lembreteEmprestimos");
                const iniciarAtrasosEmprestimos = require("./jobs/atrasoEmprestimos");

                if (typeof iniciarLembretesEmprestimos === 'function') {
                    iniciarLembretesEmprestimos();
                    console.log('✔ lembreteEmprestimos iniciado');
                } else {
                    console.error('❌ lembreteEmprestimos não é função');
                }

                if (typeof iniciarAtrasosEmprestimos === 'function') {
                    iniciarAtrasosEmprestimos();
                    console.log('✔ atrasoEmprestimos iniciado');
                } else {
                    console.error('❌ atrasoEmprestimos não é função');
                }

            } catch (error) {
                console.error('❌ Erro ao iniciar CRONs:', error);
            }
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

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    return res.status(500).json({
        error: "Ocorreu um erro interno no servidor"
    });
});
