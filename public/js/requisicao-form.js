document.addEventListener('DOMContentLoaded', function () {

    let listaLivros = [];

    /* =========================
       UTILIDADES
    ========================= */

    function normalizarTexto(texto) {
        return texto
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function converterInputDate(dataISO) {
        if (!dataISO) return null;

        const [ano, mes, dia] = dataISO.split('-');
        return new Date(ano, mes - 1, dia);
    }

    function formatarDataBR(date) {
        if (!date) return '';

        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();

        return `${dia}/${mes}/${ano}`;
    }

    function formatarDataInputParaBR(dataISO) {
        if (!dataISO) return '-';

        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function calcularDataPrevista(dataISO, dias) {
        const data = converterInputDate(dataISO);
        if (!data) return '';

        data.setDate(data.getDate() + parseInt(dias));

        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();

        return `${dia}/${mes}/${ano}`; // continua exibindo em BR
    }

    function validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');

        if (cpf.length !== 11) return false;

        // elimina CPFs inválidos conhecidos
        if (/^(\d)\1+$/.test(cpf)) return false;

        let soma = 0;
        let resto;

        // 1º dígito
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }

        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;

        if (resto !== parseInt(cpf.substring(9, 10))) return false;

        // 2º dígito
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }

        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;

        if (resto !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    /* =========================
       ATUALIZA DEVOLUÇÃO (TEMPO REAL)
    ========================= */

    function atualizarDataPrevistaCampo() {
        const retirada = document.getElementById('data-retirada').value;
        const dias = document.getElementById('prazo-dias').value;

        if (!retirada || !dias) {
            document.getElementById('data-prevista').value = '';
            return;
        }

        document.getElementById('data-prevista').value =
            calcularDataPrevista(retirada, dias);

        M.updateTextFields();
    }

    document.getElementById('data-retirada')
        .addEventListener('change', atualizarDataPrevistaCampo);

    document.getElementById('prazo-dias')
        .addEventListener('input', atualizarDataPrevistaCampo);

    document.getElementById('data-solicitacao')
    .addEventListener('change', validarFormulario);

    /* =========================
       TABELA
    ========================= */

    function atualizarTabela() {
        const tbody = document.getElementById('tabela-livros');
        tbody.innerHTML = '';

        listaLivros.forEach((livro, index) => {

            tbody.innerHTML += `
                <tr>
                    <td>${livro.id}</td>
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${formatarDataInputParaBR(livro.data_retirada)}</td>
                    <td>${livro.prazo_dias}</td>
                    <td>${livro.data_devolucao_prevista}</td>
                    <td>${livro.observacao || '-'}</td>
                    <td>
                        <a href="#" class="btn-excluir" data-index="${index}" title="Excluir">
                            <i class="material-icons red-text">delete</i>
                        </a>
                    </td>
                </tr>
            `;
        });

        ativarEventosTabela();
    }

    function ativarEventosTabela() {
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.onclick = function (e) {
                e.preventDefault();
                listaLivros.splice(this.dataset.index, 1);
                atualizarTabela();
                validarFormulario();
            };
        });
    }

    /* =========================
       BUSCA DE ALUNO
    ========================= */

    document.getElementById('btn-buscar-aluno').addEventListener('click', async () => {

        const cpfInput = document.getElementById('cpf').value;
        const cpf = cpfInput.replace(/\D/g, '');

        if (!cpf) {
            M.toast({ html: 'Informe o CPF', classes: 'orange' });
            return;
        }

        if (!validarCPF(cpf)) {
            M.toast({ html: 'CPF inválido', classes: 'red' });
            return;
        }

        try {
            const response = await fetch(`/api/admin/alunos/buscar-aluno/${encodeURIComponent(cpf)}`);

            if (response.status === 404) {
                M.toast({ html: 'Aluno não cadastrado', classes: 'orange' });
                return;
            }

            if (!response.ok) throw new Error();

            const result = await response.json();
            const data = result.data;

            // 🔥 NOVO: bloqueia aluno inativo
            if (data.status && data.status.toLowerCase() === 'inativo') {

                // limpa campos por segurança
                document.getElementById('aluno-id').value = '';
                document.getElementById('nome').value = '';
                document.getElementById('celular').value = '';
                document.getElementById('email').value = '';
                document.getElementById('loja').value = '';

                M.updateTextFields();

                M.toast({
                    html: 'Aluno inativo. Não é possível realizar empréstimo.',
                    classes: 'red'
                });

                return;
            }

            // 🔥 segue fluxo normal
            document.getElementById('aluno-id').value = data.id;
            document.getElementById('nome').value = data.nomeCompleto;
            document.getElementById('celular').value = data.celular;
            document.getElementById('email').value = data.email;
            document.getElementById('loja').value = data.loja;

            M.updateTextFields();

            validarFormulario();

            M.toast({ html: 'Aluno encontrado', classes: 'green' });

        } catch (error) {
            console.error(error);

            M.toast({
                html: 'Erro ao buscar aluno',
                classes: 'red'
            });
        }
    });

    
    /* =========================
       AUTOCOMPLETE
    ========================= */

    function carregarLivros() {

        fetch('/api/admin/livros/auto-livros')
            .then(res => res.json())
            .then(data => {

                const autocompleteData = {};
                const mapa = {};

                data.forEach(livro => {
                    const chave = normalizarTexto(livro.titulo);
                    autocompleteData[livro.titulo] = null;
                    mapa[chave] = livro.id;
                });

                M.Autocomplete.init(
                    document.querySelectorAll('.autocomplete'),
                    {
                        data: autocompleteData,
                        limit: 20,
                        minLength: 1,
                        onAutocomplete: function (val) {

                            const id = mapa[normalizarTexto(val)];

                            document.getElementById('livro-id-selecionado').value = id || '';

                            if (!id) {
                                M.toast({ html: 'Livro inválido', classes: 'orange' });
                            }
                        }
                    }
                );

            });
    }

    carregarLivros();

    /* =========================
       LIMPAR CAMPOS (PADRÃO PROFISSIONAL)
    ========================= */

    function limparCamposLivro() {

        // 🔹 AUTOCOMPLETE
        const inputLivro = document.getElementById('autocomplete-livro');
        inputLivro.value = '';

        const instance = M.Autocomplete.getInstance(inputLivro);
        if (instance) {
            instance.close();
        }

        document.getElementById('livro-id-selecionado').value = '';

        // 🔹 OBSERVAÇÃO
        document.getElementById('obs-livro').value = '';

        // 🔹 DATA (AGORA PADRÃO HTML)
        document.getElementById('data-retirada').value = '';

        // 🔹 DATA PREVISTA
        document.getElementById('data-prevista').value = '';

        // 🔹 PRAZO (opcional resetar)
        //document.getElementById('prazo-dias').value = 40;

        // 🔥 ESSENCIAL → corrige labels do Materialize
        M.updateTextFields();
    }

    /* =========================
       ADICIONAR LIVRO
    ========================= */
    document.getElementById('btn-add-livro').addEventListener('click', async () => {

        const livroId = document.getElementById('livro-id-selecionado').value;
        const retirada = document.getElementById('data-retirada').value;
        const dias = document.getElementById('prazo-dias').value || 40;
        const obs = document.getElementById('obs-livro').value;

        // validações
        if (!livroId) {
            M.toast({ html: 'Selecione um livro', classes: 'orange' });
            return;
        }

        if (!retirada) {
            M.toast({ html: 'Informe a data de retirada', classes: 'orange' });
            return;
        }

        // duplicado
        if (listaLivros.some(l => String(l.id) === String(livroId))) {
            M.toast({ html: 'Livro já adicionado', classes: 'orange' });
            limparCamposLivro();
            return;
        }

        let livro;

        try {
            const response = await fetch(`/api/admin/livros/${livroId}`);

            if (!response.ok) {
                throw new Error('Falha na API');
            }

            livro = await response.json();

        } catch (error) {
            console.error('Erro ao buscar livro:', error);

            M.toast({
                html: 'Erro ao buscar o livro',
                classes: 'red'
            });

            return; // 🔥 IMPORTANTE: para aqui
        }

        // 🔥 valida fora do try
        if (!livro || !livro.id) {
            M.toast({ html: 'Livro inválido', classes: 'red' });
            return;
        }

        // 🔥 AGORA SIM adiciona (sem risco de erro falso)
        const dataPrevista = calcularDataPrevista(retirada, dias);

        listaLivros.push({
            id: livro.id,
            titulo: livro.titulo || '-',
            autor: livro.autor || '-',
            data_retirada: retirada,
            prazo_dias: dias,
            data_devolucao_prevista: dataPrevista || '-',
            observacao: obs || ''
        });

        atualizarTabela();
        validarFormulario();
        limparCamposLivro();

        M.toast({
            html: 'Livro adicionado com sucesso',
            classes: 'green'
        });

    });


    /* =========================
        SALVAR EMPRÉSTIMO
    ========================= */
    document.getElementById('btn-salvar-requisicao').addEventListener('click', async function () {

        const aluno_id = document.getElementById('aluno-id').value;
        const data_solicitacao = document.getElementById('data-solicitacao').value;
        const descricao = document.getElementById('observacao').value;

        /* =========================
           VALIDAÇÕES
        ========================= */

        if (!aluno_id) {
            M.toast({ html: 'Selecione um aluno', classes: 'red' });
            return;
        }

        if (!data_solicitacao) {
            M.toast({ html: 'Informe a data de solicitação', classes: 'red' });
            return;
        }

        // valida data inválida
        const data = new Date(data_solicitacao);
        if (isNaN(data.getTime())) {
            M.toast({ html: 'Data de solicitação inválida', classes: 'red' });
            return;
        }

        // impede data futura
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        data.setHours(0, 0, 0, 0);

        if (data > hoje) {
            M.toast({ html: 'Data de solicitação não pode ser futura', classes: 'red' });
            return;
        }

        if (listaLivros.length === 0) {
            M.toast({ html: 'Adicione pelo menos um livro', classes: 'red' });
            return;
        }

        /* =========================
           ENVIO
        ========================= */

        try {
            const response = await fetch('/api/admin/emprestimos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    aluno_id,
                    data_solicitacao,
                    descricao,
                    livros: listaLivros
                })
            });

            if (!response.ok) throw new Error();

            M.toast({ html: 'Requisição salva com sucesso', classes: 'green' });

            // limpa tudo após salvar
            limparRequisicaoCompleta();

        } catch (error) {
            console.error(error);
            M.toast({ html: 'Erro ao salvar requisição', classes: 'red' });
        }
    });

    
    /* =========================
       CANCELAR REQUISIÇÃO
    ========================= */
    document.getElementById('btn-cancelar-requisicao').addEventListener('click', function () {

        const confirmar = confirm('Deseja realmente cancelar esta requisição?');

        if (!confirmar) return;

        limparRequisicaoCompleta();

        // 🔹 VOLTAR PARA LISTAGEM
        window.location.href = '/gerenciar_emprestimos';
    });


    /* =========================
       FUNÇÃO DE LIMPAR TUDO
    ========================= */

    function limparRequisicaoCompleta() {

        // limpa aluno
        document.getElementById('aluno-id').value = '';
        document.getElementById('cpf').value = '';
        document.getElementById('nome').value = '';
        document.getElementById('celular').value = '';
        document.getElementById('email').value = '';
        document.getElementById('loja').value = '';

        // limpa livros
        listaLivros = [];
        atualizarTabela();

        // limpa campos de livro
        limparCamposLivro();

        // limpa dados gerais
        document.getElementById('data-solicitacao').value = '';
        document.getElementById('observacao').value = '';

        M.updateTextFields();
    }

    function validarFormulario() {

        const aluno_id = document.getElementById('aluno-id').value;
        const data_solicitacao = document.getElementById('data-solicitacao').value;

        const valido =
            aluno_id &&
            data_solicitacao &&
            listaLivros.length > 0;

        document.getElementById('btn-salvar-requisicao').disabled = !valido;
    }

    
    /* =========================
       MÁSCARAS
    ========================= */

    if ($.fn.mask) {
        $('#cpf').mask('000.000.000-00');
        $('#celular').mask('(00) 00000-0000');
    }

    validarFormulario();

});