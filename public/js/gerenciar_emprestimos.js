let listaEmprestimos = [];
let currentPage = 1;
const limit = 10;
let timeout;

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
  M.FormSelect.init(document.querySelectorAll('select'));
  const elems = document.querySelectorAll('.modal');
  M.Modal.init(elems);

  carregarEmprestimos();

  // 🔎 FILTRO NOME (com debounce)
  document.getElementById('filtro-nome')?.addEventListener('input', function () {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      currentPage = 1; // 🔴 reset página
      carregarEmprestimos();
    }, 400);
  });

  // 📌 FILTRO STATUS
  document.getElementById('filtro-status')?.addEventListener('change', function () {
    currentPage = 1; // 🔴 reset página
    carregarEmprestimos();
  });

  document.getElementById('edit-prazo').addEventListener('input', atualizarDataPrevista);
  
});

// =========================
// CARREGAR
// =========================
async function carregarEmprestimos() {
  try {

    const nome = document.getElementById('filtro-nome')?.value || '';
    const status = document.getElementById('filtro-status')?.value || '';

    const params = new URLSearchParams({
      page: currentPage,
      limit: limit,
      nome: nome.trim(),
      status
    });

    const res = await fetch(`/api/admin/emprestimos?${params}`);
    const result = await res.json();

    listaEmprestimos = result.data;
  
    renderTabela();
    renderPaginacao(result.totalPages);

  } catch (err) {
    console.error(err);
    M.toast({ html: 'Erro ao carregar dados' });
  }
}

// =========================
// TABELA
// =========================
function renderTabela(totalPages = 1) {

  const tbody = document.getElementById('emprestimos-table-body');
  tbody.innerHTML = '';

  if (!listaEmprestimos.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="center">Sem registros</td></tr>`;
    return;
  }

    listaEmprestimos.forEach(emp => {

    const statusGeral = emp.statusGeral;


      const ativoEmp = podeAcionar(emp.statusGeral);

      const btnEmail = ativoEmp
      ? `<i class="material-icons green-text icon-btn" onclick="enviarEmail(${emp.id})" title="Enviar e-mail">email</i>`
      : `<i class="material-icons grey-text icon-btn disabled" title="Ação indisponível">email</i>`;

      const btnWhats = ativoEmp
        ? `<i class="material-icons blue-text icon-btn" onclick="enviarWhats(${emp.id})">message</i>`
        : `<i class="material-icons grey-text icon-btn disabled" title="Ação indisponível">message</i>`;

      const tr = document.createElement('tr');
      tr.classList.add('linha-principal');

    tr.innerHTML = `
      <td>
        <i class="material-icons icon-btn" onclick="toggle(${emp.id})" id="icon-${emp.id}">
          add
        </i>
      </td>

      <td>#${emp.id}</td>

      <td>${emp.aluno || 'Não informado'}</td>

      <td>${emp.quantidade_livros}</td>

      <td>
        <span class="badge ${corStatus(statusGeral)} white-text">
          ${formatarStatus(statusGeral)}
        </span>
      </td>

      <td>
      ${btnEmail}
      ${btnWhats}
      </td>
    `;

    tbody.appendChild(tr);

      if ((emp.itens || []).length) {

        const header = document.createElement('tr');
        header.classList.add(`itens-${emp.id}`);
        header.style.display = 'none';

        header.innerHTML = `
          <td></td>
          <td colspan="5">
            <div class="item-row" style="font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 6px;">

              <div class="item-col">ID</div>
              <div class="item-col">Livro</div>
              <div class="item-col">Retirada</div>
              <div class="item-col">Dias</div>
              <div class="item-col">Devolução</div>
              <div class="item-col">Status</div>
              <div class="item-col">Ações</div>

            </div>
          </td>
        `;

        tbody.appendChild(header);
      }

        // 🔽 LINHAS DOS LIVROS (EXPANSÍVEL COMPLETO)
        (emp.itens || []).forEach(item => {

          const ativoItem = podeAcionar(item.status);

          const btnFinalizar = ativoItem
            ? `<i class="material-icons green-text icon-btn"
                 onclick="finalizar(${item.id}, ${emp.id}, '${(emp.aluno || '').replace(/'/g, "\\'")}', '${(item.livro?.titulo || '').replace(/'/g, "\\'")}')"
                 title="Finalizar">check</i>`
            : `<i class="material-icons grey-text icon-btn disabled" title="Indisponível">check</i>`;

          const btnEditar = ativoItem
            ? `<i class="material-icons orange-text icon-btn" onclick="editar(${item.id})">edit</i>`
            : `<i class="material-icons grey-text icon-btn disabled">edit</i>`;

          const btnCancelar = ativoItem
            ? `<i class="material-icons red-text icon-btn" onclick="cancelar(${item.id})">close</i>`
            : `<i class="material-icons grey-text icon-btn disabled">close</i>`;

          const btnExtraviado = ativoItem
            ? `<i class="material-icons purple-text icon-btn" onclick="extraviado(${item.id})">report_problem</i>`
            : `<i class="material-icons grey-text icon-btn disabled">report_problem</i>`;

          const btnIndenizar = ativoItem
          ? `<i class="material-icons grey-text icon-btn" onclick="abrirModalIndenizar(${item.id})">attach_money</i>`
          : `<i class="material-icons grey-text icon-btn disabled">attach_money</i>`;

          const trItem = document.createElement('tr');

          trItem.classList.add(`itens-${emp.id}`);
          trItem.style.display = 'none';

          trItem.innerHTML = `
            <td></td>
            <td colspan="5">

              <div class="item-row">

                <div class="item-col">
                   <strong>#${item.livro?.id || '-'}</strong>
                </div>

                <div class="item-col titulo">
                  ${item.livro?.titulo || 'Livro não informado'}
                </div>

                <div class="item-col">
                  ${formatarData(item.data_retirada)}
                </div>

                <div class="item-col">
                  ${item.prazo_dias ?? '-'} dias
                </div>

                <div class="item-col">
                  ${formatarData(item.data_devolucao_prevista)}
                </div>

                <div class="item-col">
                  <span class="badge ${corStatus(item.status)} white-text">
                    ${formatarStatus(item.status)}
                  </span>
                </div>

                <div class="actions">
  ${btnFinalizar}
  ${btnEditar}
  ${btnCancelar}
  ${btnExtraviado}
  ${btnIndenizar}
