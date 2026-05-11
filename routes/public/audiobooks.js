const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");

// CACHE simples em memória
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutos

router.get("/", async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const searchRaw = (req.query.search || "").trim();

    // 🔥 busca mais eficiente (case-insensitive via archive)
    const search = searchRaw.toLowerCase();

    const cacheKey = `${page}-${limit}-${search}`;

    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.time < CACHE_TTL)) {
        return res.json(cached.data);
    }

    try {

        let query = `collection:"librivoxaudio" AND language:"por"`;

        if (search) {
            query += ` AND (title:"${search}*" OR creator:"${search}*")`;
        }

        const response = await axios.get(
            "https://archive.org/advancedsearch.php",
            {
                params: {
                    q: query,
                    fl: "creator,description,genre,identifier,language,title,item_size,runtime,length",
                    rows: limit,
                    page,
                    output: "json",
                },
                timeout: 15000
            }
        );

        const docs = response.data?.response?.docs || [];
        const total = response.data?.response?.numFound || 0;

        const audiobooks = docs.map(doc => ({
            id: doc.identifier,
            title: doc.title || "Sem título",
            authors: doc.creator ? doc.creator.split("; ") : ["Desconhecido"],
            genre: doc.genre ? doc.genre.split("; ") : ["Não informado"],
            language: doc.language || "Desconhecido",
            description: doc.description || "Sem descrição",
            image: `/api/public/audiobooks/cover/${doc.identifier}`,
            link: `https://archive.org/details/${doc.identifier}`,
            item_size: doc.item_size
                ? (doc.item_size / 1048576).toFixed(2) + " MB"
                : "N/D",
            duration:
            doc.runtime ||
            doc.length ||
            "Duração não disponível"
        }));

        const result = {
            audiobooks,
            total,
            page,
            limit
        };

        cache.set(cacheKey, {
            time: Date.now(),
            data: result
        });

        res.json(result);

    } catch (error) {
        console.error("Erro audiobooks:", error.message);

        res.status(500).json({
            error: "Erro ao carregar audiobooks"
        });
    }
});


/* =========================
   CACHE DE CAPAS
========================= */
router.get("/cover/:id", async (req, res) => {

    const { id } = req.params;

    try {

        const cacheDir = path.join(__dirname, "../../public/cache/audiobooks");

        // cria pasta se não existir
        await fsPromises.mkdir(cacheDir, { recursive: true });

        const imagePath = path.join(cacheDir, `${id}.jpg`);

        // se já existe no cache
        if (fs.existsSync(imagePath)) {
            return res.sendFile(imagePath);
        }

        // baixa do archive.org
        const response = await axios({
            method: "GET",
            url: `https://archive.org/services/img/${id}`,
            responseType: "stream",
            timeout: 10000
        });

        const writer = fs.createWriteStream(imagePath);

        response.data.pipe(writer);

        writer.on("finish", () => {
            return res.sendFile(imagePath);
        });

        writer.on("error", () => {
            return res.sendFile(
                path.join(__dirname, "../../public/images/sem-capa.jpg")
            );
        });

    } catch (error) {

        console.error("Erro capa:", error.message);

        return res.sendFile(
            path.join(__dirname, "../../public/images/sem-capa.jpg")
        );
    }
});

module.exports = router;