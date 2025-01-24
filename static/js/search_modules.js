/////////////////////////////////// SEARCH START///////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  const statusSelect = document.getElementById("status-select");
  const searchInput = document.querySelector('input[placeholder="Поиск..."]');

  // Добавляем обработчики событий
  statusSelect.addEventListener("change", updateModuleVisibility);
  searchInput.addEventListener("keyup", updateModuleVisibility);

  function updateModuleVisibility() {
    const selectedStatus = statusSelect.value.trim(); // Выбранный статус
    const searchInputValue = searchInput.value.toLowerCase(); // Значение из поля поиска
    const modules = document.querySelectorAll(".module"); // Все модули

    modules.forEach((module) => {
      const moduleState = module.getAttribute("data-state").trim(); // Состояние модуля
      const moduleName = module.querySelector("a").textContent.toLowerCase(); // Имя модуля

      // Проверяем видимость модуля на основе условий
      let shouldDisplay = true;

      // Применяем фильтрацию по статусу
      if (selectedStatus && moduleState !== selectedStatus) {
        shouldDisplay = false; // Скрываем модуль, если статус не совпадает
      }

      // Проверка поля поиска
      if (searchInputValue && !moduleName.includes(searchInputValue)) {
        shouldDisplay = false; // Скрываем модуль, если имя не содержит текст из поля поиска
      }

      // Устанавливаем видимость модуля
      module.style.display = shouldDisplay ? "block" : "none";
    });
  }
});

///////////////////////////////////ARCHIVE SEARCH END///////////////////////////////////////////////////////////////////////////

/////////////////////////////SELECT BY STATUS START///////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function () {
  const statusSelect = document.getElementById("status-select");
  const archiveCheckbox = document.getElementById("archive-checkbox");

  // Проверяем, что элемент существует
  if (statusSelect) {
    // Добавляем обработчик события change для селекта
    statusSelect.addEventListener("change", filterModulesByStatus);
  }

  // Добавляем обработчик события для чекбокса
  if (archiveCheckbox) {
    archiveCheckbox.addEventListener("change", filterModulesByStatus);
  }

  function filterModulesByStatus() {
    const selectedStatus = statusSelect.value.trim(); // Удаляем пробелы в начале и конце
    const modules = document.querySelectorAll(".module"); // Получаем все модули

    modules.forEach((module) => {
      const moduleState = module.getAttribute("data-state").trim(); // Удаляем пробелы в начале и конце

      // Проверяем, соответствует ли состояние выбранному статусу
      if (selectedStatus === "") {
        // Если ничего не выбрано, показываем только те модули, которые соответствуют состоянию чекбокса
        if (archiveCheckbox.checked || moduleState !== "выполнен") {
          module.style.display = ""; // Показываем модуль
        } else {
          module.style.display = "none"; // Скрываем модуль
        }
      } else {
        // Если выбран статус, проверяем соответствие
        if (moduleState === selectedStatus) {
          module.style.display = ""; // Показываем модуль, если статус совпадает
        } else {
          module.style.display = "none"; // Скрываем модуль, если статус не совпадает
        }
      }
    });
  }
});

/////////////////////////////SELECT BY STATUS END///////////////////////////////////////////////////////////////////////////////////
