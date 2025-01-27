document.addEventListener("DOMContentLoaded", () => {
  const messageContainer = document.querySelector(".message-container");

  // Добавляем небольшую анимацию
  setTimeout(() => {
    messageContainer.classList.add("highlight");
  }, 500);

  // Плавное исчезновение нажатой кнопки
  const btn = document.querySelector(".btn");
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    btn.style.transition = "opacity 0.5s";
    btn.style.opacity = 0;
    setTimeout(() => {
      window.location.href = btn.href;
    }, 500);
  });
});
