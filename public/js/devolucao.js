document.getElementById('devolucao-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const emprestimo_id = document.getElementById('emprestimo_id').value;

    fetch('/api/emprestimos/' + emprestimo_id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Livro devolvido com sucesso');
            window.location.href = '/';
        } else {
            alert('Falha na devolução do livro: ' + data.message);
        }
    })
    .catch(error => console.error('Erro ao devolver livro:', error));
});
