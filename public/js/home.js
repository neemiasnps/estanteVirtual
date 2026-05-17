document.addEventListener("DOMContentLoaded", function() {

    carregarLivrosMaisLocados();
    carregarUltimosEbooks();
    carregarEbooksMaisBaixados();
    carregarLivrosDoados();
    carregarTopAlunos();
    
});

//Carregar os ultimos 5 ebooks adicionados
function carregarUltimosEbooks() {

    if (typeof renderSkeletonLista === "function") {
        renderSkeletonLista("recent-ebooks", 5);
    }

    fetch('/api/homes')
        .then(response => {
            if (!response.ok) throw new Error('Erro na rede ao buscar eBooks');
            return response.json();
        })
        .then(ebooks => {

            const container = document.getElementById("recent-ebooks");
            container.innerHTML = '';

            if (!Array.isArray(ebooks)) return;

            ebooks.forEach(ebook => {

                const li = document.createElement("li");
                li.classList.add("collection-item", "avatar");

                li.style.cursor = "default"; // sem sensação de link
                li.setAttribute("data-livro-id", ebook.id);

                li.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:flex-start">

                        <img 
                            src="${ebook.foto}"
                            class="responsive-img"
                            style="width:60px;margin-right:15px"
                        >

                        <div>
                            <span class="title" style="font-size:13px">${ebook.titulo}</span>
                            <p style="font-size:12px">${ebook.autor}</p>
                            <p style="font-size:11px">${ebook.genero || '-'}</p>
                        </div>

                    </div>

                    <a href="${ebook.url}" target="_blank"
                       class="secondary-content"
                       onclick="event.stopPropagation(); incrementarDownload(${ebook.id})">
                        <i class="material-icons">file_download</i>
                    </a>
                `;

                container.appendChild(li);
            });
        })
        .catch(err => console.error(err));
}


//Carregar os 3 ebooks mais baixados
function carregarEbooksMaisBaixados() {

    if (typeof renderSkeletonLista === "function") {
        renderSkeletonLista("colecao-ebooks", 3);
    }

    fetch('/api/homes/mais-baixados')
        .then(response => {
            if (!response.ok) throw new Error('Erro na rede');
            return response.json();
        })
        .then(ebooks => {

            const container = document.getElementById("colecao-ebooks");
            container.innerHTML = '';

            if (!Array.isArray(ebooks)) return;

            ebooks.forEach(ebook => {

                const li = document.createElement("li");
                li.classList.add("collection-item", "avatar");

                li.style.cursor = "default";
                li.setAttribute("data-livro-id", ebook.id);

                li.innerHTML = `
                    <div style="display:flex;align-items:center">

                        <img 
                            src="${ebook.foto}"
                            style="width:60px;margin-right:15px"
                        >

                        <div>
                            <span class="title" style="font-size:13px">${ebook.titulo}</span>
                            <p style="font-size:12px">${ebook.autor}</p>
                            <p class="livro-downloads" style="font-size:11px">
                                ${ebook.download} downloads
                            </p>
                        </div>

                    </div>

                    <a href="${ebook.url}" target="_blank"
                       class="secondary-content"
                       onclick="event.stopPropagation(); incrementarDownload(${ebook.id})">
                        <i class="material-icons">file_download</i>
                    </a>
                `;

                container.appendChild(li);
            });
        })
        .catch(err => console.error(err));
}


//Incrementar +1 download
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

    const sliderContainer = document.querySelector(".slider .slides");

    // skeleton antes do fetch
    renderSkeletonSlider(sliderContainer);

    const linkBanner = isMobile()
        ? "https://i.postimg.cc/bYKJW6h4/BANNER-1-MOBILE-BIBLIOTECA-NICHELE.png"
        : "https://i.postimg.cc/3NRzrdRP/BANNER-1-BIBLIOTECA-NICHELE.png";

    fetch('/api/homes/mais-locados')
        .then(r => r.json())
        .then(livros => {

            sliderContainer.innerHTML = '';

            sliderContainer.innerHTML += `
                <li>
                    <a href="/como_funciona">
                        <img src="${linkBanner}" alt="Banner">
                    </a>
                </li>
            `;

            if (Array.isArray(livros)) {
                livros.slice(0, 5).forEach(livro => {
                    sliderContainer.innerHTML += `
                        <li>
                            <img src="${livro.foto}" alt="${livro.titulo}">
                            <div class="caption center-align">
                                <h4>${livro.titulo}</h4>
                                <h6 class="light grey-text text-lighten-3">${livro.autor}</h6>
                            </div>
                        </li>
                    `;
                });
            }

            const sliderEl = document.querySelector('.slider');

            const instance = M.Slider.getInstance(sliderEl);
            if (instance) instance.destroy();

            M.Slider.init(sliderEl, {
                indicators: true,
                height: 420,
                duration: 500,
                interval: 6000
            });
        });
}


// Carregar os 5 livros doados
function carregarLivrosDoados() {

    if (typeof renderSkeletonLivros === "function") {
        renderSkeletonLivros();
    } else if (typeof renderSkeletonLista === "function") {
        renderSkeletonLista("doados-livros", 5);
    }

    fetch('/api/homes/doados')
        .then(response => {
            if (!response.ok) throw new Error('Erro na rede');
            return response.json();
        })
        .then(livros => {

            const container = document.getElementById("doados-livros");
            container.innerHTML = '';

            if (!Array.isArray(livros)) return;

            livros.forEach(livro => {

                const li = document.createElement("li");
                li.classList.add("collection-item", "avatar");
                li.style.cursor = "pointer";
                li.style.position = "relative"; // 👈 necessário para o botão absoluto

                li.onclick = () => window.location.href = `/livro/${livro.id}`;

                li.innerHTML = `

                    <!-- BOTÃO WHATSAPP TOPO DIREITO -->
                    <a 
                        href="https://wa.me/5541998000484?text=Estou%20interessado%20no%20livro%20${encodeURIComponent(livro.titulo)}"
                        target="_blank"
                        onclick="event.stopPropagation();"
                        style="
                            position:absolute;
                            top:10px;
                            right:10px;
                            color:#25D366;
                        "
                        title="WhatsApp"
                    >
                        <i class="material-icons">message</i>
                    </a>

                    <div style="display:flex;align-items:center">

                        <img 
                            src="${livro.foto}"
                            style="width:60px;margin-right:15px;cursor:pointer"
                            onclick="event.stopPropagation(); window.location.href='/livro/${livro.id}'"
                        >

                        <div>
                            <span class="title" style="font-size:13px">${livro.titulo}</span>
                            <p style="font-size:12px">${livro.autor}</p>
                            <p style="font-size:11px">Doação: ${livro.gentileza}</p>
                        </div>

                    </div>
                `;

                container.appendChild(li);
            });
        })
        .catch(err => console.error(err));
}


// Carregar os 3 alunos que mais locaram livros
function carregarTopAlunos() {

    // ✔️ SKELETON ENQUANTO CARREGA
    const container = document.getElementById("top-alunos-list");
    container.innerHTML = '';

    const ulSkeleton = document.createElement("ul");
    ulSkeleton.classList.add("collapsible");

    for (let i = 0; i < 3; i++) {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="collapsible-header">
                <div class="skeleton-circle"></div>
                <div class="skeleton-line" style="width:60%; margin-left:10px;"></div>
                <div class="skeleton-badge"></div>
            </div>
            <div class="collapsible-body">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
        `;

        ulSkeleton.appendChild(li);
    }

    container.appendChild(ulSkeleton);

    // ✔️ DADOS REAIS
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

            alunos.sort((a, b) => b.total_emprestimos - a.total_emprestimos);

            container.innerHTML = '';

            const ul = document.createElement("ul");
            ul.classList.add("collapsible");

            const medalhas = [
                { icon: 'emoji_events', color: '#FFD700' },
                { icon: 'military_tech', color: '#C0C0C0' },
                { icon: 'grade', color: '#cd7f32' }
            ];

            alunos.forEach((aluno, index) => {
                const { icon, color } = medalhas[index] || { icon: 'person', color: 'gray' };

                const li = document.createElement("li");

                li.innerHTML = `
                    <div class="collapsible-header">
                        <i class="material-icons" style="color: ${color};">${icon}</i>
                        <span style="margin-left: 10px;">${aluno.nomeCompleto}</span>
                        <span class="badge" data-badge-caption="empréstimos">
                            ${aluno.total_emprestimos}
                        </span>
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

            const elems = document.querySelectorAll('.collapsible');
            M.Collapsible.init(elems);

        })
        .catch(error => {
            console.error('Erro ao carregar os top alunos com livros:', error);
        });
}


function renderSkeletonLista(containerId, quantidade = 5) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (let i = 0; i < quantidade; i++) {
        const li = document.createElement("li");
        li.classList.add("collection-item", "avatar");

        li.innerHTML = `
            <div style="display: flex; align-items: center;">

                <div class="skeleton-img"></div>

                <div style="flex: 1;">
                    <div class="skeleton-line title"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line small"></div>
                </div>

            </div>
        `;

        container.appendChild(li);
    }
}

function renderSkeletonSlider(container) {
    container.innerHTML = '';

    for (let i = 0; i < 3; i++) {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="skeleton-slider"></div>
        `;

        container.appendChild(li);
    }
}

function renderSkeletonTopAlunos(container) {

    container.innerHTML = '';

    const ul = document.createElement("ul");
    ul.classList.add("collapsible");

    for (let i = 0; i < 3; i++) {
        const li = document.createElement("li");

        li.innerHTML = `
            <div class="collapsible-header">
                <div class="skeleton-circle"></div>
                <div class="skeleton-line" style="width:60%; margin-left:10px;"></div>
            </div>
            <div class="collapsible-body">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
        `;

        ul.appendChild(li);
    }

    container.appendChild(ul);
}