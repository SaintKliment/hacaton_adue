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
});

//////////////////////////////////SOCKET LOGIC FOR CONST FIELDS END//////////////////////////////////////////////////////////////////

//////////////////////////////////ADD ACTIVITY LOGIC START//////////////////////////////////////////////////////////////////

function addActivityAndNotify() {
  let activitiesContainer = document.getElementById("activities");
  let activityCount =
    activitiesContainer.getElementsByClassName("activity").length + 1;

  // Создание нового мероприятия
  let activity = document.createElement("div");
  activity.classList.add("activity");
  activity.id = `activity_${activityCount}`;

  activity.innerHTML = `
      <label for="activity_name_${activityCount}">Наименование мероприятия:</label>
      <input type="text" id="activity_name_${activityCount}" name="activity_name[]" required />
      
      <label for="activity_type_${activityCount}">Тип мероприятия:</label>
      <select name="activity_type[]" id="activity_type_${activityCount}" required>
        <option value="theory">Теория</option>
        <option value="practice">Практика</option>
      </select>
  
      <label for="activity_content_${activityCount}">Содержание мероприятия:</label>
      <textarea name="activity_content[]" id="activity_content_${activityCount}" rows="4" required></textarea>
    `;

  activitiesContainer.appendChild(activity);
}

function removeActivityAndNotify() {
  let activitiesContainer = document.getElementById("activities");
  let activityCount =
    activitiesContainer.getElementsByClassName("activity").length;

  if (activityCount > 1) {
    // Удаление последнего мероприятия
    activitiesContainer.removeChild(activitiesContainer.lastChild);
  }
}
//////////////////////////////////ADD ACTIVITY LOGIC END//////////////////////////////////////////////////////////////////

//////////////////////////////////SOME FILES UPLOAD LOGIC START//////////////////////////////////////////////////////////////////
let fileInputCount = 1;

// Добавление нового инпута
document
  .getElementById("add-file-input")
  .addEventListener("click", function () {
    fileInputCount++;
    const container = document.getElementById("file-inputs-container");

    // Создаем новый инпут для файла
    const newInputDiv = document.createElement("div");
    newInputDiv.classList.add("file-input");
    newInputDiv.setAttribute("id", `file_input_${fileInputCount}`);

    // Вставляем кнопку удаления
    newInputDiv.innerHTML = `
      <input
        type="file"
        id="materials_${fileInputCount}"
        name="materials[]"
        accept=".pdf,.pptx,.xlsx,.docx,.jpg,.mkv,.avi,.mp,.url"
      />
      <button type="button" class="remove-file-input" data-input-id="file_input_${fileInputCount}">Удалить</button>
    `;

    // Добавляем новый инпут в контейнер
    container.appendChild(newInputDiv);

    // Добавляем обработчик события для кнопки удаления
    const removeButton = newInputDiv.querySelector(".remove-file-input");
    removeButton.addEventListener("click", function () {
      // Не удаляем последний инпут
      if (fileInputCount > 1) {
        const inputId = removeButton.getAttribute("data-input-id");
        const inputDiv = document.getElementById(inputId);
        inputDiv.remove();
        fileInputCount--;
      }
    });
  });
//////////////////////////////////SOME FILES UPLOAD LOGIC END//////////////////////////////////////////////////////////////////
