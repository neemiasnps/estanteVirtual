document.addEventListener('DOMContentLoaded', async () => {

    const path = window.location.pathname;
    const isEdit = path.includes('/editar/');
    const id = isEdit ? path.split('/').pop() : null;

    // Inicializa Materialize
    M.AutoInit();

    // Máscaras
    if (typeof $ !== 'undefined' && $.fn.mask) {
        $('#cpf').mask('000.000.000-00');
        $('#celular').mask('(00) 00000-0000');
    }

    if (typeof $ !== 'undefined' && $.fn.mask) {
        $('#cpf').mask('000.000.000-00');
    } else {
        console.error('jQuery Mask não carregado');
    }

    if (isEdit) {
        document.getElementById('page-title').innerText = 'Editar Aluno';
        await carregarAluno(id);
    }

    document.getElementById('form-aluno')
        .addEventListener('submit', salvarAluno);
});


// ===============================
// VALIDAR CPF
// ===============================
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0, resto;

    for (let i = 1; i <= 9; i++)
        soma += parseInt(cpf.charAt(i - 1)) * (11 - i);

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;

    for (let i = 1; i <= 10; i++)
        soma += parseInt(cpf.charAt(i - 1)) * (12 - i);

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(cpf.charAt(10));
}


// ===============================
// VERIFICAR CPF DUPLICADO
// ===============================
async function verificarCPF(cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '');

    const res = await fetch(`/api/admin/alunos/verificar-cpf/${cpfLimpo}`);

    if (!res.ok) throw new Error('Erro ao verificar CPF');

    const data = await res.json();

    return data.exists;
}


// ===============================
// CARREGAR (EDIÇÃO)
// ===============================
async function carregarAluno(id) {
    const res = await fetch(`/api/admin/alunos/${id}`);
    const aluno = await res.json();

    document.getElementById('aluno-id').value = aluno.id;
    document.getElementById('nomeCompleto').value = aluno.nomeCompleto;
    document.getElementById('cpf').value = aplicarMascaraCPF(aluno.cpf);
    document.getElementById('celular').value = aluno.celular;
    document.getElementById('email').value = aluno.email;

    // ===============================
    // LOJA (AJUSTE AQUI)
    // ===============================
    const selectLoja = document.getElementById('loja');
    selectLoja.value = aluno.loja || '';

    // REINICIALIZA O SELECT
    M.FormSelect.init(selectLoja);

    // STATUS
    document.getElementById('status').checked = aluno.status === 'ativo';

    M.updateTextFields();
}

function aplicarMascaraCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');

    return cpf
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// ===============================
// SALVAR
// ===============================
async function salvarAluno(e) {
    e.preventDefault();

    const id = document.getElementById('aluno-id').value;

    const cpfField = document.getElementById('cpf');
    const cpf = cpfField.value;

    // ===============================
    // VALIDAR CPF
    // ===============================
    if (!validarCPF(cpf)) {
        M.toast({ html: 'CPF inválido', classes: 'red' });

        cpfField.focus();
        cpfField.classList.add('invalid');

        return;
    } else {
        cpfField.classList.remove('invalid');
    }

    // ===============================
    // VALIDAR CPF DUPLICADO (SÓ NO CADASTRO)
    // ===============================
    if (!id) {
        try {
            const existe = await verificarCPF(cpf);

            if (existe) {
                M.toast({ html: 'CPF já cadastrado', classes: 'red' });

                cpfField.focus();
                cpfField.classList.add('invalid');

                return;
            }
        } catch (error) {
            console.error(error);
            M.toast({ html: 'Erro ao validar CPF', classes: 'red' });
            return;
        }
    }

    const payload = {
        nomeCompleto: document.getElementById('nomeCompleto').value,
        cpf: cpf.replace(/\D/g, ''),
        celular: document.getElementById('celular').value,
        email: document.getElementById('email').value,
        loja: document.getElementById('loja').value,
        status: document.getElementById('status').checked ? 'ativo' : 'inativo'
    };

    try {
        let response;

        if (id) {
            response = await fetch(`/api/admin/alunos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch(`/api/admin/alunos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            M.toast({ html: 'Aluno salvo com sucesso', classes: 'green' });

            setTimeout(() => {
                window.location.href = '/gerenciar_alunos';
            }, 800);

        } else {
            M.toast({ html: 'Erro ao salvar aluno', classes: 'red' });
        }

    } catch (error) {
        console.error(error);
        M.toast({ html: 'Erro na requisição', classes: 'red' });
    }
}