</div>

              </div>

            </td>
          `;

          tbody.appendChild(trItem);
      });
  });
}


function formatarData(data) {
  return data
    ? new Date(data).toLocaleDateString('pt-BR')
    : '-';
}


function podeAcionar(status) {
  return status === 'pendente' || status === 'atrasado';
}


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
    carregarEmprestimos();
}

// =========================
// TOGGLE
// =========================
function toggle(id) {

  const rows = document.querySelectorAll(`.itens-${id}`);
  const icon = document.getElementById(`icon-${id}`);
  const linhaPrincipal = icon.closest('tr');

  if (!rows.length) return;

  const aberto = rows[0].style.display !== 'none';

  rows.forEach(r => r.style.display = aberto ? 'none' : 'table-row');

  icon.textContent = aberto ? 'add' : 'remove';

  // destaque da linha principal
  linhaPrincipal.classList.toggle('linha-ativa', !aberto);
}

// STATUS
function calcularStatusItem(item) {
  if (item.status === 'devolvido') return 'devolvido';
  if (item.status === 'cancelado') return 'cancelado';
  if (item.status === 'extraviado') return 'extraviado';
  return item.status || 'pendente';
}

function calcularStatusGeral(itens) {

  if (!itens?.length) return 'vazio';

  if (itens.some(i => i.status === 'atrasado')) {
    return 'atrasado';
  }

  if (itens.some(i => i.status === 'cancelado')) {
    return 'cancelado';
  }

  if (itens.every(i => i.status === 'devolvido')) {
    return 'finalizado';
  }

  if (itens.some(i => i.status === 'pendente')) {
    return 'pendente';
  }

  return 'em andamento';
}

function corStatus(status) {
  switch (status) {
    case 'atrasado': return 'red';
    case 'pendente': return 'orange';
    case 'finalizado': return 'green';
    case 'devolvido': return 'blue';
    case 'cancelado': return 'grey';
    case 'indenizado': return 'teal';
    case 'extraviado': return 'pink';
    default: return 'blue';
  }
}

function formatarStatus(status) {
  switch ((status || '').toLowerCase()) {

    case 'pendente':
      return 'pendente';

    //case 'em andamento':
    case 'em_andamento':
      return 'em andamento';

    case 'finalizado':
      return 'finalizado';

    case 'atrasado':
      return 'atrasado';

    case 'cancelado':
      return 'cancelado';

    case 'devolvido':
      return 'devolvido';

    default:
      return status || '-';
  }
}


// FINALIZAR
function finalizar(itemId, emprestimoId, alunoNome, livroNome) {

  if (!confirm(
    `Deseja finalizar o empréstimo?\n\n` +
    `Solicitação: ${emprestimoId}\n` +
    `Aluno: ${alunoNome}\n` +
    `Livro: ${livroNome}`
  )) {
    return;
  }

  fetch(`/api/admin/emprestimos/livro/${itemId}/finalizar`, {
    method: 'PUT'
  })
  .then(res => {
    if (!res.ok) throw new Error('Erro ao finalizar');
    return res.json();
  })
  .then(() => {
    M.toast({ html: 'Empréstimo finalizado com sucesso' });
    carregarEmprestimos();
  })
  .catch(() => {
    M.toast({ html: 'Erro ao finalizar empréstimo' });
  });
}


// CANCELAR
function cancelar(id) {

  if (!confirm('Deseja cancelar este item do empréstimo?')) return;

  fetch(`/api/admin/emprestimos/livro/${id}/cancelar`, {
    method: 'PUT'
  })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(() => {
    M.toast({ html: 'Item cancelado com sucesso' });
    carregarEmprestimos();
  })
  .catch(() => {
    M.toast({ html: 'Erro ao cancelar item' });
  });
}


// EXTRAVIADO
function extraviado(id) {

  if (!confirm('Confirma marcar este livro como EXTRAVIADO?')) return;

  fetch(`/api/admin/emprestimos/livro/${id}/extraviado`, {
    method: 'PUT'
  })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(() => {
    M.toast({ html: 'Marcado como extraviado' });
    carregarEmprestimos();
  })
  .catch(() => {
    M.toast({ html: 'Erro ao atualizar' });
  });
}


// EDIÇÃO
async function editar(id) {
  try {

    const res = await fetch(`/api/admin/emprestimos/item/${id}`);
    const item = await res.json();

    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-livro').value = item.livro;
    document.getElementById('edit-data-retirada').value = formatarData(item.data_retirada);
    document.getElementById('edit-prazo').value = item.prazo_dias;

    atualizarDataPrevista();

    M.updateTextFields();

    const modal = M.Modal.getInstance(document.getElementById('modal-editar'));
    modal.open();

  } catch {
    M.toast({ html: 'Erro ao carregar dados' });
  }
}

function atualizarDataPrevista() {

  const dataRetirada = document.getElementById('edit-data-retirada').value;
  const prazo = parseInt(document.getElementById('edit-prazo').value || 0);

  if (!dataRetirada) return;

  const partes = dataRetirada.split('/');
  const data = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);

  data.setDate(data.getDate() + prazo);

  document.getElementById('edit-data-prevista').value =
    data.toLocaleDateString('pt-BR');
}

async function salvarEdicao() {

  const id = document.getElementById('edit-id').value;
  const prazo_dias = document.getElementById('edit-prazo').value;

  try {

    const res = await fetch(`/api/admin/emprestimos/livro/${id}/editar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prazo_dias })
    });

    if (!res.ok) throw new Error();

    M.toast({ html: 'Atualizado com sucesso' });

    const modal = M.Modal.getInstance(document.getElementById('modal-editar'));
    modal.close();

    carregarEmprestimos();

  } catch {
    M.toast({ html: 'Erro ao atualizar' });
  }
}


