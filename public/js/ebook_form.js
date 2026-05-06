const cacheGeneros = new Map();
const cacheSubgeneros = new Map();

document.addEventListener('DOMContentLoaded', async function () {

    M.FormSelect.init(document.querySelectorAll('select'));

    const path = window.location.pathname;
    const isEdit = path.includes('/editar/');
    const ebookId = isEdit ? path.split('/').pop() : null;

    const formTitle = document.getElementById('form-title');
    const pageTitle = document.getElementById('page-title');

    // Ajuste de título
    if (isEdit) {
        formTitle.innerText = "Editar eBook";
        pageTitle.innerText = "Editar eBook";
    }

    // Carregar gêneros
    await carregarGeneros();

    // Se edição, carregar dados
    if (isEdit) {
        await carregarEbook(ebookId);
    }

    // Evento gênero
    document.getElementById('genero').addEventListener('change', function () {
        const generoId = this.value;
        if (!generoId) return;

        const sub = document.getElementById('subgenero');
        
        // limpa antes
        sub.innerHTML = '<option value="" disabled selected>Escolha o subgênero</option>';
        M.FormSelect.init(sub);

        carregarSubgeneros(generoId);
    });

    // Submit
    document.getElementById('form-ebook').addEventListener('submit', salvarEbook);
});

function initSelect(select) {
    M.FormSelect.init(select);
}

function setSelectValue(select, value) {
    select.value = String(value);

    // força atualização visual do Materialize
    initSelect(select);
}


// ===============================
// GÊNEROS
// ===============================
async function carregarGeneros() {
    try {
        if (cacheGeneros.size > 0) {
            renderGeneros([...cacheGeneros.values()]);
            return;
        }

        const response = await fetch('/api/admin/generos', {
            credentials: 'include'
        });

        const generos = await response.json();

        generos.forEach(g => cacheGeneros.set(g.id, g));

        renderGeneros(generos);

    } catch (error) {
        console.error('Erro ao carregar gêneros:', error);
    }
}

function renderGeneros(generos) {
    const select = document.getElementById('genero');

    select.innerHTML = '<option value="" disabled selected>Escolha o gênero</option>';

    generos.forEach(g => {
        select.innerHTML += `<option value="${g.id}">${g.nome}</option>`;
    });

    M.FormSelect.init(select);
}



// ===============================
// SUBGÊNEROS
// ===============================
async function carregarSubgeneros(generoId, subgeneroSelecionado = null) {
    const response = await fetch(`/api/admin/subgeneros/${generoId}`);
    const subgeneros = await response.json();

    const select = document.getElementById('subgenero');

    select.innerHTML = '<option value="" disabled selected>Escolha o subgênero</option>';

    subgeneros.forEach(sg => {
        const option = document.createElement('option');
        option.value = sg.id;
        option.textContent = sg.nome;
        select.appendChild(option);
    });

    initSelect(select);

    if (subgeneroSelecionado) {
        setTimeout(() => {
            setSelectValue(select, subgeneroSelecionado);
        }, 50);
    }
}

function renderSubgeneros(subgeneros, selecionado = null) {

    const select = document.getElementById('subgenero');

    select.innerHTML = '<option value="" disabled selected>Escolha o subgênero</option>';

    subgeneros.forEach(sg => {
        const option = document.createElement("option");
        option.value = sg.id;
        option.textContent = sg.nome;

        select.appendChild(option);
    });

    // NÃO inicializa aqui
}


// ===============================
// CARREGAR EBOOK (EDIÇÃO)
// ===============================
async function carregarEbook(id) {
    try {
        const res = await fetch(`/api/admin/ebooks/${id}`);
        const ebook = await res.json();

        document.getElementById('ebook-id').value = ebook.id;
        document.getElementById('titulo').value = ebook.titulo || '';
        document.getElementById('autor').value = ebook.autor || '';
        document.getElementById('anoPublicacao').value = ebook.anoPublicacao || '';
        document.getElementById('editora').value = ebook.editora || '';
        document.getElementById('sinopse').value = ebook.sinopse || '';
        document.getElementById('foto').value = ebook.foto || '';
        document.getElementById('url').value = ebook.url || '';
        document.getElementById('situacao').checked = !!ebook.situacao;

        M.updateTextFields();

        const generoSelect = document.getElementById('genero');
        const subgeneroSelect = document.getElementById('subgenero');

        // limpa subgênero primeiro
        subgeneroSelect.innerHTML = '<option value="" disabled selected>Escolha o subgênero</option>';

        // 1. define gênero
        generoSelect.value = String(ebook.genero_id);
        initSelect(generoSelect);

        // 2. carrega subgêneros do gênero correto
        const response = await fetch(`/api/admin/subgeneros/${ebook.genero_id}`);
        const subgeneros = await response.json();

        subgeneroSelect.innerHTML = '<option value="" disabled selected>Escolha o subgênero</option>';

        subgeneros.forEach(sg => {
            const option = document.createElement('option');
            option.value = sg.id;
            option.textContent = sg.nome;
            subgeneroSelect.appendChild(option);
        });

        initSelect(subgeneroSelect);

        // 3. seleciona subgênero depois de renderizar tudo
        setTimeout(() => {
            subgeneroSelect.value = String(ebook.subgenero_id);
            initSelect(subgeneroSelect);
        }, 30);

    } catch (error) {
        console.error('Erro ao carregar eBook:', error);
    }
}


// ===============================
// SALVAR EBOOK
// ===============================
async function salvarEbook(event) {
    event.preventDefault();

    const id = document.getElementById('ebook-id').value || null;

    const dados = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        genero_id: document.getElementById('genero').value || null,
        subgenero_id: document.getElementById('subgenero').value || null,
        anoPublicacao: document.getElementById('anoPublicacao').value,
        editora: document.getElementById('editora').value,
        sinopse: document.getElementById('sinopse').value,
        foto: document.getElementById('foto').value,
        url: document.getElementById('url').value,
        situacao: document.getElementById('situacao').checked
            ? 'Disponível'
            : 'Indisponível'
    };

    try {

        let response;

        if (id) {
            response = await fetch(`/api/admin/ebooks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            response = await fetch('/api/admin/ebooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        }

        if (response.ok) {
            M.toast({ html: 'eBook salvo com sucesso!', classes: 'green' });

            setTimeout(() => {
                window.location.href = '/gerenciar_ebooks';
            }, 1000);

        } else {
            M.toast({ html: 'Erro ao salvar eBook', classes: 'red' });
        }

    } catch (error) {
        console.error('Erro ao salvar:', error);
        M.toast({ html: 'Erro na requisição', classes: 'red' });
    }
}