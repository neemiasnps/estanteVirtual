const express = require("express");
const router = express.Router();
const axios = require("axios");

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

        const response = await axios.get(
            "https://archive.org/advancedsearch.php",
            {
                params: {
                    q: `collection:"librivoxaudio" AND language:"por" AND (title:"${search}*" OR creator:"${search}*")`,
                    fl: "creator,description,genre,identifier,language,title,item_size",
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
            image: `https://archive.org/services/img/${doc.identifier}`,
            link: `https://archive.org/details/${doc.identifier}`,
            item_size: doc.item_size
                ? (doc.item_size / 1048576).toFixed(2) + " MB"
                : "N/D",
            duration: "Carregando..."
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
   DURAÇÃO INDIVIDUAL
========================= */
router.get("/duration/:id", async (req, res) => {

    const { id } = req.params;

    try {

        const response = await axios.get(
            `https://archive.org/metadata/${id}`,
            { timeout: 10000 }
        );

        const meta = response.data?.metadata || {};
        const files = response.data?.files || [];

        const runtime =
            meta.runtime ||
            meta.length ||
            files.find(f => f.length)?.length ||
            null;

        res.json({
            id,
            duration: runtime || "Duração não disponível"
        });

    } catch (error) {
        console.error("Erro duration:", error.message);

        res.status(200).json({
            id,
            duration: "Duração não disponível"
        });
    }
});

module.exports = router;