let currentPage = 1;
const limit = 9;
let currentSearch = '';
let timeout;

document.addEventListener('DOMContentLoaded', () => {

    carregarAlunos();

    document.getElementById('search').addEventListener('input', function () {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            currentSearch = this.value.trim();
            currentPage = 1;
            carregarAlunos();
        }, 300);
    });

});


// ===============================
// CARREGAR
// ===============================
async function carregarAlunos() {
    try {

        const res = await fetch(
            `/api/admin/alunos?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(currentSearch)}`
        );

        const data = await res.json();

        renderTabela(data.alunos || []);
        renderPaginacao(data.totalPages || 1);

    } catch (error) {
        console.error('Erro:', error);
    }
}

function aplicarMascaraCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    return cpf
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}


// ===============================
// TABELA
// ===============================
function renderTabela(alunos) {
    const tbody = document.getElementById('alunos-table-body');
    tbody.innerHTML = '';

    alunos.forEach(aluno => {
        tbody.innerHTML += `
        <tr>
            <td>${aluno.id}</td>
            <td>${aluno.nomeCompleto}</td>
            <td>${aluno.cpf ? aplicarMascaraCPF(aluno.cpf) : '-'}</td>
            <td>${aluno.loja || '-'}</td>
            <td>
                <a href="/gerenciar_alunos/editar/${aluno.id}">
                    <i class="material-icons">edit</i>
                </a>

                <a href="#" onclick="excluirAluno(${aluno.id}, '${aluno.nomeCompleto}')">
                    <i class="material-icons red-text">delete</i>
                </a>
            </td>
        </tr>`;
    });
}


// ===============================
// PAGINAÇÃO
// ===============================
function renderPaginacao(totalPages) {
    const ul = document.getElementById('pagination-controls');
    ul.innerHTML = '';

    const maxPages = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        start = 1;
        end = Math.min(totalPages, maxPages);
    }

    if (currentPage >= totalPages - 2) {
        end = totalPages;
        start = Math.max(1, totalPages - maxPages + 1);
    }

    if (currentPage > 1) {
        ul.innerHTML += `
        <li class="waves-effect">
            <a onclick="irParaPagina(1)">
                <i class="material-icons">first_page</i>
            </a>
        </li>
        <li class="waves-effect">
            <a onclick="irParaPagina(${currentPage - 1})">
                <i class="material-icons">chevron_left</i>
            </a>
        </li>`;
    }

    for (let i = start; i <= end; i++) {
        ul.innerHTML += `
        <li class="${i === currentPage ? 'active' : 'waves-effect'}">
            <a onclick="irParaPagina(${i})">${i}</a>
        </li>`;
    }

    if (currentPage < totalPages) {
        ul.innerHTML += `
        <li class="waves-effect">
            <a onclick="irParaPagina(${currentPage + 1})">
                <i class="material-icons">chevron_right</i>
            </a>
        </li>
        <li class="waves-effect">
            <a onclick="irParaPagina(${totalPages})">
                <i class="material-icons">last_page</i>
            </a>
        </li>`;
    }
}

function irParaPagina(page) {
    currentPage = page;
    carregarAlunos();
}


// ===============================
// EXCLUIR
// ===============================
async function excluirAluno(id, nome) {

    if (!confirm(`Excluir "${nome}"?`)) return;

    await fetch(`/api/admin/alunos/${id}`, { method: 'DELETE' });

    carregarAlunos();
}


function bindEventos() {

    // EDITAR
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            window.location.href = `/gerenciar_alunos/editar/${btn.dataset.id}`;
        };
    });

    // EXCLUIR
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();

            if (!confirm(`Excluir "${btn.dataset.nome}"?`)) return;

            await fetch(`/api/admin/alunos/${btn.dataset.id}`, { method: 'DELETE' });

            carregarAlunos();
        };
    });

}