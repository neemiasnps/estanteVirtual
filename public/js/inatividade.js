let timer;

// Função para reiniciar o temporizador de inatividade
function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => {
        // Enviar uma solicitação para o servidor para encerrar a sessão
        fetch('/logout', { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/'; // Redirecionar para a página de login após o logout
                } else {
                    console.error('Erro ao encerrar sessão:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Erro de rede:', error);
            });
    }, 30 * 60 * 1000); // Tempo de inatividade: 30 minutos
}

// Inicializar o temporizador ao carregar a página
window.onload = resetTimer;

// Reiniciar o temporizador em diferentes eventos de interação
document.onmousemove = resetTimer;
document.onkeypress = resetTimer;

// Opcional: reiniciar o temporizador também em eventos de clique
document.addEventListener('click', resetTimer);