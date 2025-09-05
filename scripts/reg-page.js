document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registerBtn').addEventListener('click', async function() {
        const username = document.querySelector('input[placeholder="Имя"]').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const region = document.getElementById('pet-select').value;
        const additionalInfo = document.getElementById('story').value;

        const success = await registerUser(username, password, email, region, additionalInfo);

        if (result.success) {
            authManager.showModal('Успех', result.message, 'success');

            // Обновляем статус авторизации на всех страницах
            if (typeof window.updateAuthStatus === 'function') {
                window.updateAuthStatus();
            }

            setTimeout(() => {
                window.location.href = 'LK.html';
            }, 1500);
        } else {
            alert('Ошибка регистрации. Возможно, пользователь уже существует.');
        }
    });
});