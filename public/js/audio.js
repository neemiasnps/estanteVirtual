let currentPage = 1;
const limit = 12; // 🔥 FIX: variável agora definida corretamente
let currentSearch = '';
let timeout;

document.addEventListener('DOMContentLoaded', () => {

    M.AutoInit();

    listarAudiobooks(1, '');

    const searchInput = document.getElementById('search');

    if (searchInput) {

        searchInput.addEventListener('input', function () {

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                currentSearch = this.value.trim();
                currentPage = 1;
                listarAudiobooks(1, currentSearch);
            }, 500);

        });
    }
});

/* =========================
   LISTAR AUDIOBOOKS
========================= */
async function listarAudiobooks(page = 1, searchQuery = '') {

    const container = document.getElementById('audiobooks-container');
    const preloader = document.getElementById('preloader-livrivox');

    currentPage = page;
    currentSearch = searchQuery;

    container.innerHTML = '';

    if (preloader) preloader.style.display = 'block';

    try {

        const response = await fetch(
            `/api/public/audiobooks?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`
        );

        const data = await response.json();
        const books = data.audiobooks || [];

        if (!books.length) {

            container.innerHTML = searchQuery
                ? '<p>Nenhum audiobook encontrado.</p>'
                : '';

            renderPaginacaoAudiobooks(0);
            return;
        }

        books.forEach(livro => {

            const card = document.createElement('div');
            card.classList.add('col', 's12', 'm6', 'l4');

            card.innerHTML = `
                <div class="card large">

                    <div class="card-image waves-effect waves-block waves-light">
                        <img class="activator livro-imagem"
                             src="${livro.image}"
                             alt="${livro.title}">
                    </div>

                    <div class="card-content">

                        <span class="card-title activator grey-text text-darken-4">
                            ${livro.title}
                            <i class="material-icons right">more_vert</i>
                        </span>

                        <p><strong>Autor:</strong> ${livro.authors?.join(', ') || 'Desconhecido'}</p>
                        <p><strong>Gênero:</strong> ${livro.genre?.join(', ') || 'Não informado'}</p>
                        <p><strong>Idioma:</strong> ${livro.language || 'Desconhecido'}</p>

                    </div>

                    <div class="card-action"
                         style="display:flex; justify-content:space-between; align-items:center;">

                        <div>
                            <p style="margin:0;">
                                <strong>Duração:</strong>
                                <span id="dur-${livro.id}">Carregando...</span>
                            </p>
                        </div>

                        <div>
                            <a href="${livro.link}"
                               target="_blank"
                               class="btn-floating btn-small blue">
                                <i class="material-icons">play_arrow</i>
                            </a>
                        </div>

                    </div>

                    <div class="card-reveal">

                        <span class="card-title grey-text text-darken-4">
                            ${livro.title}
                            <i class="material-icons right">close</i>
                        </span>

                        <p><strong>Sinopse:</strong> ${livro.description || 'Sem descrição'}</p>

                    </div>

                </div>
            `;

            container.appendChild(card);

            // 🔥 duração async
            fetch(`/api/public/audiobooks/duration/${livro.id}`)
                .then(res => res.json())
                .then(data => {
                    const el = document.getElementById(`dur-${livro.id}`);
                    if (el) el.innerText = data.duration || 'N/A';
                })
                .catch(() => {
                    const el = document.getElementById(`dur-${livro.id}`);
                    if (el) el.innerText = 'N/A';
                });
        });

        renderPaginacaoAudiobooks(data.total || 0);

    } catch (error) {

        console.error('Erro ao carregar audiobooks:', error);
        container.innerHTML = '<p>Erro ao carregar os audiobooks.</p>';

    } finally {

        if (preloader) preloader.style.display = 'none';
    }
}

/* =========================
   PAGINAÇÃO
========================= */
function renderPaginacaoAudiobooks(totalItems) {

    const ul = document.getElementById('pagination-controls');
    ul.innerHTML = '';

    const totalPages = Math.ceil(totalItems / limit);

    if (totalPages <= 1) return;

    const maxPages = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        start = 1;
        end = Math.min(totalPages, maxPages);
    }

    if (currentPage >= totalPages - 2) {
        end = totalPages;
        start = Math.max(1, totalPages - maxPages + 1);
    }

    if (currentPage > 1) {
        ul.innerHTML += `
            <li><a onclick="irParaPaginaAudiobooks(1)">«</a></li>
            <li><a onclick="irParaPaginaAudiobooks(${currentPage - 1})">‹</a></li>
        `;
    }

    for (let i = start; i <= end; i++) {
        ul.innerHTML += `
            <li class="${i === currentPage ? 'active' : ''}">
                <a onclick="irParaPaginaAudiobooks(${i})">${i}</a>
            </li>
        `;
    }

    if (currentPage < totalPages) {
        ul.innerHTML += `
            <li><a onclick="irParaPaginaAudiobooks(${currentPage + 1})">›</a></li>
            <li><a onclick="irParaPaginaAudiobooks(${totalPages})">»</a></li>
        `;
    }
}

function irParaPaginaAudiobooks(page) {
    currentPage = page;
    listarAudiobooks(page, currentSearch);

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}