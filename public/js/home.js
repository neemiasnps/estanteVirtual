document.addEventListener("DOMContentLoaded", function() {

    carregarLivrosMaisLocados();
    carregarUltimosEbooks();
    carregarEbooksMaisBaixados();
    carregarLivrosDoados();
    carregarTopAlunos();
    
});

//Carregar os ultimos 5 ebooks adicionados
function carregarUltimosEbooks() {
    fetch('/api/homes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede ao buscar eBooks');
            }
            return response.json();
        })
        .then(ebooks => { // Aqui estamos assumindo que a resposta é diretamente um array de eBooks
            console.log("Dados retornados pela API:", ebooks);

            if (!Array.isArray(ebooks)) {
                throw new TypeError('A resposta não contém um array de livros');
            }

            const collectionContainer = document.getElementById("recent-ebooks");
            collectionContainer.innerHTML = ''; // Limpa o container antes de adicionar novos itens

            ebooks.forEach(ebook => {
                const li = document.createElement("li");
                li.classList.add("collection-item", "avatar");
                li.setAttribute("data-livro-id", ebook.id);  // Adiciona o ID do livro como atributo

                li.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: flex-start;">
                        <img src="${ebook.foto}" alt="${ebook.titulo}" class="responsive-img" style="width: 60px; height: auto; margin-right: 15px;">
                        <div>
                            <span class="title" style="font-size: 13px;">${ebook.titulo}</span>
                            <p style="font-size: 12px;">${ebook.autor}</p>
                            <p style="font-size: 11px;">${ebook.genero}</p>
                        </div>
                    </div>
                    <a href="${ebook.url}" target="_blank" class="secondary-content" title="Baixar o livro" onclick="incrementarDownload(${ebook.id})"><i class="material-icons">file_download</i></a>
                `;

                collectionContainer.appendChild(li);
            });
        })
        .catch(error => console.error('Erro ao carregar os últimos eBooks:', error));
}

//Carregar os 3 ebooks mais baixados
function carregarEbooksMaisBaixados() {
    fetch('/api/homes/mais-baixados')  // Substitua pela URL correta da sua API
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede ao buscar eBooks mais baixados');
            }
            return response.json();
        })
        .then(ebooks => {
            console.log("Dados retornados pela API:", ebooks);

            if (!Array.isArray(ebooks)) {
                throw new TypeError('A resposta não contém um array de eBooks');
            }

            const collectionContainer = document.getElementById("colecao-ebooks");
            collectionContainer.innerHTML = '';  // Limpa o container antes de adicionar novos itens

            ebooks.forEach(ebook => {
                const li = document.createElement("li");
                li.classList.add("collection-item", "avatar");
                li.setAttribute("data-livro-id", ebook.id);  // Adiciona o ID do livro como atributo

                li.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <img src="${ebook.foto}" alt="${ebook.titulo}" class="responsive-img" style="width: 60px; height: auto; margin-right: 15px;">
                        <div>
                            <span class="title" style="font-size: 13px;">${ebook.titulo}</span>
                            <p style="font-size: 12px;">${ebook.autor}</p>
                            <p style="font-size: 11px;" class="livro-downloads">${ebook.download} downloads</p>  <!-- Classe para downloads -->
                        </div>
                    </div>
                    <a href="${ebook.url}" target="_blank" class="secondary-content" title="Baixar o livro" onclick="incrementarDownload(${ebook.id})">
                        <i class="material-icons">file_download</i>
                    </a>
                `;

                collectionContainer.appendChild(li);
            });
        })
        .catch(error => console.error('Erro ao carregar os eBooks mais baixados:', error));
}

//Incrementar +1 download
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
                downloadElement.textContent = `${data.download} downloads`;  // Atualiza o contador de downloads
            }
        }
    })
    .catch(error => {
        console.error('Erro ao incrementar download:', error);
    });
}

