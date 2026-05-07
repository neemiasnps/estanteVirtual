document.addEventListener('DOMContentLoaded', () => {

    M.FormSelect.init(document.querySelectorAll('select'));

    carregarAvaliacoes();

    document.getElementById('filtro-livro')
        .addEventListener('input', carregarAvaliacoes);

    document.getElementById('filtro-status')
        .addEventListener('change', carregarAvaliacoes);

});

let avaliacoes = [];

/* =========================
   CARREGAR AVALIAÇÕES
========================= */
async function carregarAvaliacoes() {

    try {

        const livro = document.getElementById('filtro-livro').value;
        const status = document.getElementById('filtro-status').value;

        const res = await fetch(`/api/admin/avaliacoes?livro=${livro}&status=${status}`);

        avaliacoes = await res.json();

        renderTabela(avaliacoes);

    } catch (error) {

        console.error(error);

        M.toast({
            html: 'Erro ao carregar avaliações'
        });

    }

}

/* =========================
   RENDER TABELA
========================= */
/* =========================
   RENDER TABELA
========================= */
function renderTabela(lista) {

    const tbody = document.getElementById('avaliacoes-table-body');

    tbody.innerHTML = '';

    if (!lista.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="center">
                    Nenhuma avaliação encontrada
                </td>
            </tr>
        `;

        return;

    }

    lista.forEach(item => {

        let status = 'pendente';

        if (item.aprovado === true) status = 'aprovado';

        if (item.aprovado === false) status = 'reprovado';

        const tr = document.createElement('tr');

        tr.innerHTML = `

            <td>${item.id}</td>

            <td>${item.Livro?.titulo || '-'}</td>

            <td>${item.Aluno?.nomeCompleto || '-'}</td>

            <td>${item.estrelas}</td>

            <td>
                <span class="${status}">
                    ${status}
                </span>
            </td>

            <td>

                ${
                    status === 'pendente'
                        ? `
                            <a href="#" onclick="aprovar(${item.id})" title="Aprovar">
                                <i class="material-icons green-text">check</i>
                            </a>

                            <a href="#" onclick="reprovar(${item.id})" title="Reprovar">
                                <i class="material-icons red-text">close</i>
                            </a>
                        `
                        : `
                            <i class="material-icons grey-text" title="Finalizado">
                                block
                            </i>
                        `
                }

            </td>

        `;

        tbody.appendChild(tr);

    });

}

/* =========================
   APROVAR
========================= */
async function aprovar(id) {

    await alterarStatus(id, true);

}

/* =========================
   REPROVAR
========================= */
async function reprovar(id) {

    await alterarStatus(id, false);

}

/* =========================
   ALTERAR STATUS
========================= */
async function alterarStatus(id, aprovado) {

    try {

        const res = await fetch(`/api/admin/avaliacoes/${id}/status`, {

            method: 'PUT',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                aprovado
            })

        });

        const data = await res.json();

        if (!data.sucesso) {

            return M.toast({
                html: data.mensagem
            });

        }

        M.toast({
            html: 'Status atualizado'
        });

        carregarAvaliacoes();

    } catch (error) {

        console.error(error);

        M.toast({
            html: 'Erro ao atualizar status'
        });

    }

}