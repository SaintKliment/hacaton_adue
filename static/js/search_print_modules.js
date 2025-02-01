document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    const modules = document.querySelectorAll(".module");
  
    searchInput.addEventListener("input", function () {
      const searchTerm = searchInput.value.toLowerCase();
  
      modules.forEach(module => {
        const moduleName = module.querySelector("a").innerText.toLowerCase();
        if (moduleName.includes(searchTerm)) {
          module.style.display = ""; // Показываем модуль
        } else {
          module.style.display = "none"; // Скрываем модуль
        }
      });
    });
  });
  