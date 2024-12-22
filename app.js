const express = require('express');
const path = require('path');
const sequelize = require('./config/database'); // Verifique o caminho
const cors = require('cors');
const garantirAutenticado = require('./routes/auth');
const session = require('express-session');
const sessionStore = new session.MemoryStore();
const axios = require('axios');
//const { parseString } = require('xml2js');
const xml2js = require('xml2js');

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
  origin: 'https://biblioteca-nichele.onrender.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Permite cookies se necessário
  preflightContinue: true // Melhora o gerenciamento de preflight
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
app.use('/api/generos', require('./routes/generos'));

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

app.get('/audiobooks', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'audiobooks.html'));
});

/*app.get('/api/librivox', async (req, res) => {
    try {
        const response = await axios.get('https://librivox.org/api/feed/audiobooks/?linguagem=por&format=json');
        if (!response.data.books) {
            return res.status(404).json({ error: 'Nenhum livro encontrado na resposta' });
        }
        const books = response.data.books;
        res.json({ books });
    } catch (error) {
        console.error('Erro ao acessar a API Librivox:', error);
        res.status(500).json({ error: 'Erro ao acessar a API Librivox' });
    }
});*/

// Rota para obter os livros da API Librivox
/*app.get('/api/audiobooks', async (req, res) => {
    const { page = 1, limit = 12 } = req.query;  // Definindo o valor padrão de limit para 12
    const offset = (page - 1) * limit;

    try {
        // URL da API do Archive.org para buscar audiobooks
        const response = await axios.get('https://archive.org/advancedsearch.php', {
            params: {
                q: 'collection:"librivoxaudio" AND language:"por"',  // Filtra para coleção 'librivoxaudio' e idioma português
                fl: 'creator,description,genre,identifier,imagecount,language,title,item_size', // Inclui item_size nos campos de interesse
                rows: limit,  // Limita o número de resultados por página
                page,  // Página da consulta
                output: 'json'  // Formato de saída JSON
            }
        });

        if (!response.data || !response.data.response || !response.data.response.docs) {
            throw new Error('Dados não encontrados na resposta da API');
        }

        // Obtém o total de resultados encontrados (numFound) e os livros retornados
        const total = response.data.response.numFound;
        const audiobooks = response.data.response.docs.map(doc => ({
            id: doc.identifier,  // Identificador único do audiobook
            title: doc.title,  // Título do audiobook
            authors: doc.creator ? doc.creator.split('; ') : ['Desconhecido'],  // Autor(es)
            genre: doc.genre ? doc.genre.split('; ') : ['Desconhecido'],  // Gênero
            language: doc.language ? doc.language : 'Desconhecido',  // Idioma(s)
            description: doc.description || 'Descrição não disponível',  // Sinopse
            image: `https://archive.org/services/img/${doc.identifier}`,  // URL da capa
            link: `https://archive.org/details/${doc.identifier}`,  // Link para a página do audiobook
            // Convertendo item_size de bytes para MB
            item_size: doc.item_size ? (doc.item_size / 1048576).toFixed(2) + ' MB' : 'Tamanho não disponível',  // Tamanho em MB
        }));

        // Retorna os livros com o número total de audiobooks encontrados para ajuste da paginação no frontend
        res.json({
            total,
            books: audiobooks,  // Paginação será tratada no frontend
        });
    } catch (error) {
        console.error('Erro ao acessar Archive.org:', error.message);
        res.status(500).json({
            error: 'Erro ao buscar audiolivros. Tente novamente mais tarde.',
            details: error.message
        });
    }
});*/

