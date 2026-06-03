require('dotenv').config();

const express = require("express");
const path = require("path");
const sequelize = require("./config/database");
const cors = require("cors");
const authMiddleware = require("./middlewares/authMiddleware");
const session = require("express-session");
const axios = require("axios");
const xml2js = require("xml2js");

const { inicializarConfiguracoes } = require('./services/configuracaoService');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * VIEW ENGINE
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * SESSION
 */
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'biblioteca_nichele',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

/**
 * AUTH STATUS
 */
app.get('/api/auth/status', (req, res) => {
  res.json({
    autenticado: !!req.session.usuario
  });
});

/**
 * MIDDLEWARES
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "https://bibliotecanichele.com.br",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: true,
  })
);

/**
 * STATIC
 */
app.use(express.static(path.join(__dirname, "public")));

/**
 * ROTAS API
 */
app.use("/api/homes", require("./routes/homes"));
app.use("/api/auth", require("./routes/auth"));

/**
 * ROTAS PÚBLICAS
 */
app.use("/api/public/livros", require("./routes/public/livros"));
app.use("/api/public/ebooks", require("./routes/public/ebooks"));
app.use("/api/public/audiobooks", require("./routes/public/audiobooks"));
app.use("/api/public/contato", require("./routes/public/contato"));
app.use("/api/public/avaliacoes", require("./routes/public/avaliacoes"));
app.use("/api/public/validar-avaliacao", require("./routes/public/validar_avaliacao"));
app.use("/api/public/salvar-avaliacao", require("./routes/public/salvar_avaliacao"));
app.use("/livro", require("./routes/public/livro"));

/**
 * ROTAS ADMIN
 */
app.use("/api/admin/livros", authMiddleware, require("./routes/admin/livros"));
app.use("/api/admin/ebooks", authMiddleware, require("./routes/admin/ebooks"));
app.use("/api/admin/alunos", authMiddleware, require("./routes/admin/alunos"));
app.use("/api/admin/generos", authMiddleware, require("./routes/admin/generos"));
app.use("/api/admin/subgeneros", authMiddleware, require("./routes/admin/subgeneros"));
app.use("/api/admin/estoques", authMiddleware, require("./routes/admin/estoques"));
app.use("/api/admin/emprestimos", authMiddleware, require("./routes/admin/emprestimos"));
app.use("/api/admin/avaliacoes", authMiddleware, require("./routes/admin/avaliacoes"));
app.use("/api/admin/configuracoes", authMiddleware, require("./routes/admin/configuracoes"));

/**
 * PÁGINAS ADMIN
 */
app.get("/gerenciar_livros", authMiddleware, (req, res) =>
  res.sendFile(path.join(__dirname, "views", "gerenciar_livros.html"))
);

app.get("/gerenciar_ebooks", authMiddleware, (req, res) =>
  res.sendFile(path.join(__dirname, "views", "gerenciar_ebooks.html"))
);

app.get("/gerenciar_alunos", authMiddleware, (req, res) =>
  res.sendFile(path.join(__dirname, "views", "gerenciar_alunos.html"))
);

app.get("/gerenciar_emprestimos", authMiddleware, (req, res) =>
  res.sendFile(path.join(__dirname, "views", "gerenciar_emprestimos.html"))
);

app.get("/gerenciar_avaliacoes", authMiddleware, (req, res) =>
  res.sendFile(path.join(__dirname, "views", "gerenciar_avaliacoes.html"))
);

app.get("/gerenciar_configuracoes", authMiddleware, (req, res) =>
  res.sendFile(path.join(__dirname, "views", "gerenciar_configuracoes.html"))
);

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

/**
 * PÁGINAS PÚBLICAS
 */
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "index.html"))
);

app.get("/contato", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "contato.html"))
);

app.get("/ebooks", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "ebooks.html"))
);

app.get("/livros", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "livros.html"))
);

app.get("/audiobooks", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "audiobooks.html"))
);

app.get("/como_funciona", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "como_funciona.html"))
);

/**
 * 404
 */
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

/**
 * 500
 */
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  return res.status(500).json({
    error: "Ocorreu um erro interno no servidor"
  });
});

/**
 * STARTUP SEGURO
 */
async function startServer() {
  try {
    console.log("🔄 Iniciando sistema...");

    await sequelize.authenticate();
    console.log("✔ Banco conectado");

    await sequelize.sync();
    console.log("✔ Modelos sincronizados");

    await inicializarConfiguracoes();

    iniciarCronJobs();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Erro ao iniciar aplicação:", error);
    process.exit(1);
  }
}

/**
 * CRON JOBS ISOLADOS
 */
function iniciarCronJobs() {
  try {
    require("./jobs/lembreteEmprestimos")();
    console.log("✔ lembreteEmprestimos iniciado");

    require("./jobs/atrasoEmprestimos")();
    console.log("✔ atrasoEmprestimos iniciado");

  } catch (error) {
    console.error("❌ Erro ao iniciar CRONs:", error);
  }
}

startServer();