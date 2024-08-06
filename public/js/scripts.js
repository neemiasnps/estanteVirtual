document.addEventListener('DOMContentLoaded', function() {

    var isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Verificar o estado de login

    // Inicialização dos modais
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    // Inicialização do Sidenav
    var elems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(elems);

    var elemsDropdown = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(elemsDropdown);

    // Event listener para abrir o modal de login
    var loginLink = document.getElementById('modal-login-link');
    if (loginLink) {
        loginLink.addEventListener('click', function(event) {
            event.preventDefault();
            var modal = document.getElementById('modal-login');
            var instance = M.Modal.getInstance(modal);
            if (instance) {
                instance.open();
            }
        });
    }

    // Event listener para abrir o modal de login em mobile
    var loginLinkMobile = document.getElementById('modal-login-link-mobile');
    if (loginLinkMobile) {
        loginLinkMobile.addEventListener('click', function(event) {
            event.preventDefault();
            var modal = document.getElementById('modal-login');
            var instance = M.Modal.getInstance(modal);
            if (instance) {
                instance.open();
            }
        });
    }

    // Event listener para submit do formulário de login
    var formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/usuarios/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, senha: password })
                });

                const result = await response.json();

                if (response.ok) {
                    // Salvar estado de login no localStorage
                    localStorage.setItem('isLoggedIn', 'true');
                    // Mostrar opções do menu após login
                    showLoggedInMenu();

                    // Fechar o modal
                    var modalLogin = document.getElementById('modal-login');
                    var modalInstance = M.Modal.getInstance(modalLogin);
                    if (modalInstance) {
                        modalInstance.close();
                    } else {
                        console.error('Instância do modal não encontrada.');
                    }
                } else {
                    alert(result.error || 'Usuário ou senha inválidos.');
                }
            } catch (error) {
                console.error('Erro ao realizar login:', error);
                alert('Erro ao realizar login. Tente novamente.');
            }
        });
    }



    // Event listener para logout (desktop)
    var logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            // Simular logout e limpar estado de login no localStorage
            localStorage.setItem('isLoggedIn', 'false');
            hideLoggedInMenu();
            window.location.href = '/';
        });
    }

    // Event listener para logout (mobile)
    var logoutLinkMobile = document.getElementById('logout-link-mobile');
    if (logoutLinkMobile) {
        logoutLinkMobile.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.setItem('isLoggedIn', 'false');
            hideLoggedInMenu();
            //res.redirect('/');
            window.location.href = '/';
        });
    }

    // Mostrar ou esconder o menu com base no estado de login
    if (isLoggedIn) {
        showLoggedInMenu();
    } else {
        hideLoggedInMenu();
    }

    // Função para mostrar opções do menu após login
    function showLoggedInMenu() {
        isLoggedIn = true; // Atualiza o estado de login
        localStorage.setItem('isLoggedIn', 'true');

        // Desktop
        document.getElementById('menu-dropdown-container').style.display = 'block';
        document.getElementById('logout-link-container').style.display = 'block';
        document.getElementById('login-link-container').style.display = 'none';

        // Mobile
        document.getElementById('logout-link-mobile').style.display = 'block';
        document.getElementById('login-link-container-mobile').style.display = 'none';
        
        // Mostrar itens de menu após login
        document.querySelectorAll('.menu-item').forEach(item => {
            item.style.display = 'block'; // Ajustar se necessário
        });
        
    }

    // Função para esconder opções do menu após logout
    function hideLoggedInMenu() {
        isLoggedIn = false; // Atualiza o estado de login
        localStorage.setItem('isLoggedIn', 'false');

        // Desktop
        document.getElementById('menu-dropdown-container').style.display = 'none';
        document.getElementById('logout-link-container').style.display = 'none';
        document.getElementById('login-link-container').style.display = 'block';

        // Mobile
        document.getElementById('logout-link-mobile').style.display = 'none';
        document.getElementById('login-link-container-mobile').style.display = 'block';

        // Esconder itens de menu após logout
        document.querySelectorAll('.menu-item').forEach(item => {
            item.style.display = 'none'; // Ajustar se necessário
        });
            }

    
});
