document.addEventListener("DOMContentLoaded", function() {

    carregarLivrosMaisLocados();
    carregarUltimosEbooks();
    carregarEbooksMaisBaixados();
    
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

//Carregar os 5 livros mais locados
/*function carregarLivrosMaisLocados() {
    fetch('/api/homes/mais-locados') // Mudança na URL da API para buscar livros mais locados
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
                height: 400,
                duration: 500,
                interval: 6000
            });
        })
        .catch(error => console.error('Erro ao carregar os livros mais locados:', error));
}*/

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
        ? "https://i.postimg.cc/BnDS5mJF/banner-mobile.jpg" 
        : "https://i.postimg.cc/gk1c6Cbd/banner-desktop.jpg";

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
            bannerLi.innerHTML = `<img src="${linkBanner}" alt="Bem Vindo">
                                <div class="caption center-align">
                                <h4>Saiba Mais</h4>
                                    <a href="/como-funciona" class="btn-floating btn-small green" title="Saiba mais sobre como funciona">
                            <i class="material-icons">info_outline</i>
                        </a></div>`;
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
                height: 400,
                duration: 500,
                interval: 6000
            });
        })
        .catch(error => console.error('Erro ao carregar os livros mais locados:', error));
}
