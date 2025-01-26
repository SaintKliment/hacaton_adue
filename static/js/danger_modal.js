document.addEventListener("DOMContentLoaded", function () {
  // Находим кнопку закрытия
  var closeButton = document.querySelector(".close");

  // Если кнопка существует, добавляем обработчик клика
  if (closeButton) {
    closeButton.onclick = function () {
      var modalWrapper = document.getElementById("errorModalWrapper");
      if (modalWrapper) {
        modalWrapper.style.display = "none"; // Скрываем модальное окно и фон
      }
    };
  }

  // Закрытие окна при клике на фон
  var modalWrapper = document.getElementById("errorModalWrapper");

  // Если модальное окно существует, добавляем обработчик клика на фон
  if (modalWrapper) {
    modalWrapper.onclick = function (event) {
      // Закрытие модального окна и фона, если клик по фону, а не по содержимому
      if (event.target === modalWrapper) {
        modalWrapper.style.display = "none"; // Скрываем окно и фон
      }
    };
  }
});
