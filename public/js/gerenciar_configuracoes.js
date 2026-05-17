document.addEventListener('DOMContentLoaded', () => {

    carregarConfiguracoes();

});

/* =========================
   CARREGAR CONFIGURAÇÕES
========================= */

async function carregarConfiguracoes() {

    const res = await fetch('/api/admin/configuracoes');
    const data = await res.json();

    renderizarConfiguracoes(data);
}

/* =========================
   RENDERIZAR
========================= */

function renderizarConfiguracoes(configs) {

    const whatsappBox = document.getElementById('whatsapp-configs');
    const emailBox = document.getElementById('email-configs');

    whatsappBox.innerHTML = '';
    emailBox.innerHTML = '';

    configs.forEach(c => {

        const grupo = c.chave.startsWith('whatsapp_') ? 'whatsapp' : 'email';

        // NÃO renderiza o ativo aqui
        if (c.chave === 'whatsapp_ativo' || c.chave === 'email_ativo') return;

        const checked = c.valor === 'true' ? 'checked' : '';

        const html = `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;">
                <span>${formatarNome(c.chave)}</span>

                <div class="switch">
                    <label>
                        <input type="checkbox"
                               data-chave="${c.chave}"
                               data-grupo="${grupo}"
                               ${checked}
                               onchange="atualizarConfiguracao(this)">
                        <span class="lever"></span>
                    </label>
                </div>
            </div>
            <div class="divider"></div>
        `;

        if (grupo === 'whatsapp') whatsappBox.innerHTML += html;
        else emailBox.innerHTML += html;
    });

    inicializarServicos(configs);
}

function toggleServico(servico, ativo) {

    // só bloqueia ou libera edição
    document.querySelectorAll(`[data-grupo="${servico}"]`).forEach(el => {
        el.disabled = !ativo;
    });

    atualizarServicoBackend(servico, ativo);
}

function inicializarServicos(configs) {

    const whatsAtivo = configs.find(c => c.chave === 'whatsapp_ativo')?.valor === 'true';
    const emailAtivo = configs.find(c => c.chave === 'email_ativo')?.valor === 'true';

    const w = document.getElementById('whatsapp_ativo');
    const e = document.getElementById('email_ativo');

    if (w) {
        w.checked = whatsAtivo;
        toggleServico('whatsapp', whatsAtivo);
    }

    if (e) {
        e.checked = emailAtivo;
        toggleServico('email', emailAtivo);
    }
}

/* =========================
   FORMATAR NOME
========================= */

function formatarNome(chave) {

    return chave
        .replace('whatsapp_', '')
        .replace('email_', '')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}


/* =========================
   ATUALIZAR CONFIGURAÇÃO
    ========================= */

async function atualizarConfiguracao(el) {

    if (el.disabled) return;

    const chave = el.dataset.chave;
    const valor = el.checked;

    await fetch(`/api/admin/configuracoes/${chave}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: valor.toString() })
    });
}

async function atualizarServicoBackend(servico, ativo) {

    await fetch(`/api/admin/configuracoes/${servico}_ativo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: ativo.toString() })
    });
}