document.addEventListener('DOMContentLoaded', function() {

   //carregarLivros(1);
    
    // Inicialização dos modais
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals, {
        preventScrolling: true, // Evitar scroll da página ao abrir o modal
        dismissible: false // Impedir fechar clicando fora do modal
    });

    // Inicialização dos selects
    var selects = document.querySelectorAll('select');
    M.FormSelect.init(selects);
    
    // Variáveis para controle da paginação
    let currentPage = 1; // Página atual
    const booksPerPage = 10; // Número de livros por página
    let totalPages = 0; // Total de páginas

    // Evento para abrir o modal
    document.querySelector('.modal-trigger').addEventListener('click', function() {
        carregarGeneros(); // Carrega os gêneros quando o modal é aberto
        //editGeneros();
    });

    // Evento para quando o gênero for alterado
    const generoSelect = document.getElementById('genero');
    generoSelect.addEventListener('change', function () {
        const generoId = generoSelect.value;
        carregarSubgeneros(generoId); // Carrega os subgêneros do gênero selecionado
    });

    // Função para carregar livros e preencher a tabela com paginação
    function carregarLivros(page) {
        fetch(`/api/livros?page=${page}&limit=${booksPerPage}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar livros: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (!data || !data.livros || !Array.isArray(data.livros)) {
                    throw new Error('Dados inválidos recebidos da API');
                }

                const { livros, totalPages: total } = data;
                totalPages = total; // Atualizar a variável totalPages

                console.log('Resposta da API:', livros);

                var livrosTableBody = document.getElementById('livros-table-body');
                livrosTableBody.innerHTML = '';

                if (livros.length > 0) {
                    livros.forEach(function(livro) {
                        var row = `
                            <tr>
                                <td>${livro.id}</td>
                                <td>${livro.titulo}</td>
                                <td>${livro.autor}</td>
                                <td>${livro.genero}</td>
                                <td>${livro.situacao}</td>
                                <td>
                                    <a href="#" class="btn-edit-livro" data-id="${livro.id}"><i class="material-icons">edit</i></a>
                                    <a href="#" class="btn-delete-livro" data-id="${livro.id}" data-titulo="${livro.titulo}"><i class="material-icons">delete</i></a>
                                    <a href="#" class="btn-storage-livro" data-id="${livro.id}" data-nome="${livro.titulo}"><i class="material-icons">storage</i></a>
                                </td>
                            </tr>
                        `;
                        livrosTableBody.innerHTML += row;
                    });
                } else {
                    livrosTableBody.innerHTML = '<tr><td colspan="6">Nenhum livro encontrado.</td></tr>';
                }

                // Reinitialize selects after updating the DOM
                M.FormSelect.init(document.querySelectorAll('select'));

                // Adicionar event listeners para os botões de editar e deletar
                var editButtons = document.querySelectorAll('.btn-edit-livro');
                editButtons.forEach(function(button) {
                    button.removeEventListener('click', abrirModalEditarLivro); // Remover listener anterior
                    button.addEventListener('click', function(event) {
                        event.preventDefault();
                        abrirModalEditarLivro(button.getAttribute('data-id'));
                    });
                });

                var deleteButtons = document.querySelectorAll('.btn-delete-livro');
                deleteButtons.forEach(function(button) {
                    button.removeEventListener('click', deletarLivro); // Remover listener anterior
                    button.addEventListener('click', deletarLivro);
                });

                var buttonsStorage = document.querySelectorAll('.btn-storage-livro');
                buttonsStorage.forEach(function(button) {
                    button.addEventListener('click', function(event) {
                        event.preventDefault();
                        var idLivro = button.getAttribute('data-id');
                        var nomeLivro = button.getAttribute('data-nome');
                        abrirModalEstoqueLivro(idLivro, nomeLivro);
                    });
                });

                // Atualizar controles de paginação
                updatePaginationControls(totalPages);
            })
            .catch(error => {
                console.error('Erro ao buscar livros:', error);
                M.toast({ html: 'Erro ao buscar livros.', classes: 'red' });
            });
    }

    // Função para atualizar os controles de paginação
    function updatePaginationControls(totalPages) {
        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = '';

        const maxVisiblePages = 10; // Número máximo de páginas visíveis

        // Determinar o intervalo de páginas visíveis
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Criar botão "Anterior"
        const prevButton = document.createElement('li');
        prevButton.className = 'waves-effect';
        prevButton.innerHTML = `<a href="#!" onclick="loadPage(${currentPage - 1})"><i class="material-icons">chevron_left</i></a>`;
        if (currentPage === 1) {
            prevButton.classList.add('disabled');
        }
        paginationControls.appendChild(prevButton);

        // Ajustar intervalo se atingir o limite superior
        let adjustedStartPage = startPage;
        let adjustedEndPage = endPage;
        if (endPage - startPage < maxVisiblePages - 1) {
            adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Criar botões para páginas dentro do intervalo ajustado
        for (let i = adjustedStartPage; i <= adjustedEndPage; i++) {
            const pageButton = document.createElement('li');
            pageButton.className = 'waves-effect';
            pageButton.innerHTML = `<a href="#!" onclick="loadPage(${i})">${i}</a>`;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            paginationControls.appendChild(pageButton);
        }

        // Criar botão "Próximo"
        const nextButton = document.createElement('li');
        nextButton.className = 'waves-effect';
        nextButton.innerHTML = `<a href="#!" onclick="loadPage(${currentPage + 1})"><i class="material-icons">chevron_right</i></a>`;
        if (currentPage === totalPages) {
            nextButton.classList.add('disabled');
        }
        paginationControls.appendChild(nextButton);

        // Atualizar event listeners após atualizar os botões
        updateEventListeners();
    }

    // Função para atualizar event listeners dos botões de página
    function updateEventListeners() {
        const pageButtons = document.querySelectorAll('#pagination-controls a');
        pageButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault(); // Evitar comportamento padrão do link
                const page = parseInt(button.innerText); // Obter número da página do texto do botão
                loadPage(page); // Carregar a página correspondente
            });
        });
    }

    // Função para carregar uma página específica
    function loadPage(page) {
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        carregarLivros(page);
        markActivePage(currentPage); // Marcar a página ativa após carregar os livros
    }

    // Função para marcar a página ativa nos botões de paginação
    function markActivePage(activePage) {
        const pageButtons = document.querySelectorAll('#pagination-controls li');
        pageButtons.forEach(button => {
            const buttonPage = parseInt(button.textContent);
            if (buttonPage === activePage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Carregar a primeira página inicialmente
    //document.addEventListener('DOMContentLoaded', function() {
        carregarLivros(currentPage);
    //});

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

    //Função abrir modal de estoque
    function abrirModalEstoqueLivro(idLivro, nomeLivro) {
        
        // Preencher dados no modal de estoque
        $('#estoque-id-livro').val(idLivro);
        $('#estoque-nome-livro').val(nomeLivro);
        $('#estoque-quantidade').val(''); // Limpar campo de quantidade

        // Habilitar o botão salvar
        $('#btn-salvar-estoque').prop('disabled', false);

        M.updateTextFields(); // Atualiza os campos de texto conforme o MaterializeCSS

        // Abrir o modal
        var instance = M.Modal.getInstance(document.getElementById('modal-estoque-livro'));
        instance.open();

        // Fetch para buscar estoque total do livro
        fetch(`/api/estoques/${idLivro}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar estoque do livro: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.estoque_total !== undefined) {
                    $('#estoque-quantidade').val(data.estoque_total); // Atualiza o campo no modal com o estoque total
                    M.updateTextFields(); // Atualiza os labels dos inputs
                } else {
                    console.error('Resposta inválida ao buscar estoque:', data);
                    alert('Erro ao buscar estoque do livro.');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar estoque:', error);
                alert('Erro ao buscar estoque do livro.');
            });
    }

    // Função para atualizar o estoque
    async function atualizarEstoque() {
        const livro_id = document.getElementById('estoque-id-livro').value;
        const quantidade = document.getElementById('estoque-quantidade').value;

        try {
            const response = await fetch('/api/estoques/atualizar-estoque', { // Verifique se o prefixo está correto
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ livro_id, quantidade })
            });

            const result = await response.json();

            // Verifica se a resposta contém a chave 'success'
            if (result.success) {
                M.toast({ html: 'Estoque atualizado com sucesso.', classes: 'green' });
                const instance = M.Modal.getInstance(document.getElementById('modal-estoque-livro'));
                instance.close();
                carregarLivros(); // Atualizar a lista de livros
            } else {
                M.toast({ html: 'Erro ao atualizar o estoque.', classes: 'red' });
            }
        } catch (error) {
            console.error('Erro ao atualizar o estoque:', error);
            M.toast({ html: 'Erro ao atualizar o estoque.', classes: 'red' });
        }
    }

    // Vincular a função de atualização ao botão de salvar
    document.getElementById('btn-salvar-estoque').addEventListener('click', atualizarEstoque);

    // Função para abrir modal de edição de livro
    function abrirModalEditarLivro(idLivro) {
        // Exemplo de como você pode buscar os detalhes do livro com o ID `idLivro` do backend
        fetch(`/api/livros/${idLivro}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar detalhes do livro: ' + response.status);
                }
                return response.json();
            })
            .then(livro => {
                console.log(livro.genero); // Verifique o valor do gênero
                console.log(livro.subgenero); // Verifique o valor do subgênero

                editGeneros();

                // Evento para quando o gênero for alterado
                const generoEdit = document.getElementById('edit-genero');
                generoEdit.addEventListener('change', function () {
                    const generoId = generoEdit.value;
                    editSubgeneros(generoId); // Carrega os subgêneros do gênero selecionado
                });
                
                $('#edit-id-livro').val(livro.id);
                $('#edit-titulo').val(livro.titulo);
                $('#edit-autor').val(livro.autor);
                $('#edit-genero').val(livro.genero);
                $('#edit-subgenero').val(livro.subgenero);
                $('#edit-ano_publicacao').val(livro.anoPublicacao);
                $('#edit-editora').val(livro.editora);
                $('#edit-sinopse').val(livro.sinopse);
                $('#edit-foto').val(livro.foto);
                $('#edit-gentileza').val(livro.gentileza);
                $('#edit-switch-situacao').prop('checked', livro.situacao === 'Disponível');

                // Atualizar os labels dos inputs
                M.updateTextFields();

                var instance = M.Modal.getInstance(document.getElementById('modal-edit-livro'));
                instance.open();

            })
            .catch(error => {
                console.error('Erro ao buscar detalhes do livro:', error);
            });
    }

    // Event listener para o submit do formulário de editar livro
    var formEditLivro = document.getElementById('form-edit-livro');
    if (formEditLivro) {
        formEditLivro.addEventListener('submit', function(event) {
            event.preventDefault();
            editarLivro();
        });
    }

    // Função para editar um livro
    function editarLivro() {
        const idLivro = document.getElementById('edit-id-livro').value;
        const titulo = document.getElementById('edit-titulo').value;
        const autor = document.getElementById('edit-autor').value;
        const genero = document.getElementById('edit-genero').value;
        const subgenero = document.getElementById('edit-subgenero').value;
        const anoPublicacao = document.getElementById('edit-ano_publicacao').value;
        const editora = document.getElementById('edit-editora').value;
        const sinopse = document.getElementById('edit-sinopse').value;
        const foto = document.getElementById('edit-foto').value;
        const gentileza = document.getElementById('edit-gentileza').value;
        const situacao = document.getElementById('edit-switch-situacao').checked ? 'Disponível' : 'Indisponível';

        fetch(`/api/livros/${idLivro}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, autor, genero, subgenero, anoPublicacao, editora, sinopse, foto, gentileza, situacao })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao editar livro: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            M.Modal.getInstance(document.getElementById('modal-edit-livro')).close();
            M.toast({ html: 'Livro editado com sucesso!', classes: 'green' });
            carregarLivros();
        })
        .catch(error => {
            console.error('Erro ao editar livro:', error);
            M.toast({ html: 'Erro ao editar livro. Verifique o console para mais detalhes.', classes: 'red' });
        });
    }

    // Função para deletar ou inativar um livro
    function deletarLivro(event) {
        event.preventDefault();
        var id = this.getAttribute('data-id');
        var livroTitulo = this.getAttribute('data-titulo');

        if (confirm(`Tem certeza que deseja deletar o livro "${livroTitulo}"?`)) {
            fetch(`/api/livros/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao deletar livro: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                // Verifique se a mensagem retornada indica que o livro foi inativado
                if (data.message.includes('marcado como indisponível')) {
                    M.toast({ html: `Livro "${livroTitulo}" marcado como indisponível.`, classes: 'orange' });
                } else if (data.message.includes('excluído com sucesso')) {
                    M.toast({ html: `Livro "${livroTitulo}" deletado com sucesso!`, classes: 'green' });
                } else {
                    M.toast({ html: 'Ação desconhecida. Verifique o console para mais detalhes.', classes: 'red' });
                }
                carregarLivros();
            })
            .catch(error => {
                console.error('Erro ao deletar livro:', error);
                M.toast({ html: 'Erro ao deletar livro. Verifique o console para mais detalhes.', classes: 'red' });
            });
        } else {
            console.log('Ação de deletar cancelada pelo usuário.');
        }
    }

    // Event listener para o submit do formulário de adicionar livro
    var formAddLivro = document.getElementById('form-add-livro');
    if (formAddLivro) {
        formAddLivro.addEventListener('submit', function(event) {
            event.preventDefault();
            adicionarLivro();
        });
    }

    // Função para adicionar um livro
    function adicionarLivro() {
        var titulo = document.getElementById('titulo').value;
        var autor = document.getElementById('autor').value;
        var genero = document.getElementById('genero').value;
        var subgenero = document.getElementById('subgenero').value;
        var anoPublicacao = document.getElementById('ano_publicacao').value;
        var editora = document.getElementById('editora').value;
        var gentileza = document.getElementById('gentileza').value;
        var sinopse = document.getElementById('sinopse').value;
        var foto = document.getElementById('foto').value;
        var situacao = document.getElementById('switch-situacao').checked ? 'Disponível' : 'Indisponível';

        fetch('/api/livros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, autor, genero, subgenero, anoPublicacao, editora, gentileza, sinopse, foto, situacao })
        })
        .then(response => {
            console.log('Resposta do servidor:', response); // Adicionado para depuração
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos:', data); // Adicionado para depuração
            if (data.success) {
                M.toast({ html: 'Livro cadastrado com sucesso!', classes: 'green' });
                formAddLivro.reset();
                carregarLivros();
            } else {
                M.toast({ html: 'Erro ao cadastrar livro: ' + data.message, classes: 'red' });
            }
        })
        .catch(error => {
            console.error('Erro ao cadastrar livro:', error);
            M.toast({ html: 'Erro ao cadastrar livro. Verifique o console para mais detalhes.', classes: 'red' });
        });
    }

    // Função para buscar livros pelo título e atualizar a tabela
    function buscarLivrosPorTitulo(titulo) {
        fetch(`/api/livros/buscar-titulo/${encodeURIComponent(titulo)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na resposta da rede');
                }
                return response.json();
            })
            .then(livros => {
                var livrosTableBody = document.getElementById('livros-table-body');
                livrosTableBody.innerHTML = '';

                if (livros.length > 0) {
                    livros.forEach(function(livro) {
                        var row = `
                            <tr>
                                <td>${livro.id}</td>
                                <td>${livro.titulo}</td>
                                <td>${livro.autor}</td>
                                <td>${livro.genero}</td>
                                <td>${livro.situacao}</td>
                                <td>
                                    <a href="#" class="btn-edit-livro" data-id="${livro.id}"><i class="material-icons">edit</i></a>
                                    <a href="#" class="btn-delete-livro" data-id="${livro.id}" data-titulo="${livro.titulo}"><i class="material-icons">delete</i></a>
                                    <a href="#" class="btn-storage-livro" data-id="${livro.id}" data-nome="${livro.titulo}"><i class="material-icons">storage</i></a>
                                </td>
                            </tr>
                        `;
                        livrosTableBody.innerHTML += row;
                    });
                } else {
                    livrosTableBody.innerHTML = '<tr><td colspan="6">Nenhum livro encontrado.</td></tr>';
                }

                // Reinitialize selects after updating the DOM
                M.FormSelect.init(document.querySelectorAll('select'));

                // Adicionar event listeners para os botões de editar e deletar
                var editButtons = document.querySelectorAll('.btn-edit-livro');
                editButtons.forEach(function(button) {
                    button.removeEventListener('click', abrirModalEditarLivro); // Remover listener anterior
                    button.addEventListener('click', function(event) {
                        event.preventDefault();
                        abrirModalEditarLivro(button.getAttribute('data-id'));
                    });
                });

                var deleteButtons = document.querySelectorAll('.btn-delete-livro');
                deleteButtons.forEach(function(button) {
                    button.removeEventListener('click', deletarLivro); // Remover listener anterior
                    button.addEventListener('click', deletarLivro);
                });

                var buttonsStorage = document.querySelectorAll('.btn-storage-livro');
                buttonsStorage.forEach(function(button) {
                    button.addEventListener('click', function(event) {
                        event.preventDefault();
                        var idLivro = button.getAttribute('data-id');
                        var nomeLivro = button.getAttribute('data-nome');
                        abrirModalEstoqueLivro(idLivro, nomeLivro);
                    });
                });

                // Atualizar controles de paginação
                updatePaginationControls(totalPages);
            })
            .catch(error => {
                console.error('Erro ao buscar livros:', error);
                M.toast({ html: 'Erro ao buscar livros. Verifique o console para mais detalhes.', classes: 'red' });
            });
    }

    const searchInput = document.getElementById('search');

    // Adicionar um ouvinte de evento para o campo de busca
    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            buscarLivrosPorTitulo(query);
        } else {
            // Se o campo de busca estiver vazio, você pode optar por limpar a tabela ou não mostrar resultados
            //document.getElementById('livros-table-body').innerHTML = '<tr><td colspan="6">Digite um título para buscar.</td></tr>';
            carregarLivros(currentPage);
        }
    });
    
    // Função para carregar os gêneros do banco de dados
    function carregarGeneros() {
        console.log('Chamando a API de Gêneros:', '/api/livros/generos');
        fetch(`/api/generos/buscar-generos`)
            .then(response => {
                console.log('Resposta da API:', response);
                if (!response.ok) {
                    throw new Error(`Erro na API: ${response.statusText}`);
                }
                return response.json();
            })
            .then(generos => {
                console.log('Gêneros recebidos:', generos);
                if (!Array.isArray(generos)) {
                    throw new TypeError('A resposta da API não é uma lista.');
                }

                const generoSelect = document.getElementById('genero');
                generos.forEach(genero => {
                    const option = document.createElement('option');
                    option.value = genero.id;
                    option.textContent = genero.nome;
                    generoSelect.appendChild(option);
                });

                M.FormSelect.init(generoSelect); // Inicializa o Materialize Select
            })
            .catch(error => {
                console.error('Erro ao carregar gêneros:', error);
            });
    }

    // Função para carregar os subgêneros com base no gênero selecionado
    function carregarSubgeneros(generoId) {
        fetch(`/api/generos/subgeneros?genero_id=${generoId}`)
            .then(response => response.json())
            .then(subgeneros => {
                console.log('Resposta dos subgêneros:', subgeneros); // Verifica a resposta completa do servidor
                if (Array.isArray(subgeneros)) {
                    const subgeneroSelect = document.getElementById('subgenero');
                    subgeneroSelect.innerHTML = '<option value="" disabled selected>Escolha o subgênero</option>';

                    subgeneros.forEach(subgenero => {
                        const option = document.createElement('option');
                        option.value = subgenero.id;
                        option.textContent = subgenero.nome;
                        subgeneroSelect.appendChild(option);
                    });
                    M.FormSelect.init(subgeneroSelect);
                } else {
                    console.error('Esperado um array, mas recebido:', subgeneros);
                }
            })
            .catch(error => console.error('Erro ao carregar subgêneros:', error));
    }

    // Função para carregar os gêneros do banco de dados
    function editGeneros() {
        console.log('Chamando a API de Gêneros:', '/api/livros/generos');
        fetch(`/api/generos/buscar-generos`)
            .then(response => {
                console.log('Resposta da API:', response);
                if (!response.ok) {
                    throw new Error(`Erro na API: ${response.statusText}`);
                }
                return response.json();
            })
            .then(generos => {
                console.log('Gêneros recebidos:', generos);
                if (!Array.isArray(generos)) {
                    throw new TypeError('A resposta da API não é uma lista.');
                }

                const generoSelect = document.getElementById('edit-genero');
                generos.forEach(genero => {
                    const option = document.createElement('option');
                    option.value = genero.id;
                    option.textContent = genero.nome;
                    generoSelect.appendChild(option);
                });

                M.FormSelect.init(generoSelect); // Inicializa o Materialize Select
            })
            .catch(error => {
                console.error('Erro ao carregar gêneros:', error);
            });
    }

    // Função para carregar os subgêneros com base no gênero selecionado
    function editSubgeneros(generoId) {
        fetch(`/api/generos/subgeneros?genero_id=${generoId}`)
            .then(response => response.json())
            .then(subgeneros => {
                console.log('Resposta dos subgêneros:', subgeneros); // Verifica a resposta completa do servidor
                if (Array.isArray(subgeneros)) {
                    const subgeneroSelect = document.getElementById('edit-subgenero');
                    subgeneroSelect.innerHTML = '<option value="" disabled selected>Escolha o subgênero</option>';

                    subgeneros.forEach(subgenero => {
                        const option = document.createElement('option');
                        option.value = subgenero.id;
                        option.textContent = subgenero.nome;
                        subgeneroSelect.appendChild(option);
                    });
                    M.FormSelect.init(subgeneroSelect);
                } else {
                    console.error('Esperado um array, mas recebido:', subgeneros);
                }
            })
            .catch(error => console.error('Erro ao carregar subgêneros:', error));
    }

});
