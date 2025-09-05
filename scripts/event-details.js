// Функционал для страницы мероприятия
document.addEventListener('DOMContentLoaded', function() {
    // Переключение изображений в галерее
    const mainImage = document.querySelector('.main-image img');
    const thumbnails = document.querySelectorAll('.gallery-thumbnails img');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            mainImage.src = this.src.replace('150x100', '800x400');
        });
    });

    // Поделиться мероприятием
    const shareBtn = document.querySelector('.share-btn');
    shareBtn.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: 'Таврида - Область будущего',
                text: 'Присоединяйтесь к уникальному мероприятию для творческой молодежи!',
                url: window.location.href
            })
                .catch(error => {
                    console.log('Ошибка при использовании Web Share API:', error);
                    fallbackShare();
                });
        } else {
            fallbackShare();
        }
    });

    function fallbackShare() {
        alert('Скопируйте ссылку из адресной строки браузера, чтобы поделиться мероприятием');
    }

    // Обработка кнопки регистрации
    const registerBtn = document.querySelector('.register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Предотвращаем стандартное поведение

            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            if (!currentUser) {
                // Пользователь не авторизован - показываем сообщение и перенаправляем на вход
                authManager.showModal('Требуется авторизация', 'Для регистрации на мероприятие необходимо войти в систему', 'info');
                setTimeout(() => {
                    window.location.href = 'sign-in-page.html?redirect=event-registration&event=tavrida';
                }, 2000);
            } else {
                // Пользователь авторизован - перенаправляем на страницу регистрации
                window.location.href = 'event-registration.html';
            }
        });
    }

    // Анимация появления элементов
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.detail-card, .similar-card');

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = "1";
                element.style.transform = "translateY(0)";
            }
        });
    };

    // Инициализация анимации
    const animatedElements = document.querySelectorAll('.detail-card, .similar-card');
    animatedElements.forEach(element => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    });

    window.addEventListener('scroll', animateOnScroll);
    // Запускаем сразу на случай если элементы уже в области видимости
    animateOnScroll();
});