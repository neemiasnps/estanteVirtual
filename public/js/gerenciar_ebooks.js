document.addEventListener('DOMContentLoaded', function() {

    // Inicializar Materialize
    //M.AutoInit();

    // Inicialização dos modais
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals, {
        preventScrolling: true, // Evitar scroll da página ao abrir o modal
        dismissible: true // Impedir fechar clicando fora do modal
    });

    // Inicialização dos selects
    var selects = document.querySelectorAll('select');
    M.FormSelect.init(selects);

    /*const modal = document.getElementById('modal-add-livro');
    const instance = M.Modal.init(modal);
    instance.open();*/

    // Evento para abrir o modal
    document.querySelector('.modal-trigger').addEventListener('click', function() {
        carregarGeneros(); // Carrega os gêneros quando o modal é aberto
    });

    // Evento para quando o gênero for alterado
    const generoSelect = document.getElementById('genero');
    generoSelect.addEventListener('change', function () {
        const generoId = generoSelect.value;
        carregarSubgeneros(generoId); // Carrega os subgêneros do gênero selecionado
    });

    
    // Variáveis para controle da paginação
    let currentPage = 1; // Página atual
    const booksPerPage = 10; // Número de livros por página
    let totalPages = 0; // Total de páginas

    // Função para carregar livros e preencher a tabela com paginação
    function carregarLivros(page) {
        fetch(`/api/ebooks?page=${page}&limit=${booksPerPage}`)
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

    // Função para abrir modal de edição de livro
    function abrirModalEditarLivro(idLivro) {
        // Exemplo de como você pode buscar os detalhes do livro com o ID `idLivro` do backend
        fetch(`/api/ebooks/${idLivro}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar detalhes do livro: ' + response.status);
                }
                return response.json();
            })
            .then(livro => {
                $('#edit-id-livro').val(livro.id);
                $('#edit-titulo').val(livro.titulo);
                $('#edit-autor').val(livro.autor);
                $('#edit-genero').val(livro.genero);
                $('#edit-subgenero').val(livro.subgenero);
                $('#edit-ano_publicacao').val(livro.anoPublicacao);
                $('#edit-editora').val(livro.editora);
                $('#edit-sinopse').val(livro.sinopse);
                $('#edit-foto').val(livro.foto);
                $('#edit-url').val(livro.url);
                $('#edit-switch-situacao').prop('checked', livro.situacao === 'Disponível');

                // Atualizar os labels dos inputs
                M.updateTextFields();

                var instance = M.Modal.getInstance(document.getElementById('modal-edit-livro'));
                instance.open();

                editGeneros();

                // Evento para quando o gênero for alterado
                const generoSelect = document.getElementById('edit-genero');
                generoSelect.addEventListener('change', function () {
                    const generoId = generoSelect.value;
                    editSubgeneros(generoId); // Carrega os subgêneros do gênero selecionado
                });
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
        //const genero = document.getElementById('edit-genero').value;
        //const subgenero = document.getElementById('edit-subgenero').value;
        var genero = document.getElementById('edit-genero').options[document.getElementById('edit-genero').selectedIndex].text;
        var subgenero = document.getElementById('edit-subgenero').options[document.getElementById('edit-subgenero').selectedIndex].text;
        const anoPublicacao = document.getElementById('edit-ano_publicacao').value;
        const editora = document.getElementById('edit-editora').value;
        const sinopse = document.getElementById('edit-sinopse').value;
        const foto = document.getElementById('edit-foto').value;
        const url = document.getElementById('edit-url').value;
        const situacao = document.getElementById('edit-switch-situacao').checked ? 'Disponível' : 'Indisponível';

        fetch(`/api/ebooks/${idLivro}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, autor, genero, subgenero, anoPublicacao, editora, sinopse, foto, url, situacao })
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
            fetch(`/api/ebooks/${id}`, {
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
        //var genero = document.getElementById('genero').value;
        //var subgenero = document.getElementById('subgenero').value;
        var genero = document.getElementById('genero').options[document.getElementById('genero').selectedIndex].text;
        var subgenero = document.getElementById('subgenero').options[document.getElementById('subgenero').selectedIndex].text;
        var anoPublicacao = document.getElementById('ano_publicacao').value;
        var editora = document.getElementById('editora').value;
        var url = document.getElementById('url').value;
        var sinopse = document.getElementById('sinopse').value;
        var foto = document.getElementById('foto').value;
        var situacao = document.getElementById('switch-situacao').checked ? 'Disponível' : 'Indisponível';

        fetch('/api/ebooks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo, autor, genero, subgenero, anoPublicacao, editora, url, sinopse, foto, situacao })
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
        fetch(`/api/ebooks/buscar-titulo/${encodeURIComponent(titulo)}`)
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
