// sign-in-page.js
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const loginForm = document.getElementById('loginForm');

    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    const event = urlParams.get('event');

    if (loginBtn && loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const login = document.getElementById('login').value;
            const password = document.getElementById('password').value;

            if (!login || !password) {
                authManager.showModal('Ошибка', 'Пожалуйста, заполните все поля', 'error');
                return;
            }

            // Показываем индикатор загрузки
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
            loginBtn.disabled = true;

            try {
                const result = authManager.login(login, password);

                if (result.success) {
                    authManager.showModal('Успех', 'Вход выполнен успешно!', 'success');

                    // Обновляем статус авторизации на всех страницах
                    if (typeof window.updateAuthStatus === 'function') {
                        window.updateAuthStatus();
                    }

                    // Редирект после успешного входа
                    setTimeout(() => {
                        if (redirect === 'event-registration') {
                            window.location.href = 'event-registration.html';
                        } else if (redirect === 'event-details') {
                            window.location.href = 'event-details.html';
                        } else {
                            window.location.href = 'LK.html';
                        }
                    }, 1500);
                } else {
                    authManager.showModal('Ошибка', result.message, 'error');
                    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
                    loginBtn.disabled = false;
                }
            } catch (error) {
                authManager.showModal('Ошибка', 'Произошла ошибка при входе', 'error');
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти';
                loginBtn.disabled = false;
            }
        });
    }


    // Проверяем, есть ли уже авторизованный пользователь
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        window.location.href = 'LK.html';
    }
});