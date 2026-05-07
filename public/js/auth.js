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

        //location.reload();
        window.location.href = '/';
      });
    });

});

// ======================
// CONTROLE DO MENU ADMIN
// ======================
function showMenu() {

  // DESKTOP
  const adminMenu = document.getElementById('admin-menu');
  const logout = document.getElementById('logout-link-container');
  const login = document.getElementById('login-link-container');

  // MOBILE
  const adminMobile1 = document.getElementById('admin-menu-mobile');
  const adminMobile2 = document.getElementById('admin-menu-mobile-2');
  const adminMobile3 = document.getElementById('admin-menu-mobile-3');
  const adminMobile4 = document.getElementById('admin-menu-mobile-4');
  const adminMobile5 = document.getElementById('admin-menu-mobile-5');
  const logoutMobile = document.getElementById('logout-link-mobile');
  const loginMobile = document.getElementById('login-link-container-mobile');

  if (adminMenu) adminMenu.style.display = 'block';
  if (logout) logout.style.display = 'block';
  if (login) login.style.display = 'none';

  if (adminMobile1) adminMobile1.style.display = 'block';
  if (adminMobile2) adminMobile2.style.display = 'block';
  if (adminMobile3) adminMobile3.style.display = 'block';
  if (adminMobile4) adminMobile4.style.display = 'block';
  if (adminMobile5) adminMobile5.style.display = 'block';

  if (logoutMobile) logoutMobile.style.display = 'block';
  if (loginMobile) loginMobile.style.display = 'none';
}

function hideMenu() {

  // DESKTOP
  const adminMenu = document.getElementById('admin-menu');
  const logout = document.getElementById('logout-link-container');
  const login = document.getElementById('login-link-container');

  // MOBILE
  const adminMobile1 = document.getElementById('admin-menu-mobile');
  const adminMobile2 = document.getElementById('admin-menu-mobile-2');
  const adminMobile3 = document.getElementById('admin-menu-mobile-3');
  const adminMobile4 = document.getElementById('admin-menu-mobile-4');
  const adminMobile5 = document.getElementById('admin-menu-mobile-5');
  const logoutMobile = document.getElementById('logout-link-mobile');
  const loginMobile = document.getElementById('login-link-container-mobile');

  if (adminMenu) adminMenu.style.display = 'none';
  if (logout) logout.style.display = 'none';
  if (login) login.style.display = 'block';

  if (adminMobile1) adminMobile1.style.display = 'none';
  if (adminMobile2) adminMobile2.style.display = 'none';
  if (adminMobile3) adminMobile3.style.display = 'none';
  if (adminMobile4) adminMobile4.style.display = 'none';
  if (adminMobile5) adminMobile5.style.display = 'none';

  if (logoutMobile) logoutMobile.style.display = 'none';
  if (loginMobile) loginMobile.style.display = 'block';
}