// INDENIZAR
function indenizar(id) {

  if (!confirm('Confirma a indenização deste item?')) {
    return;
  }

  fetch(`/api/admin/emprestimos/livro/${id}/indenizar`, {
    method: 'PUT'
  })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(() => {
    M.toast({ html: 'Item indenizado com sucesso' });
    carregarEmprestimos();
  })
  .catch(() => {
    M.toast({ html: 'Erro ao indenizar item' });
  });
}

function abrirModalIndenizar(id) {
  document.getElementById('indenizar-id').value = id;
  document.getElementById('indenizar-valor').value = '';
  document.getElementById('indenizar-observacao').value = '';

  const instance = M.Modal.getInstance(document.getElementById('modal-indenizar'));
  instance.open();
}

function confirmarIndenizacao() {

  const id = document.getElementById('indenizar-id').value;
  const valor = document.getElementById('indenizar-valor').value;
  const observacao = document.getElementById('indenizar-observacao').value;

  if (!valor) {
    M.toast({ html: 'Informe o valor da indenização' });
    return;
  }

  fetch(`/api/admin/emprestimos/livro/${id}/indenizar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ valor, observacao })
  })
  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(() => {
    M.toast({ html: 'Indenização registrada' });
    carregarEmprestimos();

    const modal = M.Modal.getInstance(document.getElementById('modal-indenizar'));
    modal.close();
  })
  .catch(() => {
    M.toast({ html: 'Erro ao indenizar' });
  });
}


// E-MAIL
function enviarEmail(id) {
  const btn = event.target;
  btn.disabled = true;

  fetch(`/api/admin/emprestimos/enviar-email/${id}`, {
    method: 'POST'
  })
  .then(async (res) => {
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    M.toast({ html: 'E-mail enviado com sucesso', classes: 'green' });
  })
  .catch((err) => {
    console.error(err);
    M.toast({ html: err.message, classes: 'red' });
  })
  .finally(() => {
    btn.disabled = false;
  });
}

// WHATSAPP
function enviarWhats(id) {

  fetch(`/api/admin/emprestimos/whatsapp/${id}`)
    .then(res => res.json())
    .then(data => {

      if (!data.telefone) {
        M.toast({ html: 'Aluno sem telefone cadastrado' });
        return;
      }

      // limpa telefone (remove espaços, traços, etc.)
      const telefone = data.telefone.replace(/\D/g, '');

      const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(data.mensagem)}`;

      window.open(url, '_blank');
    })
    .catch(() => {
      M.toast({ html: 'Erro ao gerar WhatsApp' });
    });
}


// PAGINAÇÃO
function proximaPagina() {
  paginaAtual++;
  renderTabela();
}

function paginaAnterior() {
  if (paginaAtual > 1) paginaAtual--;
  renderTabela();
}