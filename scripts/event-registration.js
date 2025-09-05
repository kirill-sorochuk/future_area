document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    if (!checkAuth()) {
        // window.location.href = 'event-registration.html';
        return;
    }

    // Загружаем данные пользователя
    const userData = getUserData();
    if (userData) {
        // Заполняем поля данными пользователя
        document.getElementById('firstName').value = userData.firstName || '';
        document.getElementById('lastName').value = userData.lastName || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('birthDate').value = userData.birthDate || '';
        document.getElementById('education').value = userData.education || '';
        document.getElementById('occupation').value = userData.occupation || '';
        document.getElementById('experience').value = userData.experience || '';
    }

    // Обработка выхода
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    // Многостраничная форма
    const form = document.getElementById('registrationForm');
    const steps = document.querySelectorAll('.form-step');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const submitBtn = document.querySelector('.submit-btn');
    let currentStep = 1;

    // Обновляем видимость кнопок
    function updateNavigation() {
        prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
        nextBtn.style.display = currentStep < steps.length ? 'block' : 'none';
        submitBtn.style.display = currentStep === steps.length ? 'block' : 'none';

        // Обновляем прогресс-бар
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index + 1 <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // На последнем шаге обновляем сводку
        if (currentStep === 4) {
            updateSummary();
        }
    }

    // Обновление сводки на последнем шаге
    function updateSummary() {
        document.getElementById('summary-firstName').textContent =
            document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value;
        document.getElementById('summary-email').textContent = document.getElementById('email').value;
        document.getElementById('summary-education').textContent =
            document.getElementById('education').options[document.getElementById('education').selectedIndex].text;
        document.getElementById('summary-occupation').textContent = document.getElementById('occupation').value;
    }

    // Переход к следующему шагу
    nextBtn.addEventListener('click', function() {
        // Проверяем валидность текущего шага
        const currentStepForm = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const inputs = currentStepForm.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value) {
                isValid = false;
                input.style.borderColor = 'red';
            } else {
                input.style.borderColor = '';
            }
        });

        if (isValid) {
            steps[currentStep - 1].classList.remove('active');
            currentStep++;
            steps[currentStep - 1].classList.add('active');
            updateNavigation();
        }
    });

    // Возврат к предыдущему шагу
    prevBtn.addEventListener('click', function() {
        steps[currentStep - 1].classList.remove('active');
        currentStep--;
        steps[currentStep - 1].classList.add('active');
        updateNavigation();
    });

    // Отправка формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Имитация успешной регистрации
        const formData = new FormData(form);
        const registrationData = Object.fromEntries(formData);

        // Сохраняем данные регистрации
        localStorage.setItem('eventRegistration', JSON.stringify({
            event: 'tavrida',
            data: registrationData,
            timestamp: new Date().toISOString(),
            status: 'pending'
        }));

        // Перенаправляем на страницу успеха
        window.location.href = './registration-success.html?event=tavrida';
    });

    // Инициализация
    updateNavigation();
});