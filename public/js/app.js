document.addEventListener("DOMContentLoaded", function () {

    // Inicializar Materialize
    M.AutoInit();
    
    const searchInput = document.getElementById("search");
    const livrosContainer = document.getElementById("livros-container");
    const statusFilter = document.getElementById('status-filter');

    // Inicializar a seleção com Materialize
    M.FormSelect.init(statusFilter);

    const livrosPorPagina = 12;
    let livros = [];
    let paginaAtual = 1;

    // Função para buscar livros conforme o usuário digita
    function buscarLivros(query) {
        fetch(`/api/livros/buscarAll/${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((data) => {
                exibirLivros(data); // Preenche a grid com os livros encontrados
                configurarPaginacao();
            })
            .catch((error) =>
                console.error("Erro ao buscar os livros:", error),
            );
        configurarPaginacao();
    }

    // Função para mostrar livros na grid
    function exibirLivros(livros) {
        const livrosContainer = document.getElementById("livros-container");
        livrosContainer.innerHTML = ""; // Limpa a grid atual

        // Verifica se 'livros' é um array
        if (Array.isArray(livros) && livros.length > 0) {
            livros.forEach((livro) => {
                const card = document.createElement("div");
                card.classList.add("col", "s12", "m6", "l4");

                const estoque = livro.Estoque || {}; // Usa um objeto vazio se Estoque for null
                const situacaoClasse =
                    estoque.estoque_disponivel >= 1 ? "disponível" : "locado";

                card.innerHTML = `
                    <div class="card large">
                        <div class="card-image waves-effect waves-block waves-light">
                            <img class="activator livro-imagem" src="${livro.foto}" alt="${livro.titulo}">
                        </div>
                        <div class="card-content">
                            <span class="card-title activator grey-text text-darken-4">${livro.titulo}<i class="material-icons right">more_vert</i></span>
                            <p><strong>Autor:</strong> ${livro.autor}</p>
                            <p><strong>Gênero:</strong> ${livro.genero}</p>
                        </div>
                        <div class="card-action" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="col s8" style="text-align: left;">
                            ${
                                situacaoClasse === "disponível"
                                    ? `<p class="${situacaoClasse}"><strong>Solicite seu empréstimo</strong></p>`
                                    : `<p class="${situacaoClasse}"><strong>Situação:</strong> ${situacaoClasse}</p>`
                            }
                        </div>

                        <div class="col s4" style="text-align: right;">
                            ${
                                situacaoClasse === "disponível"
                                    ? `<a href="https://wa.me/5541998000484?text=Estou%20interessado%20no%20livro%20${encodeURIComponent(livro.titulo)}" target="_blank" class="btn-floating btn-small green" title="Enviar mensagem no WhatsApp">
                                        <i class="material-icons">add</i>
                                      </a>`
                                    : `<a class="btn-floating btn-small grey" style="pointer-events: none; opacity: 0.5;" title="Não disponível para empréstimo">
                                        <i class="material-icons">add</i>
                                   </a>`
                            }
                        </div>
                    </div>
                        <div class="card-reveal">
                            <span class="card-title grey-text text-darken-4">${livro.titulo}<i class="material-icons right">close</i></span>
                            <p><strong>Sinopse:</strong> ${livro.sinopse}</p>
                        </div>
                    </div>
                `;
                livrosContainer.appendChild(card);
            });
        } else {
            // Se não for um array ou estiver vazio, exibe uma mensagem de "Livro não encontrado"
            livrosContainer.innerHTML = "<p>Nenhum livro encontrado.</p>";
            M.toast({ html: "Nenhum livro encontrado.", classes: "rounded" });
        }
    }

    // Evento de digitação no campo de busca
    if (searchInput) {
        
        let typingTimer; // Timer para controlar o delay
        const typingDelay = 500; // Tempo de delay em milissegundos (0.5 segundos)

        searchInput.addEventListener("input", function (event) {
            const query = event.target.value.trim();

            // Limpa o timer anterior
            clearTimeout(typingTimer);

            // Define um novo timer
            typingTimer = setTimeout(function () {
                if (query.length > 0) {
                    buscarLivros(query); // Busca livros ao digitar após o delay
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

    function carregarLivros() {
        fetch(`/api/livros?page=${paginaAtual}&limit=${livrosPorPagina}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erro na resposta da rede");
                }
                return response.json();
            })
            .then((data) => {
                if (!data.livros || !data.totalPages) {
                    throw new Error("Dados da API inválidos");
                }
                livros = data.livros;
                mostrarLivros();
                configurarPaginacao(data.totalPages);
            })
            .catch((error) =>
                console.error("Erro ao carregar os livros:", error),
            );
    }

    // Função para mostrar os livros no inicio
    function mostrarLivros() {
        const livrosContainer = document.getElementById("livros-container");
        livrosContainer.innerHTML = "";

        livros.forEach((livro) => {
            console.log("Livro:", livro);
            console.log("Estoque:", livro.Estoque);

            // Verifique se livro.Estoque existe antes de acessar suas propriedades
            const estoque = livro.Estoque || {}; // Usa um objeto vazio se Estoque for null
            //const situacao = estoque.estoque_disponivel >= 1 ? 'Disponível' : 'Locado';
            const situacaoClasse =
                estoque.estoque_disponivel >= 1 ? "disponível" : "locado";

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
                        <p><strong>Gênero:</strong> ${livro.genero}</p>
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
                                    ? `<a href="https://wa.me/5541998000484?text=Estou%20interessado%20no%20livro%20${encodeURIComponent(livro.titulo)}" target="_blank" class="btn-floating btn-small green" title="Enviar mensagem no WhatsApp">
                                        <i class="material-icons">add</i>
                                      </a>`
                                    : `<a class="btn-floating btn-small grey" style="pointer-events: none; opacity: 0.5;" title="Não disponível para empréstimo">
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

            livrosContainer.appendChild(card);
        });
    }

    /* function configurarPaginacao(totalPages) {
        const paginacaoContainer = document.getElementById(
            "pagination-controls",
        );
        paginacaoContainer.innerHTML = "";

        // Tenta obter o cabeçalho, se não encontrar, usa o body
        const header = document.querySelector("header") || document.body;

        // Adiciona botão "Anterior" se não estiver na primeira página
        const prevButton = document.createElement("li");
        prevButton.classList.add("waves-effect");
        if (paginaAtual === 1) {
            prevButton.classList.add("disabled");
        }
        const prevLink = document.createElement("a");
        prevLink.href = "#!";
        prevLink.textContent = "‹"; // Símbolo de seta para a esquerda
        prevLink.addEventListener("click", function (event) {
            event.preventDefault();
            if (paginaAtual > 1) {
                paginaAtual--;
                carregarLivros();
                header.scrollIntoView({ behavior: "smooth" }); // Rolagem suave para o cabeçalho ou topo
            }
        });
        prevButton.appendChild(prevLink);
        paginacaoContainer.appendChild(prevButton);

        // Adiciona botões de página
        for (let i = 1; i <= totalPages; i++) {
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
                header.scrollIntoView({ behavior: "smooth" }); // Rolagem suave para o cabeçalho ou topo
            });

            pageItem.appendChild(pageLink);
            paginacaoContainer.appendChild(pageItem);
        }

        // Adiciona botão "Próximo" se não estiver na última página
        const nextButton = document.createElement("li");
        nextButton.classList.add("waves-effect");
        if (paginaAtual === totalPages) {
            nextButton.classList.add("disabled");
        }
        const nextLink = document.createElement("a");
        nextLink.href = "#!";
        nextLink.textContent = "›"; // Símbolo de seta para a direita
        nextLink.addEventListener("click", function (event) {
            event.preventDefault();
            if (paginaAtual < totalPages) {
                paginaAtual++;
                carregarLivros();
                header.scrollIntoView({ behavior: "smooth" }); // Rolagem suave para o cabeçalho ou topo
            }
        });
        nextButton.appendChild(nextLink);
        paginacaoContainer.appendChild(nextButton);
    } */

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

    // Listener para mudanças na seleção de gênero
    statusFilter.addEventListener('change', function () {
        const generoSelecionado = this.value;

        if (generoSelecionado) {

            // Limpa o campo de busca quando o gênero é alterado
            document.getElementById('search').value = ''; // Limpa o campo de busca
            
            // Ao selecionar um gênero, começa com a página 1
            carregarLivrosComFiltro(1, generoSelecionado);
        }
    });

    // Função para carregar os livros com base na página e filtro de gênero
    function carregarLivrosComFiltro(pagina, genero) {
        fetch(`/api/livros/buscar-genero/${encodeURIComponent(genero)}?pagina=${pagina}`)
            .then(response => response.json())
            .then(data => {
                const livros = data.livros || [];
                livrosContainer.innerHTML = '';
                if (livros.length > 0) {
                    livros.forEach(livro => {
                        const estoque = livro.Estoque || {}; // Usando um objeto vazio se Estoque for null
                        const situacaoClasse = estoque.estoque_disponivel >= 1 ? "disponível" : "locado";

                        const card = document.createElement("div");
                        card.classList.add("col", "s12", "m6", "l4");

                        card.innerHTML = `
                            <div class="card large">
                                <div class="card-image waves-effect waves-block waves-light">
                                    <img class="activator livro-imagem" src="${livro.foto || 'default.jpg'}" alt="${livro.titulo}">
                                </div>
                                <div class="card-content">
                                    <span class="card-title activator grey-text text-darken-4">${livro.titulo}<i class="material-icons right">more_vert</i></span>
                                    <p><strong>Autor:</strong> ${livro.autor}</p>
                                    <p><strong>Gênero:</strong> ${livro.genero}</p>
                                </div>
                                <div class="card-action" style="display: flex; justify-content: space-between; align-items: center;">
                                    <div class="col s8" style="text-align: left;">
                                        ${
                                            situacaoClasse === "disponível"
                                                ? `<p class="${situacaoClasse}"><strong>Solicite seu empréstimo</strong></p>`
                                                : `<p class="${situacaoClasse}"><strong>Situação:</strong> ${situacaoClasse}</p>`
                                        }
                                    </div>

                                    <div class="col s4" style="text-align: right;">
                                        ${
                                            situacaoClasse === "disponível"
                                                ? `<a href="https://wa.me/5541998000484?text=Estou%20interessado%20no%20livro%20${encodeURIComponent(livro.titulo)}" target="_blank" class="btn-floating btn-small green" title="Enviar mensagem no WhatsApp">
                                                    <i class="material-icons">add</i>
                                                  </a>`
                                                : `<a class="btn-floating btn-small grey" style="pointer-events: none; opacity: 0.5;" title="Não disponível para empréstimo">
                                                    <i class="material-icons">add</i>
                                               </a>`
                                        }
                                    </div>
                                </div>
                                <div class="card-reveal">
                                    <span class="card-title grey-text text-darken-4">${livro.titulo}<i class="material-icons right">close</i></span>
                                    <p><strong>Sinopse:</strong> ${livro.sinopse}</p>
                                </div>
                            </div>
                        `;
                        livrosContainer.appendChild(card);
                    });
                    // Atualiza a paginação com base na resposta
                        paginacaoFiltro(data.totalPages, data.paginaAtual, genero);
                } else {
                    livrosContainer.innerHTML = "<p>Nenhum livro encontrado para o gênero selecionado.</p>";
                    configurarPaginacao();
                }
            })
            .catch((error) => {
                console.error('Erro ao buscar livros:', error);
                livrosContainer.innerHTML = "<p>Erro ao carregar os livros. Tente novamente.</p>";
            });
    }

    // Função para configurar a paginação com o filtro de gênero
    function paginacaoFiltro(totalPages, paginaAtual, generoSelecionado) {
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
                carregarLivrosComFiltro(paginaAtual - 1, generoSelecionado); // Passa o gênero selecionado
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
                carregarLivrosComFiltro(i, generoSelecionado); // Passa o gênero selecionado
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
                carregarLivrosComFiltro(paginaAtual + 1, generoSelecionado); // Passa o gênero selecionado
                header.scrollIntoView({ behavior: "smooth" });
            }
        });
        nextButton.appendChild(nextLink);
        paginacaoContainer.appendChild(nextButton);
    }

    carregarLivros();
});