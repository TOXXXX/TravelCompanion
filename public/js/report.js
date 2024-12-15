const reportForm = document.getElementById("reportForm");

reportForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const reportType = document.getElementById("reportType").value;
  const description = document.getElementById("description").value;

  // Get the current URL path
  const path = window.location.pathname;

  // Split the path into segments
  const pathSegments = path.split("/");

  // Get the last segment (username)
  const username = pathSegments[pathSegments.length - 1];

  if (!reportType || !description) {
    document.getElementById("message").textContent = "All fields are required";
    return;
  }

  const reportData = {
    reportType: reportType,
    description: description
  };

  fetch(`/report/${username}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(reportData)
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Report submitted successfully") {
        document.getElementById("message").textContent =
          "Report submitted successfully";
      } else {
        document.getElementById("message").textContent =
          "An error occurred while submitting the report";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("message").textContent =
        "An error occurred while submitting the report";
    });
});
