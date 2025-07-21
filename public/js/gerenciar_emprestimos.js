document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializar Materialize
    M.AutoInit();

    // Inicialização dos modais
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals, {
        preventScrolling: true, // Evitar scroll da página ao abrir o modal
        dismissible: false // Impedir fechar clicando fora do modal
    });

    //var elems = document.querySelectorAll('.sidenav');
    //var instances = M.Sidenav.init(elems);

    // Configurar o botão de adicionar empréstimo
    document.querySelector('.btn-floating.modal-trigger').addEventListener('click', function() {
        // Abrir o modal
        var modalInstance = M.Modal.getInstance(document.getElementById('modal-add-emprestimo'));
        //carregarLivros();
        modalInstance.open();
        

        // Limpar o formulário
        resetarFormulario();
    });

    function resetarFormulario() {
        // Limpar o formulário de aluno
        const formAddAluno = document.getElementById('form-add-aluno');
        if (formAddAluno) {
            formAddAluno.reset();
        }

        // Limpar campos específicos
        document.getElementById('data-solicitacao').value = '';
        document.getElementById('data-devolucao').value = '';
        document.getElementById('character-counter').value = '';

        // Mostrar/Esconder botões
        document.getElementById('search-aluno').style.display = 'block'; // Mostra o botão de pesquisa
        document.getElementById('btn-salvar').style.display = 'inline-block'; // Mostra o botão de salvar
        document.getElementById('add-to-table-fab').style.display = 'inline-block'; // Mostra o botão de adicionar livro

        // Limpar a tabela de livros
        const livrosTableBody = document.getElementById('livros-table-body');
        if (livrosTableBody) {
            livrosTableBody.innerHTML = '';
        }

        // Habilitar campos
        document.querySelectorAll('#modal-add-emprestimo input, #modal-add-emprestimo textarea').forEach(input => {
            //input.disabled = false;
        });

        // Inicializar e limpar datepickers
        const datepickers = M.Datepicker.init(document.querySelectorAll('.datepicker'), {});
        datepickers.forEach(dp => dp.setDate(null));

        // Desabilitar data de devolução
        document.getElementById('data-devolucao').disabled = true;

        // Atualizar os labels dos inputs
        M.updateTextFields();

        // Re-inicializar selects no modal (se houver)
        M.FormSelect.init(document.querySelectorAll('select'));
    }


    // Reinitialize selects after updating the DOM
    M.FormSelect.init(document.querySelectorAll('select'));

    // Inicializa abas
    var tabs = document.querySelectorAll('.tabs');
    if (tabs.length > 0) {
        M.Tabs.init(tabs, {
            swipeable: false,
            responsiveThreshold: 1920
        });
    } else {
        console.error('Nenhuma aba encontrada.');
    }

    // Máscara para CPF e Celular
    if (typeof $ !== 'undefined' && $.fn.mask) {
        $('#cpf').mask('000.000.000-00');
        $('#celular').mask('(00) 00000-0000');
    } else {
        console.error('jQuery Mask Plugin não está carregado');
    }

    // Adiciona evento para o botão de pesquisa do aluno
    var btnSearchAluno = document.getElementById('search-aluno');
    if (btnSearchAluno) {
        btnSearchAluno.addEventListener('click', function() {
            console.log('Botão de pesquisa clicado');
            var cpf = document.getElementById('cpf').value;
            if (cpf) {
                fetch(`/api/alunos/buscar-aluno/${encodeURIComponent(cpf)}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Aluno não encontrado');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Dados retornados:', data);
                        document.getElementById('idAluno').value = data.id || '';
                        document.getElementById('nome').value = data.nome || '';
                        document.getElementById('celular').value = data.celular || '';
                        document.getElementById('email').value = data.email || '';
                        document.getElementById('loja').value = data.loja || '';
                        M.updateTextFields(); // Atualiza labels dos campos de texto
                        M.toast({html: 'Aluno encontrado com sucesso!', classes: 'rounded'});
                    })
                    .catch(error => {
                        console.error('Erro ao buscar o aluno:', error);
                        M.toast({html: 'Aluno não encontrado ou erro na consulta.', classes: 'rounded'})
                    });
            } else {
                console.error('CPF não fornecido.');
                M.toast({html: 'CPF não fornecido.', classes: 'red'});
            }
        });
    } else {
        console.error('Botão de pesquisa do aluno não encontrado.');
    }

    // Inicializa o autocomplete
    const autocompleteElems = document.querySelectorAll('.autocomplete');
    const autocompleteInstances = M.Autocomplete.init(autocompleteElems, {
        data: {},
        onAutocomplete: function(val) {
            //fetch(`/api/livros/${encodeURIComponent(val)}`)
            fetch(`/api/livros/livro/id/${encodeURIComponent(livroId)}`) // ✅ Busca pelo ID
                .then(response => response.json())
                .then(data => {
                    console.log('Dados retornados:', data);
                    const livrosTableBody = document.getElementById('livros-table-body');
                    livrosTableBody.innerHTML = ''; // Limpa a tabela

                    data.livros.forEach(livro => {
                        const row = document.createElement('tr');
                        row.dataset.id = livro.id; // Adiciona o ID do livro como atributo de dados
                        row.innerHTML = `
                            <td><input type="checkbox" class="filled-in" id="livro-${livro.id}" />
                                <label for="livro-${livro.id}"></label>
                            </td>
                            <td>${livro.titulo}</td>
                            <td>${livro.autor}</td>
                            <td>${livro.genero}</td>
                        `;
                        livrosTableBody.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('Erro ao buscar livros:', error);
                });
        }
    });
   
    carregarLivros(); // Carregar livros para autocomplete quando a página carregar

    // Função para atualizar eventos dos botões de exclusão
    function atualizarEventosDeExcluir() {
        var deleteButtons = document.querySelectorAll('.btn-delete-livro');
        deleteButtons.forEach(function(button) {
            button.removeEventListener('click', deletarLivro);
            button.addEventListener('click', deletarLivro);
        });

        // Atualiza eventos de exclusão dos empréstimos
        var deleteEmprestimoButtons = document.querySelectorAll('.btn-delete-emprestimo');
        deleteEmprestimoButtons.forEach(function(button) {
            button.removeEventListener('click', abrirModalConfirmacaoExclusao);
            button.addEventListener('click', abrirModalConfirmacaoExclusao);
        });
    }
    
    // Função para salvar ou atualizar o empréstimo
    function salvarEmprestimo() {
        const alunoId = document.getElementById('idAluno').value;
        const dataSolicitacao = document.getElementById('data-solicitacao').value;
        const descricao = document.getElementById('character-counter').value.trim();

        const livrosSelecionados = Array.from(document.querySelectorAll('#livros-table-body tr'))
            .map(row => row.dataset.id);

        console.log('Aluno ID:', alunoId);
        console.log('Data Solicitação:', dataSolicitacao);
        console.log('Descrição:', descricao);
        console.log('Livros Selecionados:', livrosSelecionados);

        if (!alunoId) {
            M.toast({ html: 'Aluno não selecionado.', classes: 'red' });
            document.getElementById('idAluno').focus();
            return;
        }
        if (livrosSelecionados.length === 0) {
            M.toast({ html: 'Pelo menos um livro deve ser adicionado.', classes: 'red' });
            document.querySelector('#livros-table-body').focus();
            return;
        }
        if (!dataSolicitacao) {
            M.toast({ html: 'Data de solicitação é obrigatória.', classes: 'red' });
            document.getElementById('data-solicitacao').focus();
            return;
        }

        const quantidadeLivros = livrosSelecionados.length;

        const url = emprestimoIdEdicao ? `/api/emprestimos/${emprestimoIdEdicao}` : '/api/emprestimos';
        const method = emprestimoIdEdicao ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                aluno_id: alunoId,
                livros: livrosSelecionados,
                quantidade_livros: quantidadeLivros,
                data_solicitacao: dataSolicitacao,
                descricao: descricao
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao salvar o empréstimo');
            }
            return response.json();
        })
        .then(data => {
            M.toast({ html: emprestimoIdEdicao ? 'Empréstimo atualizado com sucesso!' : 'Empréstimo salvo com sucesso!', classes: 'green' });
            var modalInstance = M.Modal.getInstance(document.getElementById('modal-add-emprestimo'));
            modalInstance.close();
            document.getElementById('form-add-aluno').reset();
            document.getElementById('livros-table-body').innerHTML = '';
            document.getElementById('data-solicitacao').value = '';
            document.getElementById('character-counter').value = '';
            emprestimoIdEdicao = null; // Reset the edit ID
            //carregarEmprestimos(1);
            carregarEmprestimos(currentPage, document.getElementById('status-filter').value);
        })
        .catch(error => {
            console.error('Erro ao salvar o empréstimo:', error);
            M.toast({ html: 'Erro ao salvar o empréstimo.', classes: 'red' });
            document.getElementById('form-add-aluno').reset();
        });
    }

    // Adiciona o evento de click ao botão "Salvar"
    document.getElementById('btn-salvar').addEventListener('click', salvarEmprestimo);

    // Inicializa o Character Counter
    M.CharacterCounter.init(document.querySelectorAll('textarea[data-length]'));

    // Inicializa o Datepicker
    M.Datepicker.init(document.querySelectorAll('.datepicker'), {
        format: 'yyyy-mm-dd', // Ajuste o formato conforme necessário
        autoClose: true, // Fecha o seletor de data após selecionar uma data
        setDefaultDate: true, // Define a data padrão para o dia atual
    });

    // Função para excluir um livro da tabela
    function deletarLivro(event) {
        event.preventDefault();
        const row = event.currentTarget.closest('tr');
        if (row) {
            row.remove();
        }
    }

     atualizarEventosDeExcluir();

    // Variáveis para controle da paginação
    let currentPage = 1; // Página atual
    const emprestimosPerPage = 10; // Número de empréstimos por página
    let totalPages = 0; // Total de páginas

    // Função para carregar empréstimos com base na página e no filtro
    function carregarEmprestimos(page = 1, filtro = 'todos') {
        console.log(`Carregando empréstimos da página ${page} com filtro ${filtro}`);

        fetch(`/api/emprestimos?page=${page}&limit=${emprestimosPerPage}&filtro=${encodeURIComponent(filtro)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar empréstimos: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dados recebidos da API:', data); // Adicione isto para depuração
                if (!data || !data.emprestimos || !Array.isArray(data.emprestimos)) {
                    throw new Error('Dados inválidos recebidos da API');
                }

                const { emprestimos, totalPages } = data;
                console.log(`Total de páginas: ${totalPages}`);

                var emprestimosTableBody = document.getElementById('emprestimos-table-body');
                emprestimosTableBody.innerHTML = '';

                if (emprestimos.length > 0) {
                    emprestimos.forEach(emprestimo => {
                        // Verifica a situação do empréstimo
                        const situacaoFinalizado = emprestimo.situacao === 'finalizado';

                        // Formata a data
                        const dataFormatada = formatarData(emprestimo.data_solicitacao);

                        // Cria a linha da tabela
                        var row = `
                            <tr>
                                <td>${emprestimo.id}</td>
                                <td>${emprestimo.nomeAluno}</td>
                                <td>${emprestimo.loja}</td>
                                <td>${dataFormatada}</td>
                                <td>${emprestimo.situacao}</td>
                                <td>
                                    <a href="#" class="btn-view-emprestimo" data-id="${emprestimo.id}"><i class="material-icons">visibility</i></a>
                                    <a href="#" class="btn-edit-emprestimo ${situacaoFinalizado ? 'disabled' : ''}" data-id="${emprestimo.id}"><i class="material-icons">edit</i></a>
                                    <a href="#" class="btn-delete-emprestimo ${situacaoFinalizado ? 'disabled' : ''}" data-id="${emprestimo.id}"><i class="material-icons">delete</i></a>
                                    <a href="#" class="btn-finish-emprestimo ${situacaoFinalizado ? 'disabled' : ''}" data-id="${emprestimo.id}"><i class="material-icons">check_circle</i></a>
                                    <a href="#" class="btn-send-whatsapp ${situacaoFinalizado ? 'disabled' : ''}" data-id="${emprestimo.id}"><i class="material-icons">message</i></a>
                                    <a href="#" class="btn-send-email ${situacaoFinalizado ? 'disabled' : ''}" data-id="${emprestimo.id}"><i class="material-icons">email</i></a>
                                </td>
                            </tr>
                        `;
                        emprestimosTableBody.innerHTML += row;
                    });
                } else {
                    emprestimosTableBody.innerHTML = '<tr><td colspan="6">Nenhum empréstimo encontrado.</td></tr>';
                }

                // Inicialização dos selects, se houver algum na tabela
                M.FormSelect.init(document.querySelectorAll('select'));

                // Adicionar eventos aos botões
                document.querySelectorAll('.btn-view-emprestimo').forEach(button => {
                    button.addEventListener('click', visualizarEmprestimo);
                });

                document.querySelectorAll('.btn-edit-emprestimo').forEach(button => {
                    button.addEventListener('click', editarEmprestimo);
                });

                document.querySelectorAll('.btn-delete-emprestimo').forEach(button => {
                    button.addEventListener('click', abrirModalConfirmacaoExclusao);
                });

                document.querySelectorAll('.btn-finish-emprestimo').forEach(button => {
                    button.addEventListener('click', finalizarEmprestimo);
                });

                /* document.querySelectorAll('.btn-print-emprestimo').forEach(button => {
                    button.addEventListener('click', visualizarEImprimirPdf);
                });*/

                document.querySelectorAll('.btn-send-whatsapp').forEach(button => {
                    button.addEventListener('click', enviarWhatsApp);
                });

                document.querySelectorAll('.btn-send-email').forEach(button => {
                    button.addEventListener('click', enviarEmail);
                });

                updatePaginationControls(totalPages);
            })
            .catch(error => {
                console.error('Erro ao buscar empréstimos:', error);
                M.toast({ html: 'Erro ao buscar empréstimos.', classes: 'red' });
            });
    }

    

    // Adiciona o evento de mudança ao filtro
        document.getElementById('status-filter').addEventListener('change', function() {
            const selectedFiltro = this.value;
            console.log(`Filtro selecionado: ${selectedFiltro}`); // Adicione isto para depuração
            carregarEmprestimos(currentPage, selectedFiltro);
            updatePaginationControls(totalPages);
        });
    //});

    // Função para visualizar empréstimo
    function visualizarEmprestimo(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;

        // Fazer a chamada para obter os dados do empréstimo
        fetch(`/api/emprestimos/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar dados do empréstimo: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const { emprestimo, livros } = data;

                // Preencher as informações do aluno
                document.getElementById('cpf').value = emprestimo.aluno ? emprestimo.aluno.cpf : 'N/A';
                document.getElementById('idAluno').value = emprestimo.aluno ? emprestimo.aluno.id : 'N/A';
                document.getElementById('nome').value = emprestimo.aluno ? emprestimo.aluno.nomeCompleto : 'N/A';
                document.getElementById('celular').value = emprestimo.aluno ? emprestimo.aluno.celular : 'N/A';
                document.getElementById('email').value = emprestimo.aluno ? emprestimo.aluno.email : 'N/A';
                document.getElementById('loja').value = emprestimo.aluno ? emprestimo.aluno.loja : 'N/A';

                // Preencher a data da solicitação
                const dataSolicitacao = emprestimo.data_solicitacao ? new Date(emprestimo.data_solicitacao).toLocaleDateString() : 'N/A';

                // Preencher a data da devolução
                const dataDevolucao = emprestimo.data_devolucao ? new Date(emprestimo.data_devolucao).toLocaleDateString() : 'N/A';

                document.getElementById('data-solicitacao').value = dataSolicitacao;
                document.getElementById('data-devolucao').value = dataDevolucao;
                document.getElementById('character-counter').value = emprestimo.descricao || 'N/A';

                // Preencher a tabela de livros
                const livrosTableBody = document.getElementById('livros-table-body');
                livrosTableBody.innerHTML = ''; // Limpa o conteúdo atual

                livros.forEach(livro => {
                    const row = `
                        <tr>
                            <td>${livro.id}</td>
                            <td>${livro.titulo}</td>
                            <td>${livro.autor}</td>
                            <td>${livro.genero}</td>
                        </tr>
                    `;
                    livrosTableBody.innerHTML += row;
                });

                // Inicializar abas
                M.Tabs.init(document.querySelectorAll('.tabs'));

                // Atualizar os labels dos inputs
                M.updateTextFields();

                // Re-inicializar selects no modal (se houver)
                M.FormSelect.init(document.querySelectorAll('select'));

                // Ocultar botões específicos para visualização
                document.getElementById('cpf').disabled = true;
                document.getElementById('autocomplete-input').disabled = true;
                document.getElementById('data-solicitacao').disabled = true;
                document.getElementById('data-devolucao').disabled = true;
                document.getElementById('character-counter').disabled = true;
                document.getElementById('search-aluno').style.display = 'none';
                document.getElementById('btn-salvar').style.display = 'none';
                document.getElementById('add-to-table-fab').style.display = 'none';


                // Configurar botões
                document.getElementById('btn-cancelar-modal').style.display = 'inline-block';

                // Inicializar e abrir o modal
                var instance = M.Modal.getInstance(document.getElementById('modal-add-emprestimo'));
                instance.open();
            })
            .catch(error => {
                console.error('Erro ao buscar dados do empréstimo:', error);
                M.toast({ html: 'Erro ao buscar dados do empréstimo.', classes: 'red' });
            });
    }

    // Função para carregar dados no modal de edição
    let emprestimoIdEdicao = null;
    function editarEmprestimo(event) {
        emprestimoIdEdicao = event.currentTarget.getAttribute('data-id'); // Obtém o ID do empréstimo a ser editado
        if (!emprestimoIdEdicao) {
            console.error('ID do empréstimo não encontrado');
            return;
        }

        // Limpar o formulário
        resetarFormulario();

        fetch(`/api/emprestimos/${emprestimoIdEdicao}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na resposta da API');
                }
                return response.json();
            })
            .then(data => {
                if (!data.emprestimo || !data.livros) {
                    throw new Error('Dados do empréstimo não encontrados');
                }

                // Dados do empréstimo
                const emprestimo = data.emprestimo;
                const livros = data.livros;

                // Preenche os campos do aluno
                document.getElementById('idAluno').value = emprestimo.aluno.id;
                document.getElementById('cpf').value = emprestimo.aluno.cpf;
                document.getElementById('nome').value = emprestimo.aluno.nomeCompleto;
                document.getElementById('celular').value = emprestimo.aluno.celular;
                document.getElementById('email').value = emprestimo.aluno.email;
                document.getElementById('loja').value = emprestimo.aluno.loja;

                // Preenche os campos de data e descrição
                document.getElementById('data-solicitacao').value = emprestimo.data_solicitacao;
                document.getElementById('character-counter').value = emprestimo.descricao;

                // Limpa a tabela de livros
                const livrosTableBody = document.getElementById('livros-table-body');
                livrosTableBody.innerHTML = '';

                // Preenche a tabela de livros
                livros.forEach(livro => {
                    const row = document.createElement('tr');
                    row.dataset.id = livro.id;

                    row.innerHTML = `
                        <td>${livro.id}</td>
                        <td>${livro.titulo}</td>
                        <td>${livro.autor}</td>
                        <td>${livro.genero}</td>
                        <td>
                            <td><a href="#" class="btn-delete-livro" data-id="${livro.id}" data-titulo="${livro.titulo}"><i class="material-icons">delete</i></a></td>
                        </td>
                    `;

                    livrosTableBody.appendChild(row);
                });

                // Atualizar os labels dos inputs
                M.updateTextFields();
                atualizarEventosDeExcluir();
                M.FormSelect.init(document.querySelectorAll('select')); // Re-inicializar selects no modal

                // Abre o modal
                var modalInstance = M.Modal.getInstance(document.getElementById('modal-add-emprestimo'));
                modalInstance.open();
            })
            .catch(error => {
                console.error('Erro ao carregar dados do empréstimo:', error);
                M.toast({ html: 'Erro ao carregar dados do empréstimo.', classes: 'red' });
            });
    }

    // Função para abrir o modal de confirmação de exclusão
    function abrirModalConfirmacaoExclusao(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        const modal = document.getElementById('modal-delete-emprestimo');
        const confirmButton = document.getElementById('confirm-delete');

        const instance = M.Modal.getInstance(modal);
        instance.open();

        confirmButton.onclick = function() {
            deletarEmprestimo(id); // Passa o ID diretamente
            instance.close();
        };
    }

    // Função para deletar um empréstimo
    function deletarEmprestimo(id) {
        // Exibe o preloader
        document.getElementById('preloader').style.display = 'block';
        
        fetch(`/api/emprestimos/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            // Oculta o preloader
            document.getElementById('preloader').style.display = 'none';
            
            if (!response.ok) {
                throw new Error('Erro ao deletar o empréstimo');
            }
            M.toast({ html: 'Empréstimo deletado com sucesso!', classes: 'green' });
            carregarEmprestimos(currentPage); // Recarregar a lista de empréstimos
        })
        .catch(error => {
            // Oculta o preloader
            document.getElementById('preloader').style.display = 'none';
            
            console.error('Erro ao deletar o empréstimo:', error);
            M.toast({ html: 'Erro ao deletar o empréstimo.', classes: 'red' });
        });
    }

    // Função para finalizar o empréstimo
    async function finalizarEmprestimo(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.id;
        console.log(`Finalizar empréstimo com ID: ${id}`);

        // Confirmar ação com o usuário
        const confirmacao = confirm(`Você tem certeza que deseja finalizar o empréstimo n°: ${id}?`);
        if (!confirmacao) {
            return;
        }

        // Exibe o preloader
        document.getElementById('preloader').style.display = 'block';

        try {
            // Enviar uma solicitação POST para atualizar o empréstimo
            const response = await fetch(`/api/pdf/finalizar/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Verificar se a resposta é bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro ao atualizar o empréstimo: ${response.statusText}`);
            }

            // Exibir mensagem de sucesso para o usuário
            M.toast({ html: 'Empréstimo finalizado e e-mail enviado com sucesso!', classes: 'green' });

            // Atualizar a lista de empréstimos após a finalização
            carregarEmprestimos(currentPage); // Supondo que você tenha uma variável currentPage para a página atual

        } catch (error) {
            console.error('Erro ao finalizar o empréstimo:', error);
            M.toast({ html: 'Erro ao finalizar o empréstimo. Veja o console para mais detalhes.', classes: 'red' });
        }finally {
            // Oculta o preloader
            document.getElementById('preloader').style.display = 'none';
        }
    }

    // Função para gerar e visualizar o PDF
    async function visualizarEImprimirPdf(event) {
        event.preventDefault();

        // Use `event.currentTarget` para garantir que você está pegando o atributo do elemento `<a>`
        const emprestimoId = event.currentTarget.getAttribute('data-id');
        console.log('ID do empréstimo:', emprestimoId);

        if (!emprestimoId) {
            console.error('ID do empréstimo não fornecido');
            return;
        }

        try {
            // Verifique o URL da requisição
            const response = await fetch(`/api/pdf/pdf/${emprestimoId}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                window.URL.revokeObjectURL(url); // Libere a URL quando não precisar mais
            } else {
                console.error('Erro ao gerar o PDF:', response.statusText);
                // Opcional: Exibir mensagem para o usuário
                alert('Erro ao gerar o PDF. Tente novamente mais tarde.');
            }
        } catch (error) {
            console.error('Erro ao fazer a solicitação:', error);
            // Opcional: Exibir mensagem para o usuário
            alert('Erro ao processar a solicitação. Tente novamente mais tarde.');
        }
    }

    // Função para enviar e-mail com os livros
    async function enviarEmail(event) {
        event.preventDefault(); // Impede o comportamento padrão do link

        // Obtém o ID do empréstimo a partir do atributo data-id do botão
        const emprestimoId = event.currentTarget.getAttribute('data-id');
        console.log('ID do empréstimo:', emprestimoId);

        // Confirmação antes de enviar o e-mail
        const confirmacao = confirm('Você tem certeza que deseja enviar o e-mail?');
        if (!confirmacao) {
            // Se o usuário cancelar, não faz nada
            return;
        }

        // Exibe o preloader
        document.getElementById('preloader').style.display = 'block';

        try {
            // Envia uma solicitação POST para a rota de envio de e-mail
            const response = await fetch(`/api/pdf/enviar-email/${emprestimoId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Log da resposta para depuração
            console.log('Resposta do servidor:', response);

            // Verifica se a resposta é bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
            }

            // Determina o tipo de resposta e processa conforme o tipo
            const contentType = response.headers.get('Content-Type');
            let result;
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
                console.log('Resultado do envio de e-mail (JSON):', result);
            } else {
                result = await response.text();
                console.log('Resultado do envio de e-mail (Texto):', result);
            }

            // Exibe uma mensagem de sucesso para o usuário
            M.toast({ html: 'E-mail enviado com sucesso!', classes: 'green' });
        } catch (error) {
            // Exibe uma mensagem de erro para o usuário
            console.error('Erro ao enviar e-mail:', error);
            M.toast({ html: 'Erro ao enviar e-mail. Veja o console para mais detalhes.', classes: 'red' });
        } finally {
            // Oculta o preloader
            document.getElementById('preloader').style.display = 'none';
        }
    }

    function updatePaginationControls(totalPages) {
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = '';

        // Adiciona botão "Anterior" se não estiver na primeira página
        const prevButton = document.createElement('li');
        prevButton.className = 'page-item';
        if (currentPage === 1) {
            prevButton.classList.add('disabled');
        }
        const prevLink = document.createElement('a');
        prevLink.className = 'page-link';
        prevLink.href = '#';
        prevLink.textContent = '‹'; // Símbolo de seta para a esquerda
        prevLink.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                carregarEmprestimos(currentPage, document.getElementById('status-filter').value);
            }
        });
        prevButton.appendChild(prevLink);
        paginationControls.appendChild(prevButton);

        // Adiciona botões de página
        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = 'page-item';
            if (i === currentPage) {
                pageItem.classList.add('active');
            }

            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.addEventListener('click', () => {
                currentPage = i;
                carregarEmprestimos(currentPage, document.getElementById('status-filter').value);
            });

            pageItem.appendChild(pageLink);
            paginationControls.appendChild(pageItem);
        }

        // Adiciona botão "Próximo" se não estiver na última página
        const nextButton = document.createElement('li');
        nextButton.className = 'page-item';
        if (currentPage === totalPages) {
            nextButton.classList.add('disabled');
        }
        const nextLink = document.createElement('a');
        nextLink.className = 'page-link';
        nextLink.href = '#';
        nextLink.textContent = '›'; // Símbolo de seta para a direita
        nextLink.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                carregarEmprestimos(currentPage, document.getElementById('status-filter').value);
            }
        });
        nextButton.appendChild(nextLink);
        paginationControls.appendChild(nextButton);
    }

    function formatarData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}-${mes}-${ano}`;
    }

    //carregarEmprestimos(currentPage);
    carregarEmprestimos(currentPage, 'todos');

    // Função para buscar empréstimos pelo ID
    // Função de debounce
    function debounce(func, delay) {
        let timerId;
        return function (...args) {
            if (timerId) {
                clearTimeout(timerId);
            }
            timerId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    function buscarEmprestimosPorId(id) {
        console.log(`Buscando empréstimos para o ID: ${id}`);

        fetch(`/api/emprestimos/buscar/${encodeURIComponent(id)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao buscar empréstimos: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dados recebidos da API:', data);

                // Verifique se o empréstimo foi encontrado
                if (data.message === 'Empréstimo não encontrado') {
                    document.getElementById('emprestimos-table-body').innerHTML = '<tr><td colspan="6">Empréstimo não encontrado.</td></tr>';
                    M.toast({ html: 'Empréstimo não encontrado.', classes: 'orange' });
                    return;
                }

                // Verifique se os dados recebidos são válidos
                if (!data || !data.id) {
                    document.getElementById('emprestimos-table-body').innerHTML = '<tr><td colspan="6">Dados inválidos recebidos da API.</td></tr>';
                    M.toast({ html: 'Dados inválidos recebidos da API.', classes: 'red' });
                    return;
                }

                // Formata a data (descomente se a função formatarData estiver disponível)
                // const dataFormatada = formatarData(data.data_solicitacao);

                const emprestimosTableBody = document.getElementById('emprestimos-table-body');
                emprestimosTableBody.innerHTML = '';

                // Cria a linha da tabela
                const row = `
                    <tr>
                        <td>${data.id}</td>
                        <td>${data.nomeAluno}</td>
                        <td>${data.loja}</td>
                        <td>${data.data_solicitacao}</td>
                        <td>${data.situacao}</td>
                        <td>
                            <a href="#" class="btn-view-emprestimo" data-id="${data.id}"><i class="material-icons">visibility</i></a>
                            <a href="#" class="btn-edit-emprestimo ${data.situacao === 'finalizado' ? 'disabled' : ''}" data-id="${data.id}"><i class="material-icons">edit</i></a>
                            <a href="#" class="btn-delete-emprestimo ${data.situacao === 'finalizado' ? 'disabled' : ''}" data-id="${data.id}"><i class="material-icons">delete</i></a>
                            <a href="#" class="btn-finish-emprestimo ${data.situacao === 'finalizado' ? 'disabled' : ''}" data-id="${data.id}"><i class="material-icons">check_circle</i></a>
                            <a href="#" class="btn-print-emprestimo" data-id="${data.id}"><i class="material-icons">print</i></a>
                            <a href="#" class="btn-send-email ${data.situacao === 'finalizado' ? 'disabled' : ''}" data-id="${data.id}"><i class="material-icons">email</i></a>
                        </td>
                    </tr>
                `;
                emprestimosTableBody.innerHTML += row;

                // Inicialização dos selects, se houver algum na tabela
                M.FormSelect.init(document.querySelectorAll('select'));

                // Adicionar eventos aos botões
                document.querySelectorAll('.btn-view-emprestimo').forEach(button => {
                    button.addEventListener('click', visualizarEmprestimo);
                });

                document.querySelectorAll('.btn-edit-emprestimo').forEach(button => {
                    button.addEventListener('click', editarEmprestimo);
                });

                document.querySelectorAll('.btn-delete-emprestimo').forEach(button => {
                    button.addEventListener('click', abrirModalConfirmacaoExclusao);
                });

                document.querySelectorAll('.btn-finish-emprestimo').forEach(button => {
                    button.addEventListener('click', finalizarEmprestimo);
                });

                document.querySelectorAll('.btn-print-emprestimo').forEach(button => {
                    button.addEventListener('click', visualizarEImprimirPdf);
                });

                document.querySelectorAll('.btn-send-email').forEach(button => {
                    button.addEventListener('click', enviarEmail);
                });
            })
            .catch(error => {
                console.error('Erro ao buscar empréstimos:', error);
                // Verifica se a mensagem de erro é sobre o empréstimo não encontrado
                if (error.message.includes('404')) {
                    document.getElementById('emprestimos-table-body').innerHTML = '<tr><td colspan="6">Empréstimo não encontrado.</td></tr>';
                    M.toast({ html: 'Empréstimo não encontrado.', classes: 'orange' });
                } else {
                    document.getElementById('emprestimos-table-body').innerHTML = '<tr><td colspan="6">Erro ao buscar empréstimos.</td></tr>';
                    M.toast({ html: 'Erro ao buscar empréstimos.', classes: 'red' });
                }
            });
    }

    // Crie a função debounce para a busca
    const buscarEmprestimosDebounced = debounce(function () {
        const searchTerm = document.getElementById('search').value.trim();
        const searchId = parseInt(searchTerm, 10); // Converte o termo de busca para número

        if (searchTerm === '') {
            carregarEmprestimos(currentPage, 'todos');// Busca todos os empréstimos se o campo estiver vazio
        } else if (!isNaN(searchId)) {
            buscarEmprestimosPorId(searchId);
        } else {
            console.warn('O valor de busca não é um ID válido.');
            M.toast({ html: 'O valor de busca não é um ID válido.', classes: 'orange' });
        }
    }, 100); // Ajuste o delay conforme necessário

    // Evento para o campo de busca
    document.getElementById('search').addEventListener('input', buscarEmprestimosDebounced);

    // Função para enviar mensagem no WhatsApp com os livros
    async function enviarWhatsApp(event) {
        event.preventDefault(); // Impede o comportamento padrão do link ou botão

        // Obtém o ID do empréstimo a partir do atributo data-id do botão
        const emprestimoId = event.currentTarget.getAttribute('data-id');
        console.log('ID do empréstimo:', emprestimoId);

        // Confirmação antes de enviar a mensagem no WhatsApp
        const confirmacao = confirm('Você tem certeza que deseja enviar a mensagem no WhatsApp?');
        if (!confirmacao) {
            // Se o usuário cancelar, encerra a função
            return;
        }

        // Exibe o preloader (indicador de carregamento)
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.style.display = 'block';

        try {
            // Envia uma solicitação POST para a rota de envio de mensagem no WhatsApp
            const response = await fetch(`/api/pdf/enviar-whatsapp/${emprestimoId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Verifica se a resposta é bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }

            // Determina o tipo de resposta e processa o resultado
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                console.log('Resultado do envio de mensagem no WhatsApp (JSON):', result);

                // Redireciona para o WhatsApp em uma nova aba
                if (result.link) {
                    window.open(result.link, '_blank');
                } else {
                    throw new Error('Link do WhatsApp não encontrado na resposta.');
                }
            } else {
                const result = await response.text();
                console.log('Resultado do envio de mensagem no WhatsApp (Texto):', result);
                throw new Error('Resposta inesperada do servidor. Verifique o formato.');
            }

            // Exibe uma mensagem de sucesso para o usuário
            M.toast({ html: 'Mensagem enviada no WhatsApp com sucesso!', classes: 'green' });
        } catch (error) {
            // Loga o erro no console e exibe uma mensagem de erro ao usuário
            console.error('Erro ao enviar mensagem no WhatsApp:', error);
            M.toast({ html: 'Erro ao enviar mensagem no WhatsApp. Veja o console para mais detalhes.', classes: 'red' });
        } finally {
            // Oculta o preloader
            if (preloader) preloader.style.display = 'none';
        }
    }

    function normalizarTexto(texto) {
        return texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Função para carregar dados para o autocomplete
    function carregarLivros() {
        fetch('/api/livros/auto-livros')
            .then(response => response.json())
            .then(data => {
                const autocompleteData = {};
                const mapaTitulosParaIds = {};

                data.forEach(livro => {
                    autocompleteData[livro.titulo] = null;
                    const chaveNormalizada = normalizarTexto(livro.titulo);
                    mapaTitulosParaIds[chaveNormalizada] = livro.id;
                });

                const autocompleteElems = document.querySelectorAll('.autocomplete');

                M.Autocomplete.init(autocompleteElems, {
                    data: autocompleteData,
                    onAutocomplete: function (tituloSelecionado) {
                        const chaveSelecionada = normalizarTexto(tituloSelecionado);
                        const idSelecionado = mapaTitulosParaIds[chaveSelecionada];

                        if (idSelecionado) {
                            document.getElementById('livro-id-selecionado').value = idSelecionado;
                            console.log(`📌 Livro selecionado: ${tituloSelecionado}, ID: ${idSelecionado}`);
                        } else {
                            console.warn(`⚠️ Título não encontrado no mapa: ${tituloSelecionado}`);
                            document.getElementById('livro-id-selecionado').value = '';
                        }
                    }
                });
            })
            .catch(error => {
                console.error('❌ Erro ao carregar dados para autocomplete:', error);
            });
    }

    // Função para adicionar livro à tabela
    document.getElementById('add-to-table-fab').addEventListener('click', function () {
        const livroId = document.getElementById('livro-id-selecionado').value;

        if (livroId) {
            fetch(`/api/livros/livro/id/${encodeURIComponent(livroId)}`) // ✅ Busca pelo ID
                .then(response => {
                    if (!response.ok) throw new Error('Livro não encontrado');
                    return response.json();
                })
                .then(livro => {
                    if (livro.Estoque && livro.Estoque.estoque_disponivel <= 0) {
                        M.toast({ html: `O livro "${livro.titulo}" está fora de estoque.`, classes: 'red' });
                        limparCamposLivro();
                        return;
                    }

                    const livrosTableBody = document.getElementById('livros-table-body');
                    const existingRow = Array.from(livrosTableBody.querySelectorAll('tr'))
                        .find(row => row.dataset.id === livro.id.toString());

                    if (existingRow) {
                        M.toast({ html: `O livro "${livro.titulo}" já foi adicionado.`, classes: 'red' });
                        limparCamposLivro();
                        return;
                    }

                    const newRow = document.createElement('tr');
                    newRow.dataset.id = livro.id;
                    newRow.innerHTML = `
                        <td>${livro.id}</td>
                        <td>${livro.titulo}</td>
                        <td>${livro.autor}</td>
                        <td>${livro.genero}</td>
                        <td><a href="#" class="btn-delete-livro" data-id="${livro.id}" data-titulo="${livro.titulo}">
                            <i class="material-icons">delete</i></a></td>
                    `;

                    livrosTableBody.appendChild(newRow);
                    limparCamposLivro();
                    atualizarEventosDeExcluir();
                })
                .catch(error => {
                    console.error('❌ Erro ao buscar o livro:', error);
                    M.toast({ html: 'Erro ao adicionar o livro. Verifique se a seleção está correta.', classes: 'red' });
                });
        } else {
            M.toast({ html: 'Selecione um livro válido para adicionar', classes: 'orange' });
        }
    });

    // Função para limpar os campos do livro
    function limparCamposLivro() {
        document.getElementById('autocomplete-input').value = '';
        document.getElementById('livro-id-selecionado').value = '';
        M.updateTextFields();
    }
    
});
