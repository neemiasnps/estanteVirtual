document.addEventListener("DOMContentLoaded", function() {
    
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

                li.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <img src="${ebook.foto}" alt="${ebook.titulo}" class="responsive-img" style="width: 60px; height: auto; margin-right: 15px;">
                        <div>
                            <span class="title" style="font-size: 14px;">${ebook.titulo}</span>
                            <p style="font-size: 12px;">${ebook.autor}</p>
                            <p style="font-size: 11px;">${ebook.genero}</p>
                        </div>
                    </div>
                    <a href="${ebook.url}" class="secondary-content"><i class="material-icons">file_download</i></a>
                `;

                collectionContainer.appendChild(li);
            });
        })
        .catch(error => console.error('Erro ao carregar os últimos eBooks:', error));
}

//Carregar os 3 ebooks mais baixados
function carregarEbooksMaisBaixados() {
    fetch('/api/homes/mais-baixados') // Substitua pela URL correta da sua API
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
            collectionContainer.innerHTML = ''; // Limpa o container antes de adicionar novos itens

            ebooks.forEach(ebook => {
                const li = document.createElement("li");
                li.classList.add("collection-item", "avatar");

                li.innerHTML = `
                    <div style="display: flex; align-items: center;">
                        <img src="${ebook.foto}" alt="${ebook.titulo}" class="responsive-img" style="width: 60px; height: auto; margin-right: 15px;">
                        <div>
                            <span class="title" style="font-size: 14px;">${ebook.titulo}</span>
                            <p style="font-size: 12px;">${ebook.autor}</p>
                            <p style="font-size: 11px;">${ebook.download} download</p>
                        </div>
                    </div>
                    <a href="${ebook.url}" class="secondary-content"><i class="material-icons">file_download</i></a>
                `;

                collectionContainer.appendChild(li);
            });
        })
        .catch(error => console.error('Erro ao carregar os eBooks mais baixados:', error));
}
