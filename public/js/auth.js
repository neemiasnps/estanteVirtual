let sessionTimer = null;

// INIT
document.addEventListener('DOMContentLoaded', async () => {
  iniciarUI();
  await verificarSessao();
  bindEventos();
});

// --------------------
// UI
// --------------------
function iniciarUI() {
  M.Modal.init(document.querySelectorAll('.modal'));
  M.Sidenav.init(document.querySelectorAll('.sidenav'));
  M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {
    coverTrigger: false,
    constrainWidth: false
  });
}

// --------------------
// SESSÃO
// --------------------
async function verificarSessao() {
  const res = await fetch('/api/auth/status', {
    credentials: 'include'
  });

  const data = await res.json();

  if (data.autenticado) {
    ativarSessao();
  } else {
    desativarSessao();
  }
}

function ativarSessao() {
  showMenu();
  iniciarMonitorSessao();
}

function desativarSessao() {
  hideMenu();
  pararMonitorSessao();
}

// --------------------
// MONITORAMENTO
// --------------------
function iniciarMonitorSessao() {
  pararMonitorSessao();

  sessionTimer = setInterval(async () => {
    const res = await fetch('/api/auth/status', {
      credentials: 'include'
    });

    const data = await res.json();

    if (!data.autenticado) {
      encerrarSessao();
    }
  }, 60000); // 1 minuto
}

function pararMonitorSessao() {
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
}

function encerrarSessao() {
  desativarSessao();
  alert('Sessão encerrada por inatividade.');
  window.location.href = '/';
}

// --------------------
// EVENTOS
// --------------------
function bindEventos() {

  // ABRIR MODAL LOGIN
  document.querySelectorAll('#modal-login-link, #modal-login-link-mobile')
    .forEach(btn => {

      btn.addEventListener('click', (e) => {

        e.preventDefault();

        const modalEl = document.getElementById('modal-login');

        const instance = M.Modal.getInstance(modalEl);

        if (instance) {
          instance.open();
        }

      });

    });

  // LOGIN
  const form = document.getElementById('form-login');

  if (form) {

    form.addEventListener('submit', async (e) => {

      e.preventDefault();

      const email = document.getElementById('email').value.trim();

      const senha = document.getElementById('password').value.trim();

      if (!email || !senha) {

        M.toast({
          html: 'Informe e-mail e senha',
          classes: 'orange'
        });

        return;
      }

      try {

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ email, senha })
        });

        const data = await res.json();

        if (!res.ok) {

          M.toast({
            html: data.message || 'Erro ao realizar login',
            classes: 'red'
          });

          return;
        }

        // SUCESSO
        M.toast({
          html: data.message,
          classes: 'green'
        });

        // fecha modal
        const modalEl = document.getElementById('modal-login');

        const instance = M.Modal.getInstance(modalEl);

        if (instance) {
          instance.close();
        }

        // limpa campos
        form.reset();

        // ativa sessão sem reload
        ativarSessao();

      } catch (error) {

        console.error(error);

        M.toast({
          html: 'Erro ao conectar ao servidor',
          classes: 'red'
        });

      }

    });

  }

  // LOGOUT
  document.querySelectorAll('#logout-link, #logout-link-mobile')
    .forEach(btn => {

      btn.addEventListener('click', async (e) => {

        e.preventDefault();

        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });

        window.location.href = '/';

      });

    });

}

// --------------------
// MENU
// --------------------
function showMenu() {

  document.querySelectorAll('.admin-item').forEach(el => {
    el.classList.remove('hidden');
  });

  document.querySelectorAll('.login-item').forEach(el => {
    el.classList.add('hidden');
  });

}

function hideMenu() {

  document.querySelectorAll('.admin-item').forEach(el => {
    el.classList.add('hidden');
  });

  document.querySelectorAll('.login-item').forEach(el => {
    el.classList.remove('hidden');
  });

}