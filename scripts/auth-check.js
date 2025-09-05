document.addEventListener('DOMContentLoaded', function() {
    // Функция для проверки авторизации и обновления кнопки
    function updateAuthButton() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const authButton = document.querySelector('.button a.black');

        if (!authButton) return;

        if (currentUser) {
            // Пользователь авторизован - меняем на "Личный кабинет"
            authButton.innerHTML = '<p>Личный кабинет</p>';
            authButton.href = 'LK.html';

            // Удаляем старую кнопку выхода если есть
            const oldLogoutBtn = document.getElementById('logoutBtn');
            if (oldLogoutBtn) {
                oldLogoutBtn.remove();
            }

            // Создаем кнопку выхода ТОЛЬКО на странице личного кабинета
            if (window.location.pathname.includes('LK.html') ||
                window.location.pathname.includes('izmenenieLK.html')) {

                const logoutBtn = document.createElement('div');
                logoutBtn.className = 'button';
                logoutBtn.id = 'logoutBtn';
                logoutBtn.innerHTML = '<a href="#" class="black"><p>Выйти</p></a>';

                // Вставляем кнопку выхода рядом с кнопкой ЛК
                authButton.parentNode.parentNode.appendChild(logoutBtn);

                // Добавляем обработчик для кнопки выхода
                document.getElementById('logoutBtn').addEventListener('click', function(e) {
                    e.preventDefault();
                    authManager.logout();
                    window.location.href = 'index.html'; // Перенаправляем на главную
                });
            }
        } else {
            // Пользователь не авторизован - стандартная кнопка
            authButton.innerHTML = '<p>Вход/регистрация</p>';
            authButton.href = 'reg-page.html';

            // Удаляем кнопку выхода если есть
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.remove();
            }
        }
    }

    // Проверяем авторизацию при загрузке страницы
    updateAuthButton();
});

// Глобальная функция для обновления статуса
window.updateAuthStatus = function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authButton = document.querySelector('.button a.black');

    if (!authButton) return;

    if (currentUser) {
        authButton.innerHTML = '<p>Личный кабинет</p>';
        authButton.href = 'LK.html';

        // Удаляем кнопку выхода если она есть не на странице ЛК
        if (!window.location.pathname.includes('LK.html') &&
            !window.location.pathname.includes('izmenenieLK.html')) {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.remove();
            }
        }
    } else {
        authButton.innerHTML = '<p>Вход/регистрация</p>';
        authButton.href = 'reg-page.html';

        // Удаляем кнопку выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.remove();
        }
    }
};