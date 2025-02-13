//////////////////////////////////SOCKET LOGIC FOR CONST FIELDS START//////////////////////////////////////////////////////////////////
const socket = io(); // Инициализация соединения

function sendConstInputs() {
  const moduleName = document.getElementById("module_name").value || null;
  const dataSource = document.getElementById("data_source").value || null;
  const duration = document.getElementById("duration").value || null;
  const responsible = document.getElementById("responsible").value || null;
  const positionsSelect = document.getElementById("positions");
  const selectedPositions = Array.from(positionsSelect.selectedOptions).map(
    (option) => option.value
  );

  const activity_name_1 = document.getElementById("activity_name_1").value;
  const activity_type_1 = document.getElementById("activity_type_1").value;
  const activity_content_1 =
    document.getElementById("activity_content_1").value;

  const path = window.location.pathname;
  const segments = path.split("/");
  const moduleId = segments.pop() || segments.pop();

  socket.emit("update_joint_const_inputs", {
    module_id: moduleId,
    module_name: moduleName,
    data_source: dataSource,
    duration: duration,
    responsible: responsible,
    selectedPositions: selectedPositions,

    activity_name_1: activity_name_1,
    activity_type_1: activity_type_1,
    activity_content_1: activity_content_1,
  });
}

socket.on("const_fiedls", function (data) {
  document.getElementById("module_name").value = data.module_name;
  document.getElementById("data_source").value = data.data_source;
  document.getElementById("duration").value = data.duration;
  document.getElementById("responsible").value = data.responsible;
  // Получаем значения для selectedPositions из data
  const selectedPositions = data.selected_positions; // Список выбранных позиций
  const positionsSelect = document.getElementById("positions");

  // Сбрасываем выделение перед обновлением
  Array.from(positionsSelect.options).forEach((option) => {
    option.selected = selectedPositions.includes(option.value);
  });

  activities = data.activities[0];

  document.getElementById("activity_name_1").value = activities.name;
  document.getElementById("activity_type_1").value = activities.type;
  document.getElementById("activity_content_1").value = activities.content;
});

//////////////////////////////////SOCKET LOGIC FOR CONST FIELDS END//////////////////////////////////////////////////////////////////

////////////////////////////////////LOAD EXIST ACTIVITIES FROM DB START////////////////////////////////////////////////////////////////////////////

function parseArray(input) {
  if (Array.isArray(input)) {
    return input; // Если это уже массив, возвращаем его
  } else if (typeof input === "string") {
    try {
      return JSON.parse(input); // Пробуем распарсить строку как JSON
    } catch (e) {
      console.error("Ошибка при парсинге строки:", e);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }
  return []; // Если это не массив и не строка, возвращаем пустой массив
}

document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname;
  const segments = path.split("/");
  let moduleId = segments.pop() || segments.pop();
  moduleId = parseInt(moduleId);

  const url = `/get_activities/${moduleId}`;

  // Fetch request to the Flask API
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data || data.length === 0) {
        console.warn("No data received or data is empty.");
        return; // Выходим из функции, если данных нет
      }

      data = data[0];

      counter = data.activity_count;

      const names = parseArray(data.name);
      const types = parseArray(data.type);
      const contents = parseArray(data.content);

      for (let i = 1; i <= counter; i++) {
        const suffix = `_${i}`; // Суффикс для текущей итерации (_1, _2 и т.д.)

        // Фильтруем элементы, которые заканчиваются на текущий суффикс
        const nameWithSuffix = names.find((n) => n.endsWith(suffix)) || ""; // Ищем имя с текущим суффиксом
        const typeWithSuffix = types.find((t) => t.endsWith(suffix)) || ""; // Ищем тип с текущим суффиксом
        const contentWithSuffix =
          contents.find((c) => c.endsWith(suffix)) || ""; // Ищем содержание с текущим суффиксом

        // Убираем суффикс из значений
        const name = nameWithSuffix.replace(suffix, ""); // Убираем суффикс из имени
        const type = typeWithSuffix.replace(suffix, ""); // Убираем суффикс из типа
        const content = contentWithSuffix.replace(suffix, ""); // Убираем суффикс из содержания

        // Проверяем, что хотя бы одно значение существует
        if (name || type || content) {
          addActivity(null, {}, name.trim(), type.trim(), content.trim()); // Используем trim() для удаления лишних пробелов
        }
      }
    })
    .catch((error) => console.error("Fetch error:", error));
});

