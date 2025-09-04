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
