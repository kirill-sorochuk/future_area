  document.addEventListener("DOMContentLoaded", function () {
    const burger = document.querySelector(".burger");
    const menu = document.querySelector(".top-right");

    burger.addEventListener("click", function () {
      burger.classList.toggle("active");
      menu.classList.toggle("active");
    });
  });
  // При загрузке страницы — восстанавливаем прокрутку
  document.addEventListener("DOMContentLoaded", function () {
    const scrollY = sessionStorage.getItem("scrollY");
    if (scrollY !== null) {
      window.scrollTo(0, parseInt(scrollY));
    }
  });

  // При обновлении страницы — сохраняем прокрутку
  window.addEventListener("beforeunload", function () {
    sessionStorage.setItem("scrollY", window.scrollY);
  });



  /* выпадающеие блоки  */
/*     document.addEventListener("DOMContentLoaded", function () {
    const marker = document.querySelector(".marker");
    const hidden = document.querySelector(".block__hidden");
    const change = document.querySelector(".block");


    marker.addEventListener("click", function () {
      marker.classList.toggle("marker_active");
      hidden.classList.toggle("un_hidden");
      change.classList.toggle("block_active")


    });
  });
 */
document.addEventListener("DOMContentLoaded", function () {
const button = document.querySelector(".marker");
button.addEventListener("click", function () {
      burger.classList.toggle("marker_active");
})})






  
document.addEventListener("DOMContentLoaded", () => {
  const blocks = document.querySelectorAll(".block");

  blocks.forEach((block) => {
    const marker = block.querySelector(".marker");
    const hidden = block.querySelector(".block__hidden");

    marker.addEventListener("click", () => {
      const isOpen = hidden.classList.contains("un_hidden");

      // Закрыть все блоки
      blocks.forEach((b) => {
        const otherHidden = b.querySelector(".block__hidden");
        const otherMarker = b.querySelector(".marker");

        // Сброс высоты
        otherHidden.style.height = otherHidden.scrollHeight + "px";
        requestAnimationFrame(() => {
          otherHidden.style.height = "auto";
        });

        otherHidden.classList.remove("un_hidden");
        otherMarker.classList.remove("marker_active");
        b.classList.remove("block_active");
      });

      // Если блок был закрыт — открыть его
      if (!isOpen) {
        hidden.classList.add("un_hidden");
        hidden.style.height = hidden.scrollHeight + "px";
        marker.classList.add("marker_active");
        block.classList.add("block_active");
      }
    });

    // Сбросить высоту до auto после окончания анимации
/*     hidden.addEventListener("transitionend", () => {
      if (hidden.classList.contains("un_hidden")) {
        hidden.style.height = "auto";
      }
    }); */
  });
});


/* const swiper = new Swiper('.swiper', {
  // Optional parameters
  direction: 'vertical',
  loop: true,

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  // And if we need scrollbar
  scrollbar: {
    el: '.swiper-scrollbar',
  },
}); */

  document.addEventListener('DOMContentLoaded', function () {
    const swiper = new Swiper('.swiper', {
        loop: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        /* spaceBetween: 30, */
        initialSlide: 2,


pagination: {
    el: '.swiper-pagination',
    clickable: true,

    },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      scrollbar: {
        el: '.swiper-scrollbar',
      },
    });
  });


document.addEventListener("DOMContentLoaded", function () {
  const close_burger = document.querySelector(".close-menu");
  const menu = document.querySelector(".top-right");

  close_burger.addEventListener("click", function () {
    menu.classList.remove("active");
  });
});

  // Добавьте этот код в script.js или в каждый файл скриптов
  function checkAuth() {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      const authButton = document.querySelector('.button a');

      if (currentUser) {
          authButton.innerHTML = '<p>Личный кабинет</p>';
          authButton.href = 'LK.html';

          // Добавьте кнопку выхода
          const logoutBtn = document.createElement('div');
          logoutBtn.className = 'button';
          logoutBtn.innerHTML = '<a href="#" id="logoutBtn"><p>Выйти</p></a>';
          authButton.parentNode.parentNode.appendChild(logoutBtn);

          document.getElementById('logoutBtn').addEventListener('click', function(e) {
              e.preventDefault();
              localStorage.removeItem('currentUser');
              window.location.reload();
          });
      }
  }

  // Проверка авторизации при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
      const moreInfoButtons = document.querySelectorAll('.more-info-btn');

      moreInfoButtons.forEach(button => {
          button.addEventListener('click', function() {
              // Переход на страницу мероприятия
              window.location.href = './event-details.html';
          });
      });
  });
  // script.js - добавьте этот код в конец файла

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

          // Создаем кнопку выхода
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
              window.location.reload();
          });
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

  // Проверка авторизации при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
      updateAuthButton();

      // Также проверяем навигацию по кнопкам "Подробнее"
      const moreInfoButtons = document.querySelectorAll('.more-info-btn');

      moreInfoButtons.forEach(button => {
          button.addEventListener('click', function(e) {
              // Если пользователь не авторизован, перенаправляем на страницу входа
              const currentUser = JSON.parse(localStorage.getItem('currentUser'));
              if (!currentUser) {
                  e.preventDefault();
                  authManager.showModal('Требуется авторизация', 'Для просмотра деталей мероприятия необходимо войти в систему', 'info');
                  setTimeout(() => {
                      window.location.href = 'sign-in-page.html';
                  }, 2000);
              } else {
                  window.location.href = './event-details.html';
              }
          });
      });
  });

  // Функция для обновления статуса авторизации (можно вызывать после входа/выхода)
  window.updateAuthStatus = function() {
      updateAuthButton();
  };
  // В конец файла script.js добавьте:

  // Функция для проверки авторизации и перенаправления кнопки регистрации
  function setupEventRegistrationButtons() {
      const registerButtons = document.querySelectorAll('.register-btn, .more-info-btn');

      registerButtons.forEach(button => {
          button.addEventListener('click', function(e) {
              const currentUser = JSON.parse(localStorage.getItem('currentUser'));

              if (!currentUser) {
                  e.preventDefault();
                  authManager.showModal('Требуется авторизация', 'Для доступа к этой странице необходимо войти в систему', 'info');
                  setTimeout(() => {
                      window.location.href = 'sign-in-page.html';
                  }, 2000);
              }
              // Если пользователь авторизован, стандартное поведение (переход по href) сохранится
          });
      });
  }

  // Вызываем при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
      setupEventRegistrationButtons();
  });
  // В конец файла script.js добавьте:
  document.addEventListener('DOMContentLoaded', function() {
      // Функция для проверки авторизации при клике на кнопки мероприятий
      function setupEventButtons() {
          const eventButtons = document.querySelectorAll('.more-info-btn, .register-btn');

          eventButtons.forEach(button => {
              button.addEventListener('click', function(e) {
                  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

                  if (!currentUser) {
                      e.preventDefault();
                      authManager.showModal('Требуется авторизация', 'Для доступа к этой странице необходимо войти в систему', 'info');
                      setTimeout(() => {
                          window.location.href = 'sign-in-page.html?redirect=' +
                              (this.classList.contains('register-btn') ? 'event-registration' : 'event-details');
                      }, 2000);
                  }
              });
          });
      }

      setupEventButtons();
  });