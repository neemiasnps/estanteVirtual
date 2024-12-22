document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Materialize
    M.AutoInit();

    // Variável para armazenar o setTimeout atual
    let timeout;
    //let currentSearchQuery = ''; // Variável para armazenar a consulta de pesquisa atual

    // A função de listar os audiobooks
    async function listarAudiobooks(page = 1, searchQuery = '') {
        const livrosContainer = document.getElementById('audiobooks-container');
        const itemsPerPage = 12; // Número de audiobooks por página
        livrosContainer.innerHTML = ''; // Limpa o conteúdo anterior

        try {
            // Armazena a consulta de pesquisa para manter o filtro
            currentSearchQuery = searchQuery;

            // Modifiquei a URL para incluir o parâmetro de busca
            const response = await fetch(`/api/audiobooks?page=${page}&limit=${itemsPerPage}&search=${searchQuery}`);
            const data = await response.json();

            if (!data.books || data.books.length === 0) {
                // Exibe uma mensagem apenas se não houver livros e a pesquisa não estiver vazia
                if (searchQuery.trim() !== '') {
                    livrosContainer.innerHTML = '<p>Nenhum audiobook encontrado.</p>';
                } else {
                    // Se o campo de busca estiver vazio, mostra todos os livros
                    livrosContainer.innerHTML = ''; // Não exibe nada aqui, pois estamos recarregando a lista completa
                }
                return;
            }

            // Gerar os cards
            data.books.forEach(livro => {
                const card = document.createElement('div');
                card.classList.add('col', 's12', 'm6', 'l4'); // Classes do Materialize para responsividade

                card.innerHTML = `
                    <div class="card large" data-livro-id="${livro.id}">
                        <div class="card-image waves-effect waves-block waves-light">
                            <img class="activator livro-imagem" src="${livro.image}" alt="${livro.title}">
                        </div>
                        <div class="card-content">
                            <span class="card-title activator grey-text text-darken-4">
                                ${livro.title}<i class="material-icons right">more_vert</i>
                            </span>
                            <p><strong>Autor:</strong> ${livro.authors.join(', ')}</p>
                            <p><strong>Gênero:</strong> ${livro.genre.join(', ')}</p>
                            <p><strong>Idioma:</strong> ${livro.language}</p>
                        </div>
                        <div class="card-action" style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="col s8" style="text-align: left;">
                                 <p><strong>Tamanho:</strong> ${livro.item_size}</p>
                            </div>
                            <div class="col s4" style="text-align: right;">
                                <a href="${livro.link}" target="_blank" class="btn-floating btn-small blue" title="Ir para a página do audiobook">
                                    <i class="material-icons">play_arrow</i>
                                </a>
                            </div>
                        </div>
                        <div class="card-reveal">
                            <span class="card-title grey-text text-darken-4">
                                ${livro.title}<i class="material-icons right">close</i>
                            </span>
                            <p><strong>Sinopse:</strong> ${livro.description}</p>
                        </div>
                    </div>
                `;

                livrosContainer.appendChild(card);
            });

            // Atualiza a navegação de páginas
            gerarPaginacao(data.total, itemsPerPage, page, searchQuery);
        } catch (error) {
            console.error('Erro ao carregar audiobooks:', error);
            livrosContainer.innerHTML = '<p>Erro ao carregar os audiobooks. Tente novamente mais tarde.</p>';
        }
    }

    // Função para gerar a navegação de páginas
    function gerarPaginacao(totalItems, itemsPerPage, currentPage, searchQuery) {
        const paginationContainer = document.getElementById("pagination-controls");
        paginationContainer.innerHTML = ""; // Limpa a navegação anterior

        const totalPages = Math.ceil(totalItems / itemsPerPage); // Calcula o número total de páginas
        const maxVisiblePages = 10; // Exibir até 10 páginas por vez

        // Botão "Anterior" (‹)
        const prevButton = document.createElement("li");
        prevButton.classList.add("waves-effect");
        if (currentPage === 1) {
            prevButton.classList.add("disabled"); // Desabilita se estiver na primeira página
        }
        const prevLink = document.createElement("a");
        prevLink.href = "#!";
        prevLink.textContent = "‹"; // Símbolo de "Anterior"
        prevLink.addEventListener("click", function (event) {
            event.preventDefault();
            if (currentPage > 1) {
                listarAudiobooks(currentPage - 1, searchQuery); // Passa para a página anterior
            }
        });
        prevButton.appendChild(prevLink);
        paginationContainer.appendChild(prevButton);

        // Exibir até 10 páginas
        const startPage = Math.min(Math.max(1, currentPage - Math.floor(maxVisiblePages / 2)), Math.max(1, totalPages - maxVisiblePages + 1));
        const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement("li");
            pageItem.classList.add("waves-effect");
            if (i === currentPage) {
                pageItem.classList.add("active"); // Destaca a página atual
            }

            const pageLink = document.createElement("a");
            pageLink.href = "#!";
            pageLink.textContent = i;
            pageLink.addEventListener("click", function (event) {
                event.preventDefault();
                listarAudiobooks(i, searchQuery); // Passa para a página desejada
            });

            pageItem.appendChild(pageLink);
            paginationContainer.appendChild(pageItem);
        }

        // Botão "Próximo" (›)
        const nextButton = document.createElement("li");
        nextButton.classList.add("waves-effect");
        if (currentPage === totalPages) {
            nextButton.classList.add("disabled"); // Desabilita se estiver na última página
        }
        const nextLink = document.createElement("a");
        nextLink.href = "#!";
        nextLink.textContent = "›"; // Símbolo de "Próximo"
        nextLink.addEventListener("click", function (event) {
            event.preventDefault();
            if (currentPage < totalPages) {
                listarAudiobooks(currentPage + 1, searchQuery); // Passa para a próxima página
            }
        });
        nextButton.appendChild(nextLink);
        paginationContainer.appendChild(nextButton);
    }

    // Escuta a digitação no campo de busca
    document.getElementById('search').addEventListener('input', function(event) {
        const query = event.target.value;

        // Limpar o timeout anterior
        clearTimeout(timeout);

        // Setar um novo timeout
        timeout = setTimeout(function() {
            listarAudiobooks(1, query); // Realiza a busca com delay
        }, 500); // 500ms de delay
    });

    // Inicializa com a lista completa de audiobooks
    listarAudiobooks(1);
});
