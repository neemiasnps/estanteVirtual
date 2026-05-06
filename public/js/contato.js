document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-contato');

    if (!form) return;

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const data = {
            nome: form.nome.value,
            email: form.email.value,
            celular: form.celular.value,
            mensagem: form.mensagem.value
        };

        try {
            const response = await fetch('/api/public/contato', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error();

            form.reset();
            M.toast({ html: 'Mensagem enviada com sucesso!' });

        } catch (error) {
            M.toast({ html: 'Erro ao enviar mensagem.' });
        }
    });

    if (typeof $ !== 'undefined' && $.fn.mask) {
        $('#celular').mask('(00) 00000-0000');
    }
});