document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const response = await fetch('/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const result = await response.json();

    if (response.ok) {
      M.toast({html: 'Login realizado com sucesso!'});
      // Redirecionar para a página inicial ou catálogo de livros
      window.location.href = '/';
    } else {
      M.toast({html: result.error});
    }
  });
});
