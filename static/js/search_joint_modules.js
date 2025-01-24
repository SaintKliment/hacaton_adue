//////////////////////////SEARCH AND SELECT LOGIC START////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  const statusSelect = document.getElementById("status-select");
  const searchInput = document.querySelector('input[placeholder="Поиск..."]');

  // Проверяем, что элемент существует
  if (statusSelect) {
    // Добавляем обработчик события change для селекта
    statusSelect.addEventListener("change", updateModuleVisibility);
  }

  // Добавляем обработчик события для поля поиска
  if (searchInput) {
    searchInput.addEventListener("keyup", updateModuleVisibility);
  }

  function updateModuleVisibility() {
    const selectedStatus = statusSelect.value.trim(); // Выбранный статус
    const searchInputValue = searchInput.value.toLowerCase(); // Значение из поля поиска
    const modules = document.querySelectorAll(".module"); // Все модули

    modules.forEach((module) => {
      const moduleState = module.getAttribute("data-state").trim(); // Состояние модуля
      const moduleName = module.querySelector("a").textContent.toLowerCase(); // Имя модуля

      // Проверяем видимость модуля на основе условий
      let shouldDisplay = true;

      // Если выбран статус "Все доступные", показываем все модули
      if (selectedStatus === "") {
        shouldDisplay = true;
      } else {
        // Применяем фильтрацию по статусу, если выбран статус
        if (moduleState !== selectedStatus) {
          shouldDisplay = false; // Скрываем модуль, если статус не совпадает
        }
      }

      // Применяем фильтрацию по поисковому запросу
      if (searchInputValue && !moduleName.includes(searchInputValue)) {
        shouldDisplay = false; // Скрываем модуль, если имя не содержит текст из поля поиска
      }

      // Устанавливаем видимость модуля
      module.style.display = shouldDisplay ? "block" : "none";
    });
  }
});

//////////////////////////SEARCH AND SELECT LOGIC END////////////////////////////////////////////////////////
