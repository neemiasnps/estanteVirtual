document.addEventListener("DOMContentLoaded", () => {
    M.FormSelect.init(document.querySelectorAll("select"));
    M.Modal.init(document.querySelectorAll(".modal"));

    carregarAvaliacoes();

    /*document
        .getElementById("filtro-livro")
        .addEventListener("input", carregarAvaliacoes);*/
    document
    .getElementById("filtro-livro")
    .addEventListener("input", () => {

        clearTimeout(timeout);

        timeout = setTimeout(() => {

            currentPage = 1;
            carregarAvaliacoes();

        }, 300);

    });

    /*document
        .getElementById("filtro-status")
        .addEventListener("change", carregarAvaliacoes);*/
    document
    .getElementById("filtro-status")
    .addEventListener("change", () => {

        currentPage = 1;
        carregarAvaliacoes();

    });
});

let avaliacoes = [];
let currentPage = 1;
const limit = 10;

let timeout;


/* =========================
   CARREGAR AVALIAÇÕES
========================= */
async function carregarAvaliacoes() {
    try {
        const livro = document.getElementById("filtro-livro").value;
        const status = document.getElementById("filtro-status").value;

        const res = await fetch(
            `/api/admin/avaliacoes?page=${currentPage}&limit=${limit}&livro=${encodeURIComponent(livro)}&status=${status}`
        );

        const data = await res.json();

        avaliacoes = data.avaliacoes || [];

        renderTabela(avaliacoes);
        renderPaginacao(data.totalPages || 1);
        
    } catch (error) {
        console.error(error);

        M.toast({
            html: "Erro ao carregar avaliações",
        });
    }
}


/* =========================
   RENDER TABELA
========================= */
function renderTabela(lista) {
    const tbody = document.getElementById("avaliacoes-table-body");

    tbody.innerHTML = "";

    if (!lista.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="center">
                    Nenhuma avaliação encontrada
                </td>
            </tr>
        `;

        const ul = document.getElementById("pagination-controls");

        if (ul) {
            ul.innerHTML = "";
        }

        return;
    }

    lista.forEach((item) => {
        let status = "pendente";

        if (item.aprovado === true) status = "aprovado";

        if (item.aprovado === false) status = "reprovado";

        const tr = document.createElement("tr");

        tr.innerHTML = `

            <td>${item.id}</td>

            <td>${item.Livro?.titulo || "-"}</td>

            <td>${item.Aluno?.nomeCompleto || "-"}</td>

            <td>
                ${"⭐".repeat(item.estrelas)}
                (${item.estrelas})
            </td>

            <td class="center">

                ${
                    item.comentario
                        ? `
                        <a href="#!"
                           onclick="abrirComentario(${item.id})"
                           title="Ver comentário">

                            <i class="material-icons blue-text">
                                chat
                            </i>

                        </a>
                    `
                        : `
                        <i class="material-icons grey-text">
                            remove
                        </i>
                    `
                }

            </td>

            <td>
                <span class="${status}">
                    ${status}
                </span>
            </td>

            <td class="center">

    ${
        status === "pendente"
            ? `
                <div style="display:flex;justify-content:center;gap:10px;">

                    <a href="#!"
                       onclick="aprovar(${item.id})"
                       title="Aprovar">

                        <i class="material-icons green-text">
                            check
                        </i>

                    </a>

                    <a href="#!"
                       onclick="reprovar(${item.id})"
                       title="Reprovar">

                        <i class="material-icons red-text">
                            close
                        </i>

                    </a>

                </div>
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
   PAGINAÇÃO
========================= */
function renderPaginacao(totalPages) {

    const ul = document.getElementById("pagination-controls");

    if (!ul) return;

    ul.innerHTML = "";

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

            </li>

        `;

    }

    for (let i = start; i <= end; i++) {

        ul.innerHTML += `

            <li class="${i === currentPage ? 'active' : 'waves-effect'}">

                <a onclick="irParaPagina(${i})">
                    ${i}
                </a>

            </li>

        `;

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

            </li>

        `;

    }

}


/* =========================
   IR PARA PÁGINA
========================= */
function irParaPagina(page) {

    currentPage = page;

    carregarAvaliacoes();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
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
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                aprovado,
            }),
        });

        const data = await res.json();

        if (!data.sucesso) {
            return M.toast({
                html: data.mensagem,
            });
        }

        M.toast({
            html: "Status atualizado",
        });

        carregarAvaliacoes();
    } catch (error) {
        console.error(error);

        M.toast({
            html: "Erro ao atualizar status",
        });
    }
}


/* =========================
   ABRIR COMENTÁRIO
   ======================= */
function abrirComentario(id) {
    const avaliacao = avaliacoes.find((a) => a.id === id);

    if (!avaliacao) return;

    document.getElementById("conteudo-comentario").innerHTML = `

        <p>
            <strong>Livro:</strong>
            ${avaliacao.Livro?.titulo || "-"}
        </p>

        <p>
            <strong>Aluno:</strong>
            ${avaliacao.Aluno?.nomeCompleto || "-"}
        </p>

        <p>
            <strong>Nota:</strong>
            ${avaliacao.estrelas} estrelas
        </p>

        <hr>

        <p>
            ${avaliacao.comentario || "Nenhum comentário informado"}
        </p>

    `;

    const modal = M.Modal.getInstance(
        document.getElementById("modal-comentario"),
    );

    modal.open();
}
