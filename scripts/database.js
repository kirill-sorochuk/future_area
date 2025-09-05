class UserDatabase {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    registerUser(userData) {
        // Проверяем, нет ли уже пользователя с таким email
        if (this.users.find(user => user.email === userData.email)) {
            return { success: false, message: "Пользователь с таким email уже существует" };
        }

        // Добавляем пользователя
        userData.id = Date.now().toString(); // Простой ID
        this.users.push(userData);
        this.saveUsers();

        return { success: true, message: "Регистрация прошла успешно" };
    }

    loginUser(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user };
        } else {
            return { success: false, message: "Неверный email или пароль" };
        }
    }

    logoutUser() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    updateUser(userId, updatedData) {
        const index = this.users.findIndex(user => user.id === userId);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedData };
            this.saveUsers();

            // Обновляем текущего пользователя, если это он
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = this.users[index];
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }

            return { success: true };
        }
        return { success: false, message: "Пользователь не найден" };
    }
}

// database.js
class UserDB {
    constructor() {
        this.init();
    }

    init() {
        // Инициализируем базу пользователей если её нет
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'Тест',
                    lastName: 'Пользователь'
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
    }

    loginUser(email, password) {
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            return { success: true, user };
        }

        return { success: false, message: 'Неверный email или пароль' };
    }

    logoutUser() {
        // Логика выхода
    }
}

window.userDB = new UserDB();


// Создаем глобальный экземпляр базы данных
window.userDB = new UserDatabase();