document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-contato');

    if (form) { // Verifica se o formulário existe
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(form);
            const data = {
                nome: formData.get('nome'),
                email: formData.get('email'),
                celular: formData.get('celular'),
                mensagem: formData.get('mensagem')
            };

            fetch('/api/contato', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na resposta da rede');
                }
                return response.json();
            })
            .then(result => {
                console.log('Sucesso:', result);

                // Limpar o formulário
                form.reset();

                // Mostrar mensagem de sucesso
                M.toast({html: 'Mensagem enviada com sucesso!'});
            })
            .catch(error => {
                console.error('Erro:', error);

                // Mostrar mensagem de erro
                M.toast({html: 'Erro ao enviar mensagem.'});
            });
        });
    } else {
        console.error('Formulário não encontrado');
    }

    // Aplicar máscara ao campo de celular
    if (typeof $ !== 'undefined' && $.fn.mask) {
        $('#celular').mask('(00) 00000-0000');
    } else {
        console.error('jQuery Mask Plugin não está carregado');
    }
});
