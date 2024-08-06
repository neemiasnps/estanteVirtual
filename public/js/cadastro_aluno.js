document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);

    var form = document.getElementById('cadastro-livro-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Coletar os dados do formulário
        var titulo = document.getElementById('titulo').value;
        var autor = document.getElementById('autor').value;
        var genero = document.getElementById('genero').value;
        var anoPublicacao = document.getElementById('ano_publicacao').value;
        var editora = document.getElementById('editora').value;
        var gentileza = document.getElementById('gentileza').value;
        var sinopse = document.getElementById('sinopse').value;
        var foto = document.getElementById('foto').value;

        // Construir o objeto livro
        var livro = {
            titulo: titulo,
            autor: autor,
            genero: genero,
            ano_publicacao: anoPublicacao,
            editora: editora,
            gentileza: gentileza,
            sinopse: sinopse,
            foto: foto
        };

        // Enviar os dados para o servidor (Node.js + MySQL)
        fetch('/api/livros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(livro)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Livro cadastrado com sucesso!');
                // Limpar o formulário após o cadastro (opcional)
                form.reset();
            } else {
                alert('Erro ao cadastrar livro: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao cadastrar livro:', error);
            alert('Erro ao cadastrar livro. Verifique o console para mais detalhes.');
        });
    });
});
