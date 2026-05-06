document.addEventListener('DOMContentLoaded', async () => {

  // INIT MATERIALIZE (seguro e completo)
  M.Modal.init(document.querySelectorAll('.modal'));
  M.Sidenav.init(document.querySelectorAll('.sidenav'));
  M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {
    coverTrigger: false,
    constrainWidth: false
  });

  // Verifica sessão no servidor
  const status = await fetch('/api/auth/status', {
    credentials: 'include'
  }).then(r => r.json());

  if (status.autenticado) {
    showMenu();
  } else {
    hideMenu();
  }

  // ABRIR MODAL LOGIN (desktop + mobile)
  document.querySelectorAll('#modal-login-link, #modal-login-link-mobile')
    .forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        const modalEl = document.getElementById('modal-login');
        const instance = M.Modal.getInstance(modalEl);

        if (instance) instance.open();
      });
    });

  // LOGIN
  const formLogin = document.getElementById('form-login');

  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const senha = document.getElementById('password').value;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
        credentials: 'include'
      });

      if (res.ok) {
        location.reload(); // garante sincronização correta do menu
      } else {
        alert('Usuário ou senha inválidos');
      }
    });
  }

  // LOGOUT (desktop + mobile)
  document.querySelectorAll('#logout-link, #logout-link-mobile, #logout-link-mobile-action')
    .forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();

        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });

        location.reload();
      });
    });

});

// ======================
// CONTROLE DO MENU ADMIN
// ======================
function showMenu() {
  const adminMenu = document.getElementById('admin-menu');
  const logout = document.getElementById('logout-link-container');
  const login = document.getElementById('login-link-container');

  if (adminMenu) adminMenu.style.display = 'block';
  if (logout) logout.style.display = 'block';
  if (login) login.style.display = 'none';
}

function hideMenu() {
  const adminMenu = document.getElementById('admin-menu');
  const logout = document.getElementById('logout-link-container');
  const login = document.getElementById('login-link-container');

  if (adminMenu) adminMenu.style.display = 'none';
  if (logout) logout.style.display = 'none';
  if (login) login.style.display = 'block';
}