// Função para detectar tipo de navegador
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Carregar os 5 livros mais locados
function carregarLivrosMaisLocados() {
    const linkBanner = isMobile() 
        ? "https://i.postimg.cc/bYKJW6h4/BANNER-1-MOBILE-BIBLIOTECA-NICHELE.png" 
        : "https://i.postimg.cc/3NRzrdRP/BANNER-1-BIBLIOTECA-NICHELE.png";

    fetch('/api/homes/mais-locados') // URL da API para buscar livros mais locados
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede ao buscar livros mais locados');
            }
            return response.json();
        })
        .then(livros => {
            console.log("Dados retornados pela API:", livros);

            if (!Array.isArray(livros)) {
                throw new TypeError('A resposta não contém um array de livros');
            }

            const sliderContainer = document.querySelector(".slider .slides");
            sliderContainer.innerHTML = ''; // Limpa o slider antes de adicionar novos itens

            // Adiciona o banner antes dos livros
            const bannerLi = document.createElement("li");
            bannerLi.innerHTML = `
                <a href="/como_funciona" title="Clique e Saiba Mais!">
                    <img src="${linkBanner}" alt="Banner Bem Vindo">
                </a>`;
            sliderContainer.appendChild(bannerLi);

            // Seleciona os 5 livros mais locados
            const maisLocados = livros.slice(0, 5);

            maisLocados.forEach(livro => {
                const li = document.createElement("li");

                li.innerHTML = `
                    <img src="${livro.foto}" alt="${livro.titulo}">
                    <div class="caption center-align">
                        <h4>${livro.titulo}</h4>
                        <h6 class="light grey-text text-lighten-3">${livro.autor}</h6>
                        <a href="https://wa.me/5541998000484?text=Estou%20interessado%20no%20livro%20${encodeURIComponent(livro.titulo)}" target="_blank" class="btn-floating btn-small green" title="Enviar mensagem no WhatsApp">
                                            <i class="material-icons">add</i>
                                           </a>
                    </div>
                `;

                sliderContainer.appendChild(li);
            });

            // Inicializa o slider após a adição dos itens
            const sliderElement = document.querySelector('.slider');
            M.Slider.init(sliderElement, {
                indicators: true,
                height: 420,
                duration: 500,
                interval: 6000
            });
        })
        .catch(error => console.error('Erro ao carregar os livros mais locados:', error));
}

