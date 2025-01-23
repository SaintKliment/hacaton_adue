/////////////////////////////////// SEARCH START///////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
  const archiveCheckbox = document.getElementById("archive-checkbox");
  const statusSelect = document.getElementById("status-select");
  const searchInput = document.querySelector('input[placeholder="Поиск..."]');

  // Добавляем обработчики событий
  archiveCheckbox.addEventListener("change", updateModuleVisibility);
  statusSelect.addEventListener("change", updateModuleVisibility);
  searchInput.addEventListener("keyup", updateModuleVisibility);

  function updateModuleVisibility() {
    const isChecked = archiveCheckbox.checked; // Состояние чекбокса
    const selectedStatus = statusSelect.value.trim(); // Выбранный статус
    const searchInputValue = searchInput.value.toLowerCase(); // Значение из поля поиска
    const modules = document.querySelectorAll(".module"); // Все модули

    modules.forEach((module) => {
      const moduleState = module.getAttribute("data-state").trim(); // Состояние модуля
      const moduleName = module.querySelector("a").textContent.toLowerCase(); // Имя модуля

      // Проверяем видимость модуля на основе условий
      let shouldDisplay = true;

      // Если чекбокс не отмечен и модуль со статусом 'выполнен', скрываем его
      if (!isChecked && moduleState === "выполнен") {
        shouldDisplay = false;
      }

      // Если чекбокс не отмечен, применяем фильтрацию по статусу и поиску
      if (!isChecked && selectedStatus && moduleState !== selectedStatus) {
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

/////////////////////////////////// SEARCH END///////////////////////////////////////////////////////////////////////////

///////////////////////////////////ARCHIVE SEARCH START///////////////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
  const archiveCheckbox = document.getElementById("archive-checkbox");
  const statusSelect = document.getElementById("status-select");

  // Добавляем обработчик события на чекбокс
  archiveCheckbox.addEventListener("change", toggleArchive);

  function toggleArchive() {
    const isChecked = archiveCheckbox.checked;
    const selectedStatus = statusSelect.value.trim(); // Получаем выбранный статус
    const modules = document.querySelectorAll(".module"); // Получаем все модули

    modules.forEach((module) => {
      const state = module.getAttribute("data-state").trim(); // Получаем состояние модуля

      // Если чекбокс отмечен, показываем только модули со статусом 'выполнен'
      if (isChecked) {
        if (state === "выполнен") {
          module.style.display = "block"; // Показываем модуль, если статус 'выполнен'
        } else {
          module.style.display = "none"; // Скрываем другие модули
        }
      } else {
        // Если чекбокс не отмечен, применяем фильтрацию по выбранному статусу
        if (selectedStatus === "" || state === selectedStatus) {
          module.style.display = "block"; // Показываем модуль, если статус совпадает или ничего не выбрано
        } else {
          module.style.display = "none"; // Скрываем модуль, если статус не совпадает
        }
      }
    });
  }

  // Дополнительно добавим обработчик для селекта, чтобы обновлять отображение при изменении статуса
  statusSelect.addEventListener("change", toggleArchive);
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
