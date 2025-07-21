document.addEventListener('DOMContentLoaded', function() {

    // Inicializar Materialize
    M.AutoInit();

    const searchInput = document.getElementById('search');
    const livrosContainer = document.getElementById('livros-container');
    //const statusFilter = document.getElementById('status-filter');

    const livrosPorPagina = 12;
    let livros = [];
    let paginaAtual = 1;

    
    // Evento de digitação no campo de busca
    if (searchInput) {
        let typingTimer;                // Timer para controlar o delay
        const typingDelay = 500;         // Tempo de delay em milissegundos (0.5 segundos)

        searchInput.addEventListener('input', function(event) {
            const query = event.target.value.trim();

            // Limpa o timer anterior
            clearTimeout(typingTimer);

            // Define um novo timer
            typingTimer = setTimeout(function() {
                if (query.length > 0) {
                    //buscarLivros(query); // Busca livros ao digitar após o delay
                    carregarLivrosComFiltro(1, query);
                } else {
                    carregarLivros(); // Carrega todos os livros se a busca estiver vazia
                }
            }, typingDelay);
        });
        
        // Resetando o status-filter quando o campo de busca for clicado
        searchInput.addEventListener("focus", function () {
            const generoSelect = document.getElementById('status-filter');
            if (generoSelect) {
                // Limpa a seleção, forçando a primeira opção (Escolha o gênero)
                generoSelect.selectedIndex = 0;
                // Dispara um evento de mudança para atualizar a interface, se necessário
                generoSelect.dispatchEvent(new Event('change'));
            }
        });
    }

    // Função para carregar todos os livros na digitação
    function carregarLivros() {
        fetch(`/api/ebooks?page=${paginaAtual}&limit=${livrosPorPagina}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na resposta da rede');
                }
                return response.json();
            })
            .then(data => {
                if (!data.livros || !data.totalPages) {
                    throw new Error('Dados da API inválidos');
                }
                livros = data.livros;
                mostrarLivros();
                configurarPaginacao(data.totalPages);
            })
            .catch(error => console.error('Erro ao carregar os livros:', error));
    }

    // Função para mostrar os livros no início
    function mostrarLivros() {
        const livrosContainer = document.getElementById('livros-container');
        livrosContainer.innerHTML = '';

        livros.forEach(livro => {
            const card = document.createElement('div');
            card.classList.add('col', 's12', 'm6', 'l4');

            card.innerHTML = `
                <div class="card large" data-livro-id="${livro.id}">
                    <div class="card-image waves-effect waves-block waves-light">
                        <img class="activator livro-imagem" src="${livro.foto}" alt="${livro.titulo}">
                    </div>
                    <div class="card-content">
                        <span class="card-title activator grey-text text-darken-4">
                            ${livro.titulo}<i class="material-icons right">more_vert</i>
                        </span>
                        <p><strong>Autor:</strong> ${livro.autor}</p>
                        <p><strong>Gênero:</strong> ${livro.genero}</p>
                    </div>
                    <div class="card-action" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="col s6" style="text-align: left;">
                            <p class="livro-downloads"><strong>Download:</strong> ${livro.download}</p>
                        </div>
                        <div class="col s6" style="text-align: right;">
                            <a href="${livro.url}" target="_blank" class="btn-floating btn-small blue" title="Baixar o livro" onclick="incrementarDownload(${livro.id})">
                                <i class="material-icons">file_download</i>
                            </a>
                        </div>
                    </div>
                    <div class="card-reveal">
                        <span class="card-title grey-text text-darken-4">
                            ${livro.titulo}<i class="material-icons right">close</i>
                        </span>
                        <p><strong>Sinopse:</strong> ${livro.sinopse}</p>
                    </div>
                </div>
            `;

            livrosContainer.appendChild(card);
        });
    }

    function configurarPaginacao(totalPages) {
        const paginacaoContainer = document.getElementById("pagination-controls");
        paginacaoContainer.innerHTML = "";

        const header = document.querySelector("header") || document.body;
        const maxVisiblePages = 10; // Exibir apenas 10 páginas inicialmente

        // Botão "Anterior"
        const prevButton = document.createElement("li");
        prevButton.classList.add("waves-effect");
        if (paginaAtual === 1) {
            prevButton.classList.add("disabled");
        }
        const prevLink = document.createElement("a");
        prevLink.href = "#!";
        prevLink.textContent = "‹";
        prevLink.addEventListener("click", function (event) {
            event.preventDefault();
            if (paginaAtual > 1) {
                paginaAtual--;
                carregarLivros();
                configurarPaginacao(totalPages);
                header.scrollIntoView({ behavior: "smooth" });
            }
        });
        prevButton.appendChild(prevLink);
        paginacaoContainer.appendChild(prevButton);

        // Exibir até 10 páginas inicialmente
        const startPage = Math.min(Math.max(1, paginaAtual - Math.floor(maxVisiblePages / 2)), Math.max(1, totalPages - maxVisiblePages + 1));
        const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement("li");
            pageItem.classList.add("waves-effect");
            if (i === paginaAtual) {
                pageItem.classList.add("active");
            }

            const pageLink = document.createElement("a");
            pageLink.href = "#!";
            pageLink.textContent = i;
            pageLink.addEventListener("click", function (event) {
                event.preventDefault();
                paginaAtual = i;
                carregarLivros();
                configurarPaginacao(totalPages);
                header.scrollIntoView({ behavior: "smooth" });
            });

            pageItem.appendChild(pageLink);
            paginacaoContainer.appendChild(pageItem);
        }

        // Botão "Próximo"
        const nextButton = document.createElement("li");
        nextButton.classList.add("waves-effect");
        if (paginaAtual === totalPages) {
            nextButton.classList.add("disabled");
        }
        const nextLink = document.createElement("a");
        nextLink.href = "#!";
        nextLink.textContent = "›";
        nextLink.addEventListener("click", function (event) {
            event.preventDefault();
            if (paginaAtual < totalPages) {
                paginaAtual++;
                carregarLivros();
                configurarPaginacao(totalPages);
                header.scrollIntoView({ behavior: "smooth" });
            }
        });
        nextButton.appendChild(nextLink);
        paginacaoContainer.appendChild(nextButton);
    }
  
    // Função para carregar os livros com base na digitação do usuário
    function carregarLivrosComFiltro(pagina, query) {
        fetch(`/api/ebooks/buscarAll2/${encodeURIComponent(query)}?pagina=${pagina}`)
            .then(response => response.json())
            .then(data => {
                const livros = data.livros || [];
                livrosContainer.innerHTML = '';
                if (livros.length > 0) {
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
                                        ${livro.titulo}<i class="material-icons right">more_vert</i>
                                    </span>
                                    <p><strong>Autor:</strong> ${livro.autor}</p>
                                    <p><strong>Gênero:</strong> ${livro.genero}</p>
                                </div>
                                <div class="card-action" style="display: flex; justify-content: space-between; align-items: center;">
                                    <div class="col s6" style="text-align: left;">
                                        <p class="livro-downloads"><strong>Download:</strong> ${livro.download}</p>
                                    </div>
                                    <div class="col s6" style="text-align: right;">
                                        <a href="${livro.url}" target="_blank" class="btn-floating btn-small blue" title="Baixar o livro" onclick="incrementarDownload(${livro.id})">
                                            <i class="material-icons">file_download</i>
                                        </a>
                                    </div>
                                </div>
                                <div class="card-reveal">
                                    <span class="card-title grey-text text-darken-4">
                                        ${livro.titulo}<i class="material-icons right">close</i>
                                    </span>
                                    <p><strong>Sinopse:</strong> ${livro.sinopse}</p>
                                </div>
                            </div>
                        `;
                        livrosContainer.appendChild(card);
                    });
                    // Atualiza a paginação com base na resposta
                    paginacaoFiltro(data.totalPaginas, data.paginaAtual, query);
                } else {
                    livrosContainer.innerHTML = "<p>Nenhum livro encontrado para a busca fornecida.</p>";
                    configurarPaginacao();
                }
            })
            .catch((error) => {
                console.error('Erro ao buscar livros:', error);
                livrosContainer.innerHTML = "<p>Erro ao carregar os livros. Tente novamente.</p>";
            });
    }

    // Função para configurar a paginação com a busca de livros
    function paginacaoFiltro(totalPages, paginaAtual, query) {
        const paginacaoContainer = document.getElementById("pagination-controls");
        paginacaoContainer.innerHTML = "";

        const header = document.querySelector("header") || document.body;
        const maxVisiblePages = 10; // Exibir até 10 páginas por vez

        // Botão "Anterior"
        const prevButton = document.createElement("li");
        prevButton.classList.add("waves-effect");
        if (paginaAtual === 1) {
            prevButton.classList.add("disabled");
        }
        const prevLink = document.createElement("a");
        prevLink.href = "#!";
        prevLink.textContent = "‹";
        prevLink.addEventListener("click", function (event) {
            event.preventDefault();
            if (paginaAtual > 1) {
                carregarLivrosComFiltro(paginaAtual - 1, query); // Passa o termo de busca
                header.scrollIntoView({ behavior: "smooth" });
            }
        });
        prevButton.appendChild(prevLink);
        paginacaoContainer.appendChild(prevButton);

        // Exibir até 10 páginas inicialmente
        const startPage = Math.min(Math.max(1, paginaAtual - Math.floor(maxVisiblePages / 2)), Math.max(1, totalPages - maxVisiblePages + 1));
        const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement("li");
            pageItem.classList.add("waves-effect");
            if (i === paginaAtual) {
                pageItem.classList.add("active");
            }

            const pageLink = document.createElement("a");
            pageLink.href = "#!";
            pageLink.textContent = i;
            pageLink.addEventListener("click", function (event) {
                event.preventDefault();
                carregarLivrosComFiltro(i, query); // Passa o termo de busca
                header.scrollIntoView({ behavior: "smooth" });
            });

            pageItem.appendChild(pageLink);
            paginacaoContainer.appendChild(pageItem);
        }

        // Botão "Próximo"
        const nextButton = document.createElement("li");
        nextButton.classList.add("waves-effect");
        if (paginaAtual === totalPages) {
            nextButton.classList.add("disabled");
        }
        const nextLink = document.createElement("a");
        nextLink.href = "#!";
        nextLink.textContent = "›";
        nextLink.addEventListener("click", function (event) {
            event.preventDefault();
            if (paginaAtual < totalPages) {
                carregarLivrosComFiltro(paginaAtual + 1, query); // Passa o termo de busca
                header.scrollIntoView({ behavior: "smooth" });
            }
        });
        nextButton.appendChild(nextLink);
        paginacaoContainer.appendChild(nextButton);
    }

    carregarLivros();

});

// Função para incrementar o contador de downloads
function incrementarDownload(livroId) {
    fetch(`/api/ebooks/${livroId}/incrementar-download`, {
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