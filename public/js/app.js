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

    function configurarPaginacao(totalPages) {
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
    }

    carregarLivros();
    
});