app.get('/api/audiobooks', async (req, res) => {
    const { page = 1, limit = 12, search = '' } = req.query;  // Recebe o parâmetro de busca
    const offset = (page - 1) * limit;

    try {
        // URL da API do Archive.org para buscar audiobooks com base na pesquisa
        const response = await axios.get('https://archive.org/advancedsearch.php', {
            params: {
                q: `collection:"librivoxaudio" AND language:"por" AND (title:"${search}" OR creator:"${search}" OR genre:"${search}")`,  // Busca por título, autor ou gênero
                fl: 'creator,description,genre,identifier,imagecount,language,title,item_size', // Campos de interesse
                rows: limit,  // Limita o número de resultados por página
                page,  // Página da consulta
                output: 'json'  // Formato de saída JSON
            }
        });

        if (!response.data || !response.data.response || !response.data.response.docs) {
            throw new Error('Dados não encontrados na resposta da API');
        }

        // Obtém o total de resultados encontrados (numFound) e os audiobooks retornados
        const total = response.data.response.numFound;
        const audiobooks = await Promise.all(response.data.response.docs.map(async (doc) => {
            try {
                // Faz uma requisição para obter os metadados do audiobook
                const metadataResponse = await axios.get(`https://archive.org/metadata/${doc.identifier}`);
                const runtime = metadataResponse.data.metadata.runtime || 'Duração não disponível';

                // Monta o objeto com as informações
                return {
                    id: doc.identifier,  // Identificador único do audiobook
                    title: doc.title,  // Título do audiobook
                    authors: doc.creator ? doc.creator.split('; ') : ['Desconhecido'],  // Autor(es)
                    genre: doc.genre ? doc.genre.split('; ') : ['Desconhecido'],  // Gênero
                    language: doc.language ? doc.language : 'Desconhecido',  // Idioma(s)
                    description: doc.description || 'Descrição não disponível',  // Sinopse
                    image: `https://archive.org/services/img/${doc.identifier}`,  // URL da capa
                    link: `https://archive.org/details/${doc.identifier}`,  // Link para a página do audiobook
                    item_size: doc.item_size ? (doc.item_size / 1048576).toFixed(2) + ' MB' : 'Tamanho não disponível',  // Tamanho do arquivo em MB
                    duration: runtime,  // Duração extraída do metadado
                };
            } catch (error) {
                console.error(`Erro ao acessar metadado de ${doc.identifier}:`, error.message);
                return {
                    ...doc,
                    duration: 'Duração não disponível',
                };
            }
        }));

        // Retorna os livros com o número total de audiobooks encontrados para ajuste da paginação no frontend
        res.json({
            total,
            books: audiobooks,  // Audiobooks filtrados
        });
    } catch (error) {
        console.error('Erro ao acessar Archive.org:', error.message);
        res.status(500).json({
            error: 'Erro ao buscar audiolivros. Tente novamente mais tarde.',
            details: error.message
        });
    }
});

// Função de parsing de RSS extraída para fora da rota
const parseRSS = (xmlData) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlData, (err, result) => {
      if (err) {
        reject('Erro ao fazer parsing do XML');
      }
      const imageUrl = result?.rss?.channel?.[0]?.['itunes:image']?.[0]?.['$']?.href || 'https://via.placeholder.com/300x450?text=Imagem+indisponível';
      resolve(imageUrl);
    });
  });
};

app.get('/get-rss-image', async (req, res) => {
  const rssUrl = req.query.url;

  if (!rssUrl) {
    return res.status(400).json({ error: 'URL do RSS não fornecida' });
  }

  try {
    const response = await axios.get(rssUrl);
    const imageUrl = await parseRSS(response.data);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Erro ao processar o XML:', error);
    res.status(500).json({ error: 'Erro ao buscar o feed RSS' });
  }
});

//
const parseRSSForGenre = (xmlData) => {
    return new Promise((resolve, reject) => {
        xml2js.parseString(xmlData, (err, result) => {
            if (err) {
                reject('Erro ao fazer parsing do XML');
            }
            const genre = result?.rss?.channel?.[0]?.['itunes:category']?.[0]?.['$']?.text || 'Não especificado';
            resolve(genre);
        });
    });
};

// Endpoint para obter gênero
app.get('/get-rss-genre', async (req, res) => {
    const rssUrl = req.query.url;

    if (!rssUrl) {
        return res.status(400).json({ error: 'URL do RSS não fornecida' });
    }

    try {
        const response = await axios.get(rssUrl);
        const genre = await parseRSSForGenre(response.data);
        res.json({ genre });
    } catch (error) {
        console.error('Erro ao processar o XML:', error);
        res.status(500).json({ error: 'Erro ao buscar o feed RSS' });
    }
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