/////////////////////////////////////LOAD EXIST ACTIVITIES FROM DB END///////////////////////////////////////////////////////////////////////////

//////////////////////////////////ADD ACTIVITY LOGIC START//////////////////////////////////////////////////////////////////
function addActivity(
  activityId = null,
  initialData = {},
  name = "",
  type = "",
  content = ""
) {
  activityCount++;
  const activitiesDiv = document.getElementById("activities");
  const activityIdFinal = activityId || "activity_" + activityCount;

  const newActivity = document.createElement("div");
  newActivity.classList.add("activity");
  newActivity.setAttribute("id", activityIdFinal);

  newActivity.innerHTML = `
        <label for="activity_name_${activityIdFinal}">Наименование мероприятия:</label>
        <input type="text" id="activity_name_${activityIdFinal}" name="activity_name[]" required 
            oninput="syncInput('${activityIdFinal}', 'name', this.value)" 
            value="${name || initialData.name || ""}" />
        
        <label for="activity_type_${activityIdFinal}">Тип мероприятия:</label>
        <select name="activity_type[]" id="activity_type_${activityIdFinal}" required 
            onchange="syncInput('${activityIdFinal}', 'type', this.value)">
            <option value="theory" ${
              type === "theory" || initialData.type === "theory"
                ? "selected"
                : ""
            }>Теория</option>
            <option value="practice" ${
              type === "practice" || initialData.type === "practice"
                ? "selected"
                : ""
            }>Практика</option>
        </select>
        
        <label for="activity_content_${activityIdFinal}">Содержание мероприятия:</label>
        <textarea name="activity_content[]" id="activity_content_${activityIdFinal}" rows="4" required 
            oninput="syncInput('${activityIdFinal}', 'content', this.value)">${
    content || initialData.content || ""
  }</textarea>
    `;

  activitiesDiv.appendChild(newActivity);
}

//////////////////////////////////UPDATE ACTIVITY LOGIC START//////////////////////////////////////////////////////////////////

// Синхронизация изменения в инпутах
function syncInput(activityId, field, value) {
  const path = window.location.pathname;
  const segments = path.split("/");
  const moduleId = segments.pop() || segments.pop();

  socket.emit("update_activity", { moduleId, activityId, field, value });
}
window.syncInput = syncInput;

// Обработка обновлений инпутов от других пользователей
socket.on("activity_updated", (data) => {
  const { activityId, field, value } = data;

  const inputElement = document.querySelector(
    `#${activityId} [id^="activity_${field}_"]`
  );
  console.log(value);
  if (inputElement) {
    inputElement.value = value; // Обновляем значение
  }
});

//////////////////////////////////UPDATE ACTIVITY LOGIC END//////////////////////////////////////////////////////////////////

//////////////////////////////////ADD ACTIVITY LOGIC START//////////////////////////////////////////////////////////////////

let activityCount = 1;

// Функция, которая добавляет мероприятие и уведомляет других пользователей
function addActivityAndNotify() {
  const path = window.location.pathname;
  const segments = path.split("/");
  const moduleId = segments.pop() || segments.pop();

  addActivity(); // Добавляем мероприятие локально
  socket.emit("add_activity", { activityCount, moduleId }); // Уведомляем сервер
}
window.addActivityAndNotify = addActivityAndNotify;

// Слушаем события от сервера
socket.on("activity_added", (data) => {
  console.log("Activity added by another user:", data);
  addActivity(); // Добавляем мероприятие, когда сервер отправляет уведомление
});

//////////////////////////////////ADD ACTIVITY LOGIC END//////////////////////////////////////////////////////////////////

//////////////////////////////////REMOVE ACTIVITY LOGIC START//////////////////////////////////////////////////////////////////

// Удаление мероприятия
function removeActivity() {
  if (activityCount > 1) {
    const activityDiv = document.getElementById("activity_" + activityCount);
    activityDiv.remove();
    activityCount--;
  }
}
// Функция, которая добавляет мероприятие и уведомляет других пользователей
function removeActivityAndNotify() {
  const path = window.location.pathname;
  const segments = path.split("/");
  const moduleId = segments.pop() || segments.pop();

  removeActivity(); // Добавляем мероприятие локально
  socket.emit("remove_activity", { activityCount, moduleId }); // Уведомляем сервер
}
window.removeActivityAndNotify = removeActivityAndNotify;

