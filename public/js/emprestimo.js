document.getElementById('emprestimo-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const livro_id = document.getElementById('livro_id').value;
    const usuario_id = document.getElementById('usuario_id').value;

    fetch('/api/emprestimos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ livro_id, usuario_id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Empréstimo solicitado com sucesso');
            window.location.href = '/';
        } else {
            alert('Falha na solicitação de empréstimo: ' + data.message);
        }
    })
    .catch(error => console.error('Erro ao solicitar empréstimo:', error));
});
