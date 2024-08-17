document.addEventListener('DOMContentLoaded', function() {
    const livrosPorPagina = 9;
    let livros = [];
    let paginaAtual = 1;

    function carregarLivros() {
        fetch(`/api/livros?page=${paginaAtual}&limit=${livrosPorPagina}`)
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

    function mostrarLivros() {
        const livrosContainer = document.getElementById('livros-container');
        livrosContainer.innerHTML = '';

        livros.forEach(livro => {

            console.log('Livro:', livro);
            console.log('Estoque:', livro.Estoque);

            // Verifique se livro.Estoque existe antes de acessar suas propriedades
            const estoque = livro.Estoque || {}; // Usa um objeto vazio se Estoque for null
            //const situacao = estoque.estoque_disponivel >= 1 ? 'Disponível' : 'Locado';
            const situacaoClasse = estoque.estoque_disponivel >= 1 ? 'disponível' : 'locado';

            
            const card = document.createElement('div');
            card.classList.add('col', 's12', 'm6', 'l4');

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
                    <div class="card-action"><p>
                        <p class="${situacaoClasse}"><strong>Situação:</strong> ${situacaoClasse}</p>
                    </div>
                    <div class="card-reveal">
                        <span class="card-title grey-text text-darken-4">${livro.titulo}<i class="material-icons right">close</i></span>
                        <p><strong>Sinopse:</strong> ${livro.sinopse}</p>
                    </div>
                </div>
            `;

            livrosContainer.appendChild(card);
        });
    }

    /*function configurarPaginacao(totalPages) {
        const paginacaoContainer = document.getElementById('pagination-controls');
        paginacaoContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.classList.add('waves-effect');
            if (i === paginaAtual) {
                li.classList.add('active');
            }

            const a = document.createElement('a');
            a.href = '#!';
            a.textContent = i;
            a.addEventListener('click', function(event) {
                event.preventDefault();
                paginaAtual = i;
                carregarLivros();
            });

            li.appendChild(a);
            paginacaoContainer.appendChild(li);
        }
    }*/

    function configurarPaginacao(totalPages) {
        const paginacaoContainer = document.getElementById('pagination-controls');
        paginacaoContainer.innerHTML = '';

        // Tenta obter o cabeçalho, se não encontrar, usa o body
        const header = document.querySelector('header') || document.body;

        // Adiciona botão "Anterior" se não estiver na primeira página
        const prevButton = document.createElement('li');
        prevButton.classList.add('waves-effect');
        if (paginaAtual === 1) {
            prevButton.classList.add('disabled');
        }
        const prevLink = document.createElement('a');
        prevLink.href = '#!';
        prevLink.textContent = '‹'; // Símbolo de seta para a esquerda
        prevLink.addEventListener('click', function(event) {
            event.preventDefault();
            if (paginaAtual > 1) {
                paginaAtual--;
                carregarLivros();
                header.scrollIntoView({ behavior: 'smooth' }); // Rolagem suave para o cabeçalho ou topo
            }
        });
        prevButton.appendChild(prevLink);
        paginacaoContainer.appendChild(prevButton);

        // Adiciona botões de página
        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.classList.add('waves-effect');
            if (i === paginaAtual) {
                pageItem.classList.add('active');
            }

            const pageLink = document.createElement('a');
            pageLink.href = '#!';
            pageLink.textContent = i;
            pageLink.addEventListener('click', function(event) {
                event.preventDefault();
                paginaAtual = i;
                carregarLivros();
                header.scrollIntoView({ behavior: 'smooth' }); // Rolagem suave para o cabeçalho ou topo
            });

            pageItem.appendChild(pageLink);
            paginacaoContainer.appendChild(pageItem);
        }

        // Adiciona botão "Próximo" se não estiver na última página
        const nextButton = document.createElement('li');
        nextButton.classList.add('waves-effect');
        if (paginaAtual === totalPages) {
            nextButton.classList.add('disabled');
        }
        const nextLink = document.createElement('a');
        nextLink.href = '#!';
        nextLink.textContent = '›'; // Símbolo de seta para a direita
        nextLink.addEventListener('click', function(event) {
            event.preventDefault();
            if (paginaAtual < totalPages) {
                paginaAtual++;
                carregarLivros();
                header.scrollIntoView({ behavior: 'smooth' }); // Rolagem suave para o cabeçalho ou topo
            }
        });
        nextButton.appendChild(nextLink);
        paginacaoContainer.appendChild(nextButton);
    }

    carregarLivros();
    
});
