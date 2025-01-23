import { addActivity } from "./add_module_worker.js";

//////////////////////////////////////UPLOAD DATA FROM LOCALSTORAGE START////////////////////////////////////////////////
window.onload = function () {
  if (localStorage.getItem("module_name")) {
    document.getElementById("module_name").value =
      localStorage.getItem("module_name");
  }
  if (localStorage.getItem("positions")) {
    document.getElementById("positions").value =
      localStorage.getItem("positions");
  }
  if (localStorage.getItem("data_source")) {
    document.getElementById("data_source").value =
      localStorage.getItem("data_source");
  }
  if (localStorage.getItem("duration")) {
    document.getElementById("duration").value =
      localStorage.getItem("duration");
  }
  if (localStorage.getItem("responsible")) {
    document.getElementById("responsible").value =
      localStorage.getItem("responsible");
  }

  // Восстановление мероприятий
  if (localStorage.getItem("activities")) {
    const activities = JSON.parse(localStorage.getItem("activities"));
    activities.forEach((activity, index) => {
      if (index > 0) {
        addActivity();
      }
      document.getElementById(`activity_name_${index + 1}`).value =
        activity.name;
      document.getElementById(`activity_type_${index + 1}`).value =
        activity.type;
      document.getElementById(`activity_content_${index + 1}`).value =
        activity.content;
    });
  }
};
//////////////////////////////////////UPLOAD DATA FROM LOCALSTORAGE END///////////////////////////////////////////////////////
