let currentPage = 1;
const limit = 10;
let currentSearch = '';
let timeout;

document.addEventListener('DOMContentLoaded', () => {

    carregarLivros();

    // Busca com debounce
    document.getElementById('search').addEventListener('input', function () {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            currentSearch = this.value;
            currentPage = 1;
            carregarLivros();
        }, 300);
    });

    // SUBMIT DO ESTOQUE
    document.getElementById('form-estoque-livro')
        .addEventListener('submit', function(e) {
            e.preventDefault();
            atualizarEstoque();
        });

});


// ===============================
// CARREGAR LIVROS
// ===============================
async function carregarLivros() {
    try {
        const response = await fetch(`/api/admin/livros?page=${currentPage}&limit=${limit}&search=${currentSearch}`);

        if (!response.ok) {
            throw new Error('Erro na API: ' + response.status);
        }

        const data = await response.json();

        if (!data.livros || !Array.isArray(data.livros)) {
            console.error('Resposta inválida:', data);
            return;
        }

        renderTabela(data.livros);
        renderPaginacao(data.totalPages);

    } catch (error) {
        console.error('Erro ao carregar livros:', error);
    }
}


// ===============================
// RENDER TABELA
// ===============================
function renderTabela(livros) {
    const tbody = document.getElementById('livros-table-body');
    tbody.innerHTML = '';

    livros.forEach(livro => {
        tbody.innerHTML += `
        <tr>
            <td>${livro.id}</td>
            <td>${livro.titulo}</td>
            <td>${livro.autor}</td>
            <td class="${livro.situacao ? 'status-disponivel' : 'status-indisponivel'}">
                ${livro.situacao ? 'Disponível' : 'Indisponível'}
            </td>
            <td>
                <a href="#" class="btn-edit-livro" data-id="${livro.id}">
                    <i class="material-icons">edit</i>
                </a>
                <a href="#" class="btn-delete-livro" data-id="${livro.id}" data-titulo="${livro.titulo}">
                    <i class="material-icons red-text">delete</i>
                </a>
                <a href="#" class="btn-storage-livro" data-id="${livro.id}" data-nome="${livro.titulo}">
                    <i class="material-icons">storage</i>
                </a>
            </td>
        </tr>
        `;
    });

    bindEventos();
}


// ===============================
// PAGINAÇÃO
// ===============================
function renderPaginacao(totalPages) {
    const ul = document.getElementById('pagination-controls');
    ul.innerHTML = '';

    const maxPagesToShow = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        start = 1;
        end = Math.min(totalPages, maxPagesToShow);
    }

    if (currentPage >= totalPages - 2) {
        end = totalPages;
        start = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    if (currentPage > 1) {
        ul.innerHTML += `
        <li class="waves-effect">
            <a href="#!" onclick="irParaPagina(1)">
                <i class="material-icons">first_page</i>
            </a>
        </li>`;
    }

    if (currentPage > 1) {
        ul.innerHTML += `
        <li class="waves-effect">
            <a href="#!" onclick="irParaPagina(${currentPage - 1})">
                <i class="material-icons">chevron_left</i>
            </a>
        </li>`;
    }

    for (let i = start; i <= end; i++) {
        ul.innerHTML += `
        <li class="${i === currentPage ? 'active' : 'waves-effect'}">
            <a href="#!" onclick="irParaPagina(${i})">${i}</a>
        </li>`;
    }

    if (currentPage < totalPages) {
        ul.innerHTML += `
        <li class="waves-effect">
            <a href="#!" onclick="irParaPagina(${currentPage + 1})">
                <i class="material-icons">chevron_right</i>
            </a>
        </li>`;
    }

    if (currentPage < totalPages) {
        ul.innerHTML += `
        <li class="waves-effect">
            <a href="#!" onclick="irParaPagina(${totalPages})">
                <i class="material-icons">last_page</i>
            </a>
        </li>`;
    }
}

function irParaPagina(page) {
    currentPage = page;
    carregarLivros();
}


// ===============================
// EVENTOS
// ===============================
function bindEventos() {

    // EDITAR
    document.querySelectorAll('.btn-edit-livro').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = `/gerenciar_livros/editar/${this.dataset.id}`;
        });
    });

    // EXCLUIR (ADMIN)
    document.querySelectorAll('.btn-delete-livro').forEach(btn => {
        btn.addEventListener('click', async function (e) {
            e.preventDefault();

            const id = this.dataset.id;
            const titulo = this.dataset.titulo;

            if (!confirm(`Deseja excluir o livro "${titulo}"?`)) return;

            await fetch(`/api/admin/livros/${id}`, { method: 'DELETE' });

            carregarLivros();
        });
    });

    // ESTOQUE (AGORA CORRETO)
    document.querySelectorAll('.btn-storage-livro').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            abrirModalEstoqueLivro(this.dataset.id, this.dataset.nome);
        });
    });
}


// ===============================
// MODAL ESTOQUE
// ===============================
function abrirModalEstoqueLivro(idLivro, nomeLivro) {

    $('#estoque-id-livro').val(idLivro);
    $('#estoque-nome-livro').val(nomeLivro);
    $('#estoque-quantidade').val('');

    $('#btn-salvar-estoque').prop('disabled', false);

    M.updateTextFields();

    const modal = M.Modal.getInstance(document.getElementById('modal-estoque-livro'));
    modal.open();

    fetch(`/api/admin/estoques/${idLivro}`)
        .then(res => res.json())
        .then(data => {
            $('#estoque-quantidade').val(data.estoque_total || 0);
            M.updateTextFields();
        })
        .catch(err => {
            console.error(err);
            M.toast({ html: 'Erro ao carregar estoque', classes: 'red' });
        });
}


// ===============================
// ATUALIZAR ESTOQUE
// ===============================
async function atualizarEstoque() {
    const livro_id = document.getElementById('estoque-id-livro').value;
    const quantidade = document.getElementById('estoque-quantidade').value;

    try {
        const response = await fetch('/api/admin/estoques/atualizar-estoque', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ livro_id, quantidade })
        });

        const result = await response.json();

        if (result.success) {
            M.toast({ html: 'Estoque atualizado com sucesso.', classes: 'green' });

            const modal = M.Modal.getInstance(document.getElementById('modal-estoque-livro'));
            modal.close();

            carregarLivros();
        } else {
            M.toast({ html: 'Erro ao atualizar o estoque.', classes: 'red' });
        }

    } catch (error) {
        console.error(error);
        M.toast({ html: 'Erro ao atualizar o estoque.', classes: 'red' });
    }
}