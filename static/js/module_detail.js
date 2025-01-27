function showRejectionForm() {
  document.getElementById("rejectionForm").style.display = "block";
}

function acceptModule(moduleId) {
  fetch(`/accept_module/${moduleId}`, {
    method: "GET", // Используем GET, как вы хотите
  })
    .then((response) => {
      if (response.ok) {
        // Перенаправляем на новый URL
        window.location.href = `/module_successfully_accept/${moduleId}`;
      } else {
        console.error("Ошибка на сервере.");
      }
    })
    .catch((error) => {
      console.error("Ошибка связи с сервером:", error);
    });
}