// Слушаем события от сервера
socket.on("activity_removed", (data) => {
  console.log("Activity removed by another user:", data);
  removeActivity(); // Добавляем мероприятие, когда сервер отправляет уведомление
});

//////////////////////////////////REMOVE ACTIVITY LOGIC END//////////////////////////////////////////////////////////////////

//////////////////////////////////ADD ACTIVITY LOGIC END//////////////////////////////////////////////////////////////////

//////////////////////////////////SOME FILES UPLOAD LOGIC START//////////////////////////////////////////////////////////////////
let fileInputCount = 1;

const path = window.location.pathname;
const segments = path.split("/");
const moduleId = segments.pop() || segments.pop();

socket.emit("join_module", { module_id: moduleId });

// Получаем уведомление о добавлении файла
socket.on("file_added", (data) => {
  const container = document.getElementById("file-inputs-container");
  const newFileDiv = document.createElement("div");
  newFileDiv.classList.add("file-input");
  newFileDiv.setAttribute("id", `file_input_${data.filename}`); // _${fileInputCount}
  newFileDiv.innerHTML = `
        <span>${data.filename}</span>
        <button type="button" class="remove-file-input" data-filename="${data.filename}">Удалить</button>
      `;
  container.appendChild(newFileDiv);

  // Обработчик кнопки удаления файла
  newFileDiv
    .querySelector(".remove-file-input")
    .addEventListener("click", function () {
      const filename = this.getAttribute("data-filename");
      socket.emit("file_removed", { filename, module_id: moduleId });
      newFileDiv.remove(); // Удаляем файл с интерфейса
    });
});

socket.on("file_removed", (data) => {
  const filename = data.filename;

  // Находим элемент с этим файлом на странице
  const fileDiv = document.getElementById(`file_input_${filename}`);

  // Удаляем элемент из интерфейса
  if (fileDiv) {
    fileDiv.remove();
  }
});

// Отправка файлов на сервер
document.getElementById("add-file-input").addEventListener("click", () => {
  const formData = new FormData();
  const files = document.querySelectorAll('input[name="materials[]"]');
  files.forEach((fileInput) => {
    if (fileInput.files[0]) {
      formData.append("materials[]", fileInput.files[0]);
    }
  });

  fetch(`/upload/${moduleId}`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Uploaded:", data.uploaded_files);
    })
    .catch((error) => console.error("Error uploading files:", error));
});

const fileInput = document.getElementById("materials_1");
const addFileButton = document.getElementById("add-file-input");

// Функция для показа/скрытия кнопки
function toggleButtonVisibility() {
  if (fileInput.files.length > 0) {
    addFileButton.style.display = "flex"; // Показываем кнопку, если файл выбран
  } else {
    addFileButton.style.display = "none"; // Скрываем кнопку, если файл не выбран
  }
}

// Инициализация состояния кнопки на старте
toggleButtonVisibility();

// Добавляем обработчик события для отслеживания выбора файла
fileInput.addEventListener("change", toggleButtonVisibility);

document.addEventListener("DOMContentLoaded", function () {
  const moduleId = 15; // Замените на ID модуля, который вам нужен

  // Запрос на сервер для получения списка файлов
  fetch(`/get_files/${moduleId}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.files && data.files.length > 0) {
        const container = document.getElementById("file-inputs-container");

        // Проходим по файлам и добавляем их в DOM
        data.files.forEach((filename) => {
          const newFileDiv = document.createElement("div");
          newFileDiv.classList.add("file-input");
          newFileDiv.setAttribute("id", `file_input_${filename}`);
          newFileDiv.innerHTML = `
            <span>${filename}</span>
            <button type="button" class="remove-file-input" data-filename="${filename}">Удалить</button>
          `;
          container.appendChild(newFileDiv);

          // Обработчик для удаления файла
          newFileDiv
            .querySelector(".remove-file-input")
            .addEventListener("click", function () {
              const filename = this.getAttribute("data-filename");
              socket.emit("file_removed", { filename, module_id: moduleId });
              newFileDiv.remove(); // Удаляем файл с интерфейса
            });
        });
      }
    })
    .catch((error) => {
      console.error("Ошибка при получении файлов:", error);
    });
});

//////////////////////////////////SOME FILES UPLOAD LOGIC END//////////////////////////////////////////////////////////////////

socket.on("module_sent_for_approval", function (data) {
  // Можете обработать событие, например, обновить интерфейс
  window.location.href = "/module_sent/" + data.module_id;
});
