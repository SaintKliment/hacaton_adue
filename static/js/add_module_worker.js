///////////////////////////////////////////DRAFT LOGIC START///////////////////////////////////////////////////////////////

// Сохранение данных в localStorage
function saveData() {
  localStorage.setItem(
    "module_name",
    document.getElementById("module_name").value
  );
  localStorage.setItem("positions", document.getElementById("positions").value);
  localStorage.setItem(
    "data_source",
    document.getElementById("data_source").value
  );
  localStorage.setItem("duration", document.getElementById("duration").value);
  localStorage.setItem(
    "responsible",
    document.getElementById("responsible").value
  );

  let activities = [];
  for (let i = 1; i <= activityCount; i++) {
    if (document.getElementById(`activity_name_${i}`)) {
      activities.push({
        name: document.getElementById(`activity_name_${i}`).value,
        type: document.getElementById(`activity_type_${i}`).value,
        content: document.getElementById(`activity_content_${i}`).value,
      });
    }
  }
  localStorage.setItem("activities", JSON.stringify(activities));
}

// Сохранение данных на каждом изменении
document.getElementById("moduleForm").addEventListener("input", saveData);

///////////////////////////////////////////DRAFT LOGIC END///////////////////////////////////////////////////////////////

/////////////////////////////////ADD ACTIVITY LOGIC START///////////////////////////////////////////////////////////////
let activityCount = 1;

export function addActivity() {
  activityCount++;
  const activitiesDiv = document.getElementById("activities");
  const newActivity = document.createElement("div");
  newActivity.classList.add("activity");
  newActivity.setAttribute("id", "activity_" + activityCount);
  newActivity.innerHTML = `
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
  activitiesDiv.appendChild(newActivity);
}

function removeActivity() {
  if (activityCount > 1) {
    const activityDiv = document.getElementById("activity_" + activityCount);
    activityDiv.remove();
    // Загружаем активности из localStorage

    let activities = JSON.parse(localStorage.getItem("activities")) || [];

    // Удаляем последнюю активность из массива
    activities.pop();

    // Перезаписываем localStorage с обновленными данными
    localStorage.setItem("activities", JSON.stringify(activities));

    // Уменьшаем счетчик активностей
    activityCount--;
  }
}

document.getElementById("addButton").addEventListener("click", addActivity);
document
  .getElementById("removeButton")
  .addEventListener("click", removeActivity);
/////////////////////////////////ADD ACTIVITY LOGIC END///////////////////////////////////////////////////////////////

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

// // Сохранение выбранных файлов в localStorage
// document
//   .getElementById("file-inputs-container")
//   .addEventListener("change", function () {
//     let files = [];
//     for (let i = 1; i <= fileInputCount; i++) {
//       const input = document.getElementById(`materials_${i}`);
//       if (input && input.files.length > 0) {
//         files.push(input.files[0].name);
//       }
//     }
//     localStorage.setItem("uploaded_files", JSON.stringify(files));
//   });
//////////////////////////////////SOME FILES UPLOAD LOGIC END//////////////////////////////////////////////////////////////////
