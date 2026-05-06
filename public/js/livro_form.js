const cacheGeneros = new Map();
const cacheSubgeneros = new Map();

document.addEventListener('DOMContentLoaded', async function () {

    //M.FormSelect.init(document.querySelectorAll('select'));

    const path = window.location.pathname;
    const isEdit = path.includes('/editar/');
    const livroId = isEdit ? path.split('/').pop() : null;

    const formTitle = document.getElementById('form-title');
    const pageTitle = document.getElementById('page-title');

    // Ajusta título da tela
    if (isEdit) {
        formTitle.innerText = "Editar Livro";
        pageTitle.innerText = "Editar Livro";
    }

    // Carregar gêneros
    await carregarGeneros();

    // Se for edição, carregar dados do livro
    if (isEdit) {
        await carregarLivro(livroId);
    }

    // Evento de mudança de gênero
    document.getElementById('genero').addEventListener('change', function () {
        const generoId = this.value;

        // ✔ evita recarregar se já carregado
        if (!generoId) return;

        carregarSubgeneros(generoId);

        // limpa subgênero ao trocar gênero (IMPORTANTE)
        const sub = document.getElementById('subgenero');
        sub.innerHTML = '<option value="" disabled selected>Escolha o subgênero</option>';
        M.FormSelect.init(sub);
    });

    // Submit do formulário
    document.getElementById('form-livro').addEventListener('submit', salvarLivro);
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
// CARREGAR GÊNEROS
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
// CARREGAR SUBGÊNEROS
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
// CARREGAR LIVRO (EDIÇÃO)
// ===============================
async function carregarLivro(id) {
    try {
        const res = await fetch(`/api/admin/livros/${id}`);
        const livro = await res.json();

        document.getElementById('livro-id').value = livro.id;
        document.getElementById('titulo').value = livro.titulo || '';
        document.getElementById('autor').value = livro.autor || '';
        document.getElementById('ano_publicacao').value = livro.anoPublicacao || '';
        document.getElementById('editora').value = livro.editora || '';
        document.getElementById('sinopse').value = livro.sinopse || '';
        document.getElementById('foto').value = livro.foto || '';
        document.getElementById('gentileza').value = livro.gentileza || '';
        document.getElementById('situacao').checked = !!livro.situacao;

        M.updateTextFields();

        const generoSelect = document.getElementById('genero');
        const subgeneroSelect = document.getElementById('subgenero');

        // limpa subgênero primeiro
        subgeneroSelect.innerHTML = '<option value="" disabled selected>Escolha o subgênero</option>';

        // 1. define gênero
        generoSelect.value = String(livro.genero_id);
        initSelect(generoSelect);

        // 2. carrega subgêneros do gênero correto
        const response = await fetch(`/api/admin/subgeneros/${livro.genero_id}`);
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
            subgeneroSelect.value = String(livro.subgenero_id);
            initSelect(subgeneroSelect);
        }, 30);

    } catch (error) {
        console.error('Erro ao carregar livro:', error);
    }
}


// ===============================
// SALVAR LIVRO
// ===============================
async function salvarLivro(event) {
    event.preventDefault();

    const id = document.getElementById('livro-id').value;

    const dados = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        genero_id: document.getElementById('genero').value,
        subgenero_id: document.getElementById('subgenero').value,
        anoPublicacao: document.getElementById('ano_publicacao').value,
        editora: document.getElementById('editora').value,
        sinopse: document.getElementById('sinopse').value,
        foto: document.getElementById('foto').value,
        gentileza: document.getElementById('gentileza').value,
        situacao: document.getElementById('situacao').checked
    };

    try {

        let response;

        if (id) {
            // EDITAR
            response = await fetch(`/api/admin/livros/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            // NOVO
            response = await fetch('/api/admin/livros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        }

        if (response.ok) {
            M.toast({ html: 'Livro salvo com sucesso!' });
            setTimeout(() => {
                window.location.href = '/gerenciar_livros';
            }, 1000);
        } else {
            M.toast({ html: 'Erro ao salvar livro' });
        }

    } catch (error) {
        console.error('Erro ao salvar:', error);
        M.toast({ html: 'Erro na requisição' });
    }
}