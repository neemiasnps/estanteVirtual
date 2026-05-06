let currentPage = 1;
const limit = 12;
let currentSearch = '';
let timeout;

document.addEventListener('DOMContentLoaded', () => {

    carregarLivros();

    const searchInput = document.getElementById('search');

    if (searchInput) {
        searchInput.addEventListener('input', function () {

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                currentSearch = this.value.trim();
                currentPage = 1;
                carregarLivros();
            }, 300);

        });
    }
});

async function carregarLivros() {
    try {

        const res = await fetch(
            `/api/public/livros?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(currentSearch)}`
        );

        const data = await res.json();

        console.log('📦 Resposta da API:', data);
        console.log('📚 Livros recebidos:', data.livros);

        renderLivros(data.livros || []);
        renderPaginacao(data.totalPages || 1);

    } catch (error) {
        console.error('Erro ao carregar livros:', error);
    }
}

function renderLivros(livros) {
    const container = document.getElementById('livros-container');
    container.innerHTML = '';

    livros.forEach(livro => {

        const estoque = livro.Estoque || {};
        const situacaoClasse = estoque.estoque_disponivel >= 1 ? "disponível" : "locado";

        const card = document.createElement("div");
        card.classList.add("col", "s12", "m6", "l4");

        card.innerHTML = `
            <div class="card large">

                <div class="card-image waves-effect waves-block waves-light">
                    <img class="activator livro-imagem" src="${livro.foto}" alt="${livro.titulo}">
                </div>

                <div class="card-content">
                    <span class="card-title activator grey-text text-darken-4">
                        ${livro.titulo}
                        <i class="material-icons right">more_vert</i>
                    </span>

                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <p><strong>Gênero:</strong> ${livro.Genero?.nome || '-'}</p>
                </div>

                <div class="card-action" style="display: flex; justify-content: space-between; align-items: center;">

                    <div class="col s8" style="text-align: left;">
                        ${
                            situacaoClasse === "disponível"
                                ? `<p class="${situacaoClasse}" style="margin: 0;"><strong>Solicite seu empréstimo</strong></p>`
                                : `<p class="${situacaoClasse}" style="margin: 0;"><strong>Situação:</strong> ${situacaoClasse}</p>`
                        }
                    </div>

                    <div class="col s4" style="text-align: right;">
                        ${
                            situacaoClasse === "disponível"
                                ? `<a href="https://wa.me/5541998000484?text=Estou%20interessado%20no%20livro%20${encodeURIComponent(livro.titulo)}"
                                     target="_blank"
                                     class="btn-floating btn-small green"
                                     title="Enviar mensagem no WhatsApp">
                                        <i class="material-icons">add</i>
                                   </a>`
                                : `<a class="btn-floating btn-small grey"
                                     style="pointer-events: none; opacity: 0.5;"
                                     title="Não disponível para empréstimo">
                                        <i class="material-icons">add</i>
                                   </a>`
                        }
                    </div>

                </div>

                <div class="card-reveal">
                    <span class="card-title grey-text text-darken-4">
                        ${livro.titulo}
                        <i class="material-icons right">close</i>
                    </span>

                    <p><strong>Sinopse:</strong> ${livro.sinopse}</p>
                </div>

            </div>
        `;

        container.appendChild(card);
    });
}

function renderPaginacao(totalPages) {
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
        <li>
            <a onclick="irParaPagina(1)">«</a>
        </li>
        <li>
            <a onclick="irParaPagina(${currentPage - 1})">‹</a>
        </li>`;
    }

    // páginas
    for (let i = start; i <= end; i++) {
        ul.innerHTML += `
        <li class="${i === currentPage ? 'active' : ''}">
            <a onclick="irParaPagina(${i})">${i}</a>
        </li>`;
    }

    // próxima e última
    if (currentPage < totalPages) {
        ul.innerHTML += `
        <li>
            <a onclick="irParaPagina(${currentPage + 1})">›</a>
        </li>
        <li>
            <a onclick="irParaPagina(${totalPages})">»</a>
        </li>`;
    }
}

function irParaPagina(page) {
    currentPage = page;
    carregarLivros();

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}