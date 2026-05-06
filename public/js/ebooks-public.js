let currentPage = 1;
const limit = 12;
let currentSearch = '';
let timeout;

document.addEventListener('DOMContentLoaded', () => {

    carregarEbooks();

    const searchInput = document.getElementById('search');

    if (searchInput) {
        searchInput.addEventListener('input', function () {

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                currentSearch = this.value.trim();
                currentPage = 1;
                carregarEbooks();
            }, 300);

        });
    }
});

async function carregarEbooks() {
    try {

        const res = await fetch(
            `/api/public/ebooks?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(currentSearch)}`
        );

        const data = await res.json();

        renderEbooks(data.livros || []);
        renderPaginacaoEbooks(data.totalPages || 1);

    } catch (error) {
        console.error('Erro ao carregar ebooks:', error);
    }
}

function renderEbooks(livros) {

    const container = document.getElementById('livros-container');
    container.innerHTML = '';

    livros.forEach(livro => {

        const card = document.createElement("div");
        card.classList.add("col", "s12", "m6", "l4");

        card.innerHTML = `
            <div class="card large" data-livro-id="${livro.id}">

                <div class="card-image waves-effect waves-block waves-light">
                    <img class="activator livro-imagem" src="${livro.foto}" alt="${livro.titulo}">
                </div>

                <div class="card-content">
                    <span class="card-title activator grey-text text-darken-4">
                        ${livro.titulo}
                        <i class="material-icons right">more_vert</i>
                    </span>

                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <p><strong>Gênero:</strong> ${livro.genero}</p>
                </div>

                <div class="card-action" style="display: flex; justify-content: space-between; align-items: center;">

                    <div class="col s6" style="text-align: left;">
                        <p class="livro-downloads">
                            <strong>Download:</strong> ${livro.download || 0}
                        </p>
                    </div>

                    <div class="col s6" style="text-align: right;">
                        <a href="${livro.url}" target="_blank"
                           class="btn-floating btn-small blue"
                           title="Baixar ebook"
                           onclick="incrementarDownload(${livro.id})">
                            <i class="material-icons">file_download</i>
                        </a>
                    </div>

                </div>

                <div class="card-reveal">
                    <span class="card-title grey-text text-darken-4">
                        ${livro.titulo}
                        <i class="material-icons right">close</i>
                    </span>

                    <p><strong>Sinopse:</strong> ${livro.sinopse || ''}</p>
                </div>

            </div>
        `;

        container.appendChild(card);
    });
}

function renderPaginacaoEbooks(totalPages) {

    const ul = document.getElementById('pagination-controls');
    ul.innerHTML = '';

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

    // Primeira e anterior
    if (currentPage > 1) {
        ul.innerHTML += `
        <li><a onclick="irParaPaginaEbooks(1)">«</a></li>
        <li><a onclick="irParaPaginaEbooks(${currentPage - 1})">‹</a></li>`;
    }

    // páginas
    for (let i = start; i <= end; i++) {
        ul.innerHTML += `
        <li class="${i === currentPage ? 'active' : ''}">
            <a onclick="irParaPaginaEbooks(${i})">${i}</a>
        </li>`;
    }

    // próxima e última
    if (currentPage < totalPages) {
        ul.innerHTML += `
        <li><a onclick="irParaPaginaEbooks(${currentPage + 1})">›</a></li>
        <li><a onclick="irParaPaginaEbooks(${totalPages})">»</a></li>`;
    }
}

function irParaPaginaEbooks(page) {
    currentPage = page;
    carregarEbooks();

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


// Função para incrementar o contador de downloads
function incrementarDownload(livroId) {
    fetch(`/api/public/ebooks/${livroId}/incrementar-download`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar o contador de downloads');
        }
        return response.json();
    })
    .then(data => {
        // Atualiza o valor de downloads na UI
        const livroElement = document.querySelector(`[data-livro-id="${livroId}"]`);
        if (livroElement) {
            const downloadElement = livroElement.querySelector('.livro-downloads');
            if (downloadElement) {
                downloadElement.textContent = `Download: ${data.download}`;
            }
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });
}