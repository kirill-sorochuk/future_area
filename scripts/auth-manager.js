// auth-manager.js
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUser();
    }

    loadUser() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = { ...user };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return { success: true, user: this.currentUser };
        }

        return { success: false, message: 'Неверный email или пароль' };
    }

    register(userData) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Проверяем, нет ли уже пользователя с таким email
        if (users.find(user => user.email === userData.email)) {
            return { success: false, message: "Пользователь с таким email уже существует" };
        }

        // Добавляем пользователя
        userData.id = Date.now().toString();
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));

        // Автоматически логиним пользователя после регистрации
        this.currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(userData));

        return { success: true, message: "Регистрация прошла успешно", user: userData };
    }

    logout() {
        this.saveCurrentUser();
        this.currentUser = null;
        localStorage.removeItem('currentUser');

        // Вызываем обновление интерфейса
        if (typeof window.updateAuthStatus === 'function') {
            window.updateAuthStatus();
        }

        // Перенаправляем на главную страницу
        window.location.href = 'index.html';

        return { success: true, message: "Вы успешно вышли из системы" };
    }

    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            // Также обновляем в общем списке пользователей
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === this.currentUser.email);

            if (userIndex !== -1) {
                users[userIndex] = { ...this.currentUser };
                localStorage.setItem('users', JSON.stringify(users));
            }
        }
    }

    updateUser(updatedData) {
        if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...updatedData };
            this.saveCurrentUser();
            return true;
        }
        return false;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    requireAuth(redirectUrl = 'sign-in-page.html') {
        if (!this.isAuthenticated()) {
            this.showModal('Ошибка', 'Пожалуйста, войдите в систему', 'error');
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
            return false;
        }
        return true;
    }

    showModal(title, message, type = 'info') {
        // Создаем модальное окно
        const modal = document.createElement('div');
        modal.className = `custom-modal ${type}`;
        modal.innerHTML = `
            <div class="custom-modal-content">
                <div class="custom-modal-header">
                    <h3>${title}</h3>
                    <button class="custom-modal-close">&times;</button>
                </div>
                <div class="custom-modal-body">
                    <p>${message}</p>
                </div>
                <div class="custom-modal-footer">
                    <button class="custom-modal-btn">OK</button>
                </div>
            </div>
        `;

        // Добавляем стили, если их еще нет
        if (!document.querySelector('#custom-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'custom-modal-styles';
            styles.textContent = `
                .custom-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    opacity: 0;
                    animation: fadeIn 0.3s ease forwards;
                }
                
                .custom-modal-content {
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    width: 90%;
                    max-width: 400px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    transform: translateY(-50px);
                    animation: slideIn 0.3s ease forwards;
                }
                
                .custom-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #f0f0f0;
                }
                
                .custom-modal-header h3 {
                    margin: 0;
                    color: #000;
                    font-size: 20px;
                }
                
                .custom-modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                }
                
                .custom-modal-body {
                    margin-bottom: 20px;
                }
                
                .custom-modal-body p {
                    margin: 0;
                    color: #333;
                    line-height: 1.5;
                }
                
                .custom-modal-footer {
                    text-align: right;
                }
                
                .custom-modal-btn {
                    background: #B9FF66;
                    color: #000;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                
                .custom-modal-btn:hover {
                    background: #A5E55A;
                    transform: translateY(-2px);
                }
                
                /* Стили для разных типов модальных окон */
                .custom-modal.success .custom-modal-header {
                    border-bottom-color: #4CAF50;
                }
                
                .custom-modal.error .custom-modal-header {
                    border-bottom-color: #F44336;
                }
                
                .custom-modal.info .custom-modal-header {
                    border-bottom-color: #2196F3;
                }
                
                @keyframes fadeIn {
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    to { transform: translateY(0); }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(modal);

        // Обработчики событий
        const closeBtn = modal.querySelector('.custom-modal-close');
        const okBtn = modal.querySelector('.custom-modal-btn');

        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease forwards';
            modal.querySelector('.custom-modal-content').style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        okBtn.addEventListener('click', closeModal);

        // Добавляем анимации исчезновения
        if (!document.querySelector('#custom-modal-animations')) {
            const animStyles = document.createElement('style');
            animStyles.id = 'custom-modal-animations';
            animStyles.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                @keyframes slideOut {
                    from { transform: translateY(0); }
                    to { transform: translateY(-50px); }
                }
            `;
            document.head.appendChild(animStyles);
        }

        return modal;
    }


}

// Функция проверки авторизации
function checkAuth() {
    return localStorage.getItem('userAuth') === 'true';
}

// Функция получения данных пользователя
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

// Функция сохранения данных пользователя
function saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userAuth', 'true');
}

// Функция выхода
function logout() {
    localStorage.removeItem('userAuth');
    localStorage.removeItem('userData');
    window.location.href = './index.html';
}

// Проверка авторизации при загрузке страницы мероприятия
document.addEventListener('DOMContentLoaded', function() {
    const registerBtn = document.querySelector('.register-btn');

    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            if (!checkAuth()) {
                e.preventDefault();
                window.location.href = 'event-registration.html?redirect=event-registration&event=tavrida';
            }
        });
    }
});

// Глобальный экземпляр
const authManager = new AuthManager();