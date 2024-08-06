document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('register-form');

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const response = await fetch('/api/usuarios/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });

    const result = await response.json();

    if (response.ok) {
      M.toast({html: 'Registro realizado com sucesso!'});
      // Redirecionar para a página de login
      window.location.href = '/login.html';
    } else {
      M.toast({html: result.error});
    }
  });
});
