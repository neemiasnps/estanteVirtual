let currentPage = 1;
const limit = 10;

let currentSearch = '';
let timeout;


// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', () => {

    carregarEbooks();

    // ==========================
    // EVENTOS DINÂMICOS
    // ==========================
    document.addEventListener('click', async function (e) {

        // ==========================
        // EDITAR
        // ==========================
        const btnEdit = e.target.closest('.btn-edit-ebook');

        if (btnEdit) {

            e.preventDefault();

            window.location.href =
                `/gerenciar_ebooks/editar/${btnEdit.dataset.id}`;

            return;
        }

        // ==========================
        // EXCLUIR
        // ==========================
        const btnDelete = e.target.closest('.btn-delete-ebook');

        if (btnDelete) {

            e.preventDefault();

            const id = btnDelete.dataset.id;
            const titulo = btnDelete.dataset.titulo;

            if (!confirm(`Deseja excluir o eBook "${titulo}"?`)) {
                return;
            }

            try {

                const response = await fetch(
                    `/api/admin/ebooks/${id}`,
                    {
                        method: 'DELETE'
                    }
                );

                if (!response.ok) {
                    throw new Error('Erro ao excluir eBook');
                }

                M.toast({
                    html: 'eBook excluído com sucesso.',
                    classes: 'green'
                });

                carregarEbooks();

            } catch (error) {

                console.error(error);

                M.toast({
                    html: 'Erro ao excluir eBook.',
                    classes: 'red'
                });
            }

            return;
        }

    });

    // ==========================
    // BUSCA COM DEBOUNCE
    // ==========================
    document
        .getElementById('search')
        .addEventListener('input', function () {

            clearTimeout(timeout);

            timeout = setTimeout(() => {

                currentSearch = this.value.trim();

                currentPage = 1;

                carregarEbooks();

            }, 300);

        });

});


// ===============================
// CARREGAR EBOOKS
// ===============================
async function carregarEbooks() {

    try {

        const response = await fetch(
            `/api/admin/ebooks?page=${currentPage}&limit=${limit}&search=${currentSearch}`
        );

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();

        if (!data.ebooks || !Array.isArray(data.ebooks)) {

            console.error('Resposta inválida:', data);

            return;
        }

        renderTabela(data.ebooks);

        renderPaginacao(data.totalPages);

    } catch (error) {

        console.error('Erro ao carregar ebooks:', error);

    }

}


// ===============================
// RENDER TABELA
// ===============================
function renderTabela(ebooks) {

    const tbody =
        document.getElementById('ebooks-table-body');

    tbody.innerHTML = '';

    ebooks.forEach(ebook => {

        tbody.innerHTML += `
            <tr>

                <td>${ebook.id}</td>

                <td>${ebook.titulo}</td>

                <td>${ebook.autor}</td>

                <td class="${
                    ebook.situacao === 'Disponível'
                        ? 'status-disponivel'
                        : 'status-indisponivel'
                }">

                    ${ebook.situacao}

                </td>

                <td>

                    <a href="javascript:void(0)"
                       class="btn-edit-ebook"
                       data-id="${ebook.id}">

                        <i class="material-icons">
                            edit
                        </i>

                    </a>

                    <a href="javascript:void(0)"
                       class="btn-delete-ebook"
                       data-id="${ebook.id}"
                       data-titulo="${ebook.titulo}">

                        <i class="material-icons red-text">
                            delete
                        </i>

                    </a>

                </td>

            </tr>
        `;
    });

}


// ===============================
// PAGINAÇÃO
// ===============================
function renderPaginacao(totalPages) {

    const ul =
        document.getElementById('pagination-controls');

    ul.innerHTML = '';

    const maxPagesToShow = 5;

    let start =
        Math.max(1, currentPage - 2);

    let end =
        Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {

        start = 1;

        end =
            Math.min(totalPages, maxPagesToShow);
    }

    if (currentPage >= totalPages - 2) {

        end = totalPages;

        start =
            Math.max(1, totalPages - maxPagesToShow + 1);
    }

    // PRIMEIRA
    if (currentPage > 1) {

        ul.innerHTML += `
            <li class="waves-effect">
                <a href="#!"
                   onclick="irParaPagina(1)">

                    <i class="material-icons">
                        first_page
                    </i>

                </a>
            </li>
        `;
    }

    // ANTERIOR
    if (currentPage > 1) {

        ul.innerHTML += `
            <li class="waves-effect">
                <a href="#!"
                   onclick="irParaPagina(${currentPage - 1})">

                    <i class="material-icons">
                        chevron_left
                    </i>

                </a>
            </li>
        `;
    }

    // NÚMEROS
    for (let i = start; i <= end; i++) {

        ul.innerHTML += `
            <li class="${
                i === currentPage
                    ? 'active'
                    : 'waves-effect'
            }">

                <a href="#!"
                   onclick="irParaPagina(${i})">

                    ${i}

                </a>

            </li>
        `;
    }

    // PRÓXIMA
    if (currentPage < totalPages) {

        ul.innerHTML += `
            <li class="waves-effect">
                <a href="#!"
                   onclick="irParaPagina(${currentPage + 1})">

                    <i class="material-icons">
                        chevron_right
                    </i>

                </a>
            </li>
        `;
    }

    // ÚLTIMA
    if (currentPage < totalPages) {

        ul.innerHTML += `
            <li class="waves-effect">
                <a href="#!"
                   onclick="irParaPagina(${totalPages})">

                    <i class="material-icons">
                        last_page
                    </i>

                </a>
            </li>
        `;
    }

}


// ===============================
// IR PARA PÁGINA
// ===============================
function irParaPagina(page) {

    currentPage = page;

    carregarEbooks();

}