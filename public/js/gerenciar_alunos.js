    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar Materialize
        M.AutoInit();

        // Inicialização dos modais
        var modals = document.querySelectorAll('.modal');
        M.Modal.init(modals, {
            preventScrolling: true, // Evitar scroll da página ao abrir o modal
            dismissible: false // Impedir fechar clicando fora do modal
        });

        // Máscara para CPF e Celular
        if (typeof $ !== 'undefined' && $.fn.mask) {
            $('#cpf').mask('000.000.000-00');
            $('#celular').mask('(00) 00000-0000');
            $('#edit-cpf').mask('000.000.000-00');
            $('#edit-celular').mask('(00) 00000-0000');
        } else {
            console.error('jQuery Mask Plugin não está carregado');
        }

        // Função de Validação de CPF
        function validarCPF(cpf) {
            cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
            if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; // Verifica tamanho e sequência

            let soma = 0, resto;
            for (let i = 1; i <= 9; i++) soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
            resto = (soma * 10) % 11;
            if (resto === 10 || resto === 11) resto = 0;
            if (resto !== parseInt(cpf.charAt(9))) return false;

            soma = 0;
            for (let i = 1; i <= 10; i++) soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
            resto = (soma * 10) % 11;
            if (resto === 10 || resto === 11) resto = 0;
            if (resto !== parseInt(cpf.charAt(10))) return false;

            return true;
        }

   
        
        // Função para verificar se o CPF já existe
        async function verificarCPF(cpf) {
            try {
                // Normalizar CPF removendo formatação
                const cpfSemFormatacao = cpf.replace(/\D/g, '');

                const response = await fetch(`/api/alunos/verificar-cpf/${encodeURIComponent(cpfSemFormatacao)}`);
                if (!response.ok) {
                    throw new Error('Erro na resposta da rede');
                }

                const data = await response.json();
                if (data.success) {
                    return data.exists;
                } else {
                    throw new Error('Erro ao verificar CPF.');
                }
            } catch (error) {
                console.error('Erro ao verificar CPF:', error);
                throw error;
            }
        }

        // Inicialização dos selects
        var selects = document.querySelectorAll('select');
        M.FormSelect.init(selects);

        // Adicionar evento de clique para fechar o modal ao clicar em "Cancelar"
        const cancelButtons = document.querySelectorAll('.modal-close');
        cancelButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault(); // Evita o comportamento padrão do botão
                const modal = button.closest('.modal'); // Encontra o modal mais próximo
                if (modal) {
                    const instance = M.Modal.getInstance(modal); // Obtém a instância do modal
                    if (instance) {
                        instance.close(); // Fecha o modal
                    }
                }
            });
        });

        // Event listener para o submit do formulário de adicionar aluno
        var formAddAluno = document.getElementById('form-add-aluno');
        if (formAddAluno) {
            formAddAluno.addEventListener('submit', function(event) {
                event.preventDefault();
                adicionarAluno();
            });
        }

        // Event listener para o submit do formulário de editar aluno
        var formEditAluno = document.getElementById('form-edit-aluno');
        if (formEditAluno) {
            formEditAluno.addEventListener('submit', function(event) {
                event.preventDefault();
                editarAluno();
            });
        }

        /* / Função para adicionar um aluno
        async function adicionarAluno() {
            var cpfField = document.getElementById('cpf');
            var cpf = cpfField.value;
            var nomeCompleto = document.getElementById('nome_completo').value;
            var celular = document.getElementById('celular').value;
            var email = document.getElementById('email').value;
            var loja = document.getElementById('loja').value;

            // Obter o status do switch
            var statusSwitch = document.getElementById('status-switch');
            var status = statusSwitch.checked ? 'ativo' : 'inativo';

            // Validar CPF
            if (!validarCPF(cpf)) {
                M.toast({
                    html: 'CPF inválido. Por favor, insira um CPF válido.',
                    classes: 'red'
                });

                // Focar no campo CPF e adicionar uma classe para destaque
                cpfField.focus();
                cpfField.classList.add('invalid'); // Adicione uma classe CSS para destacar o campo

                return;
            } else {
                // Remover a classe de destaque se a validação for bem-sucedida
                cpfField.classList.remove('invalid');
            }

            // Verificar se o CPF já existe
            try {
                const cpfExists = await verificarCPF(cpf);
                if (cpfExists) {
                    M.toast({
                        html: 'CPF já cadastrado. Por favor, insira um CPF diferente.',
                        classes: 'red'
                    });

                    // Focar no campo CPF e adicionar uma classe para destaque
                    cpfField.focus();
                    cpfField.classList.add('invalid'); // Adicione uma classe CSS para destacar o campo

                    return;
                }

                fetch('/api/alunos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cpf, nomeCompleto, celular, email, loja, status })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        M.toast({ html: 'Aluno cadastrado com sucesso!', classes: 'green' });
                        formAddAluno.reset();
                        M.Modal.getInstance(document.getElementById('modal-add-aluno')).close(); // Fecha o modal
                        carregarAlunos(); // Recarrega a lista de alunos após adição
                    } else {
                        M.toast({ html: 'Erro ao cadastrar aluno: ' + data.message, classes: 'red' });
                    }
                })
                .catch(error => {
                    console.error('Erro ao cadastrar aluno:', error);
                    M.toast({ html: 'Erro ao cadastrar aluno. Verifique o console para mais detalhes.', classes: 'red' });
                });
            } catch (error) {
                console.error('Erro ao verificar CPF:', error);
                M.toast({ html: 'Erro ao verificar CPF. Verifique o console para mais detalhes.', classes: 'red' });
            }
        }
        */
        // Função para adicionar um aluno
        async function adicionarAluno() {
            var cpfField = document.getElementById('cpf');
            var cpf = cpfField.value;
            var nomeCompleto = document.getElementById('nome_completo').value;
            var celular = document.getElementById('celular').value;
            var email = document.getElementById('email').value;
            var loja = document.getElementById('loja').value;

            // Obter o status do switch
            var statusSwitch = document.getElementById('status-switch');
            var status = statusSwitch.checked ? 'ativo' : 'inativo';

            // Validar CPF
            if (!validarCPF(cpf)) {
                M.toast({
                    html: 'CPF inválido. Por favor, insira um CPF válido.',
                    classes: 'red'
                });

                // Focar no campo CPF e adicionar uma classe para destaque
                cpfField.focus();
                cpfField.classList.add('invalid'); // Adicione uma classe CSS para destacar o campo

                return;
            } else {
                // Remover a classe de destaque se a validação for bem-sucedida
                cpfField.classList.remove('invalid');
            }

            // Verificar se o CPF já existe
            try {
                const cpfExists = await verificarCPF(cpf);
                if (cpfExists) {
                    M.toast({
                        html: 'CPF já cadastrado. Por favor, insira um CPF diferente.',
                        classes: 'red'
                    });

                    // Focar no campo CPF e adicionar uma classe para destaque
                    cpfField.focus();
                    cpfField.classList.add('invalid'); // Adicione uma classe CSS para destacar o campo

                    return;
                }

                // Remover caracteres não numéricos do CPF antes de enviar para o servidor
                //cpf = cpf.replace(/\D/g, '');

                fetch('/api/alunos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cpf, nomeCompleto, celular, email, loja, status })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        M.toast({ html: 'Aluno cadastrado com sucesso!', classes: 'green' });
                        formAddAluno.reset();
                        M.Modal.getInstance(document.getElementById('modal-add-aluno')).close(); // Fecha o modal
                        carregarAlunos(); // Recarrega a lista de alunos após adição
                    } else {
                        M.toast({ html: 'Erro ao cadastrar aluno: ' + data.message, classes: 'red' });
                    }
                })
                .catch(error => {
                    console.error('Erro ao cadastrar aluno:', error);
                    M.toast({ html: 'Erro ao cadastrar aluno. Verifique o console para mais detalhes.', classes: 'red' });
                });
            } catch (error) {
                console.error('Erro ao verificar CPF:', error);
                M.toast({ html: 'Erro ao verificar CPF. Verifique o console para mais detalhes.', classes: 'red' });
            }
        }
        
        // Função para editar um aluno
        function editarAluno() {
            var id = document.getElementById('edit-id-aluno').value;
            var cpf = document.getElementById('edit-cpf').value;
            var nomeCompleto = document.getElementById('edit-nome-completo').value;
            var celular = document.getElementById('edit-celular').value;
            var email = document.getElementById('edit-email').value;
            var loja = document.getElementById('edit-loja').value;

            // Obter o status do switch
            var editSwitch = document.getElementById('edit-switch');
            var status = editSwitch.checked ? 'ativo' : 'inativo';

            fetch(`/api/alunos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cpf, nomeCompleto, celular, email, loja, status })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    M.toast({ html: 'Aluno atualizado com sucesso!', classes: 'green' });
                    formEditAluno.reset();
                    M.Modal.getInstance(document.getElementById('modal-edit-aluno')).close(); // Fecha o modal
                    carregarAlunos(); // Recarrega a lista de alunos após edição
                } else {
                    M.toast({ html: 'Erro ao atualizar aluno: ' + data.message, classes: 'red' });
                }
            })
            .catch(error => {
                console.error('Erro ao atualizar aluno:', error);
                M.toast({ html: 'Erro ao atualizar aluno. Verifique o console para mais detalhes.', classes: 'red' });
            });
        }

        // Função para carregar os alunos
        function carregarAlunos() {
            fetch(`/api/alunos?page=${paginaAtual}&limit=${alunosPorPagina}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro na resposta da rede');
                    }
                    return response.json();
                })
                .then(data => {
                    if (!data.alunos || !data.totalPages) {
                        throw new Error('Dados da API inválidos');
                    }
                    alunos = data.alunos;
                    mostrarAlunos();
                    configurarPaginacao(data.totalPages);
                })
                .catch(error => console.error('Erro ao carregar os alunos:', error));
        }

        // Função para mostrar alunos na tabela
        function mostrarAlunos() {
            const alunosTableBody = document.getElementById('alunos-table-body');
            alunosTableBody.innerHTML = '';

            alunos.forEach(aluno => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${aluno.id}</td>
                    <td>${aluno.nomeCompleto}</td>
                    <td>${aluno.cpf}</td>
                    <td>${aluno.celular}</td>
                    <td>${aluno.email}</td>
                    <td>${aluno.loja}</td>
                    <td>
                        <a href="#modal-edit-aluno" class="modal-trigger" data-id="${aluno.id}"><i class="material-icons">edit</i></a>
                        <a href="#modal-delete-aluno" class="modal-trigger" data-id="${aluno.id}"><i class="material-icons">delete</i></a>
                    </td>
                `;
                alunosTableBody.appendChild(tr);
            });

            // Inicializar os eventos de edição e exclusão
            inicializarEventosModais();
        }

        // Função para configurar a paginação
        function configurarPaginacao(totalPages) {
            const paginacaoContainer = document.getElementById('pagination-controls');
            paginacaoContainer.innerHTML = '';

            // Adiciona o botão de "Página Anterior"
            if (paginaAtual > 1) {
                const prevLi = document.createElement('li');
                prevLi.classList.add('waves-effect');
                const prevA = document.createElement('a');
                prevA.href = '#!';
                prevA.textContent = '«'; // ou 'Previous'
                prevA.addEventListener('click', function(event) {
                    event.preventDefault();
                    paginaAtual--;
                    carregarAlunos();
                });
                prevLi.appendChild(prevA);
                paginacaoContainer.appendChild(prevLi);
            }

            // Adiciona os botões de página
            for (let i = 1; i <= totalPages; i++) {
                const li = document.createElement('li');
                li.classList.add('waves-effect');
                if (i === paginaAtual) {
                    li.classList.add('active');
                }

                const a = document.createElement('a');
                a.href = '#!';
                a.textContent = i;
                a.addEventListener('click', function(event) {
                    event.preventDefault();
                    paginaAtual = i;
                    carregarAlunos();
                });

                li.appendChild(a);
                paginacaoContainer.appendChild(li);
            }

            // Adiciona o botão de "Próxima Página"
            if (paginaAtual < totalPages) {
                const nextLi = document.createElement('li');
                nextLi.classList.add('waves-effect');
                const nextA = document.createElement('a');
                nextA.href = '#!';
                nextA.textContent = '»'; // ou 'Next'
                nextA.addEventListener('click', function(event) {
                    event.preventDefault();
                    paginaAtual++;
                    carregarAlunos();
                });
                nextLi.appendChild(nextA);
                paginacaoContainer.appendChild(nextLi);
            }
        }

        // Função para inicializar os eventos dos modais de edição e exclusão
        function inicializarEventosModais() {
            document.querySelectorAll('.modal-trigger[data-id]').forEach(element => {
                element.addEventListener('click', function() {
                    const alunoId = element.getAttribute('data-id');
                    carregarAlunoParaEdicao(alunoId);

                    // Define o ID do aluno para o modal de exclusão
                    document.getElementById('modal-delete-aluno').setAttribute('data-id', alunoId);
                });
            });

            // Evento para confirmar exclusão
            document.getElementById('confirm-delete').addEventListener('click', function() {
                const alunoId = document.getElementById('modal-delete-aluno').getAttribute('data-id');

                // Verifica se o ID é válido antes de tentar excluir
                if (!alunoId) {
                    console.error('ID do aluno não fornecido');
                    M.toast({ html: 'ID do aluno não fornecido', classes: 'red' });
                    return;
                }

                excluirAluno(alunoId);
            });
        }

        // Função para carregar dados do aluno para edição
        function carregarAlunoParaEdicao(id) {
            fetch(`/api/alunos/${id}`)
                .then(response => response.json())
                .then(aluno => {
                    document.getElementById('edit-id-aluno').value = aluno.id;
                    document.getElementById('edit-cpf').value = aluno.cpf;
                    document.getElementById('edit-nome-completo').value = aluno.nomeCompleto;
                    document.getElementById('edit-celular').value = aluno.celular;
                    document.getElementById('edit-email').value = aluno.email;
                    document.getElementById('edit-loja').value = aluno.loja;
                    document.getElementById('edit-switch').checked = aluno.status === 'ativo';

                    // Configura o switch com base no status do aluno
                    //const statusSwitch = document.getElementById('edit-switch');
                    //statusSwitch.checked = aluno.status === 'ativo';
                    
                    // Atualizar os labels dos inputs
                    M.updateTextFields();
                    M.FormSelect.init(document.querySelectorAll('select')); // Re-inicializar selects no modal
                })
                .catch(error => console.error('Erro ao carregar dados do aluno para edição:', error));
        }

  
        // Função para excluir ou desativar um aluno
        function excluirAluno(id) {
            fetch(`/api/alunos/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na resposta da rede');
                }
                return response.json();
            })
            .then(data => {
                // Verifica se a operação foi bem-sucedida através do campo 'success'
                if (data.success) {
                    // Mensagem baseada na resposta do servidor
                    if (data.message.includes('desativado')) {
                        M.toast({ html: 'Aluno desativado com sucesso!', classes: 'orange' });
                    } else if (data.message.includes('excluído')) {
                        M.toast({ html: 'Aluno excluído com sucesso!', classes: 'green' });
                    } else {
                        M.toast({ html: 'Operação realizada com sucesso!', classes: 'green' });
                    }

                    // Fecha o modal
                    M.Modal.getInstance(document.getElementById('modal-delete-aluno')).close();

                    // Recarregar a lista de alunos após a operação
                    carregarAlunos();
                } else {
                    // Exibe a mensagem de erro apenas se o campo 'success' for false
                    M.toast({ html: data.message || 'Erro ao excluir aluno', classes: 'red' });
                }
            })
            .catch(error => {
                console.error('Erro ao excluir aluno:', error);
                // M.toast({ html: 'Erro ao excluir aluno. Verifique o console para mais detalhes.', classes: 'red' });
            });
        }

        // Variáveis de controle de paginação
        const alunosPorPagina = 9;
        let alunos = [];
        let paginaAtual = 1;

        // Carregar alunos na inicialização
        carregarAlunos();

        function debounce(func, delay) {
            let timerId;
            return function (...args) {
                if (timerId) {
                    clearTimeout(timerId);
                }
                timerId = setTimeout(() => func.apply(this, args), delay);
            };
        }

        function buscarAlunosPorNome(nome) {
            console.log(`Buscando alunos com o nome: ${nome}`);

            fetch(`/api/alunos/buscar-nome/${encodeURIComponent(nome)}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Erro ao buscar alunos: ${response.statusText || response.status}`);
                    }
                    return response.json();
                })
                .then(alunos => {
                    console.log('Dados recebidos da API:', alunos);
                    if (!Array.isArray(alunos)) {
                        throw new Error('Dados inválidos recebidos da API');
                    }

                    const alunosTableBody = document.getElementById('alunos-table-body');
                    alunosTableBody.innerHTML = '';

                    if (alunos.length > 0) {
                        alunos.forEach(aluno => {
                            const row = `
                                <tr>
                                    <td>${aluno.id}</td>
                                    <td>${aluno.nome}</td>
                                    <td>${aluno.cpf}</td>
                                    <td>${aluno.celular}</td>
                                    <td>${aluno.email}</td>
                                    <td>${aluno.loja}</td>
                                    <td>
                                        <a href="#modal-edit-aluno" class="modal-trigger" data-id="${aluno.id}"><i class="material-icons">edit</i></a>
                        <a href="#modal-delete-aluno" class="modal-trigger" data-id="${aluno.id}"><i class="material-icons">delete</i></a>
                                    </td>
                                </tr>
                            `;
                            alunosTableBody.innerHTML += row;
                            // Inicializar os eventos de edição e exclusão
                            inicializarEventosModais();
                        });
                    } else {
                        alunosTableBody.innerHTML = '<tr><td colspan="6">Nenhum aluno encontrado.</td></tr>';
                        M.toast({ html: 'Nenhum aluno encontrado.', classes: 'orange' });
                    }

                    M.FormSelect.init(document.querySelectorAll('select'));


                    document.querySelectorAll('.btn-edit-aluno').forEach(button => {
                        button.addEventListener('click', editarAluno);
                    });

                    document.querySelectorAll('.btn-delete-aluno').forEach(button => {
                        button.addEventListener('click', abrirModalConfirmacaoExclusao);
                    });
                })
                .catch(error => {
                    console.error('Erro ao buscar alunos:', error.message || error);
                    M.toast({ html: `Erro ao buscar alunos: ${error.message || 'Erro desconhecido'}`, classes: 'red' });
                });
        }

        // Crie a função debounce para a busca
        const buscarAlunosDebounced = debounce(function () {
            const searchTerm = document.getElementById('search').value.trim();
            if (searchTerm) {
                buscarAlunosPorNome(searchTerm);
            } else {
                // Se o campo de busca estiver vazio, carregue todos os alunos
                carregarAlunos();
            }
        }, 100); // Ajuste o delay conforme necessário

        // Evento para o campo de busca
        document.getElementById('search').addEventListener('input', buscarAlunosDebounced);
    });