// Carregar os 5 livros doados
function carregarLivrosDoados() {
    fetch('/api/homes/doados')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede ao buscar livros');
            }
            return response.json();
        })
        .then(livros => { // Aqui estamos assumindo que a resposta é diretamente um array de livros
            console.log("Dados retornados pela API:", livros);

            if (!Array.isArray(livros)) {
                throw new TypeError('A resposta não contém um array de livros');
            }

            const collectionContainer = document.getElementById("doados-livros");
            collectionContainer.innerHTML = ''; // Limpa o container antes de adicionar novos itens

            livros.forEach(livro => { // Corrigido de 'ebooks' para 'livros'
                const li = document.createElement("li");
                li.classList.add("collection-item", "avatar");
                li.setAttribute("data-livro-id", livro.id);  // Adiciona o ID do livro como atributo

                li.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: flex-start;">
                        <img src="${livro.foto}" alt="${livro.titulo}" class="responsive-img" style="width: 60px; height: auto; margin-right: 15px;">
                        <div>
                            <span class="title" style="font-size: 13px;">${livro.titulo}</span>
                            <p style="font-size: 12px;">${livro.autor}</p>
                            <p style="font-size: 11px;">Doação: ${livro.gentileza}</p>
                        </div>
                    </div>

                    <a href="https://wa.me/5541998000484?text=Estou%20interessado%20no%20livro%20${encodeURIComponent(livro.titulo)}" target="_blank" class="secondary-content" title="Enviar mensagem no WhatsApp">
                        <i class="material-icons">message</i>
                    </a>
                `;

                collectionContainer.appendChild(li);
            });
        })
        .catch(error => console.error('Erro ao carregar os livros doados:', error));
}

function carregarTopAlunos1() {
    fetch('/api/homes/top-alunos-list')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede ao buscar os alunos');
            }
            return response.json();
        })
        .then(alunos => {
            console.log("Dados retornados pela API:", alunos);

            if (!Array.isArray(alunos)) {
                throw new TypeError('A resposta não contém um array de alunos');
            }

            // Ordena os alunos localmente por total de empréstimos (desc)
            alunos.sort((a, b) => b.total_emprestimos - a.total_emprestimos);          

            const container = document.getElementById("top-alunos-list");
            container.innerHTML = ''; // Limpa antes de adicionar novos itens

            // Cria a lista collapsible
            const ul = document.createElement("ul");
            ul.classList.add("collapsible");

            // Ícones com cores para 1º, 2º e 3º lugares
            const medalhas = [
                { icon: 'emoji_events', color: '#FFD700' }, // Ouro
                { icon: 'military_tech', color: '#C0C0C0' }, // Prata
                { icon: 'grade', color: '#cd7f32' }          // Bronze
            ];

            alunos.forEach((aluno, index) => {
                const { icon, color } = medalhas[index] || { icon: 'person', color: 'gray' };

                const li = document.createElement("li");

                li.innerHTML = `
                    <div class="collapsible-header">
                        <i class="material-icons" style="color: ${color};">${icon}</i>
                        <span style="margin-left: 10px;">${aluno.nomeCompleto}</span>
                        <span class="badge" data-badge-caption="empréstimos">${aluno.total_emprestimos}</span>
                    </div>
                    <div class="collapsible-body">
                        <ul style="margin: 0; padding-left: 1.2rem;">
                            ${aluno.livros && aluno.livros.length > 0 
                                ? aluno.livros.map(titulo => `<li style="font-size: 13px;">📖 ${titulo}</li>`).join('')
                                : '<li style="font-size: 13px; color: gray;">Nenhum livro registrado</li>'}
                        </ul>
                    </div>
                `;

                ul.appendChild(li);
            });

            container.appendChild(ul);

            // Inicializa ou reinicializa o collapsible
            const elems = document.querySelectorAll('.collapsible');
            M.Collapsible.init(elems);

        })
        .catch(error => console.error('Erro ao carregar os top alunos com livros:', error));
}

function carregarTopAlunos() {
    fetch('/api/homes/top-alunos-list')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede ao buscar os alunos');
            }
            return response.json();
        })
        .then(alunos => {
            console.log("Dados retornados pela API:", alunos);

            if (!Array.isArray(alunos)) {
                throw new TypeError('A resposta não contém um array de alunos');
            }

            // Ordena localmente os alunos por total de empréstimos (do maior para o menor)
            alunos.sort((a, b) => b.total_emprestimos - a.total_emprestimos);

            const container = document.getElementById("top-alunos-list");
            container.innerHTML = ''; // Limpa antes de adicionar novos itens

            // Cria a lista collapsible
            const ul = document.createElement("ul");
            ul.classList.add("collapsible");

            // Ícones com cores para 1º, 2º e 3º lugares
            const medalhas = [
                { icon: 'emoji_events', color: '#FFD700' }, // Ouro
                { icon: 'military_tech', color: '#C0C0C0' }, // Prata
                { icon: 'grade', color: '#cd7f32' }          // Bronze
            ];

            alunos.forEach((aluno, index) => {
                const { icon, color } = medalhas[index] || { icon: 'person', color: 'gray' };

                const li = document.createElement("li");

                li.innerHTML = `
                    <div class="collapsible-header">
                        <i class="material-icons" style="color: ${color};">${icon}</i>
                        <span style="margin-left: 10px;">${aluno.nomeCompleto}</span>
                        <span class="badge" data-badge-caption="empréstimos">${aluno.total_emprestimos}</span>
                    </div>
                    <div class="collapsible-body">
                        <ul style="margin: 0; padding-left: 1.2rem;">
                            ${aluno.livros && aluno.livros.length > 0 
                                ? aluno.livros.map(titulo => `<li style="font-size: 13px;">📖 ${titulo}</li>`).join('')
                                : '<li style="font-size: 13px; color: gray;">Nenhum livro registrado</li>'}
                        </ul>
                    </div>
                `;

                ul.appendChild(li);
            });

            container.appendChild(ul);

            // Inicializa ou reinicializa o collapsible
            const elems = document.querySelectorAll('.collapsible');
            M.Collapsible.init(elems);

        })
        .catch(error => console.error('Erro ao carregar os top alunos com livros:', error));
}
