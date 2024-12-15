function dismissReport(reportId) {
  fetch(`/report/${reportId}/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        document.getElementById(`${reportId}`).remove();
      } else {
        console.error("Failed to dismiss report");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function disableAccount(username, reportId) {
  fetch(`/report/${username}/disable`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ isHidden: true })
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        const button = document.getElementById(`hideAccount-${reportId}`);
        if (button.innerText === "Hide Account") {
          button.innerText = "Show Account";
          button.classList.remove("btn-danger");
          button.classList.add("btn-warning");
        } else {
          button.innerText = "Hide Account";
          button.classList.remove("btn-warning");
          button.classList.add("btn-danger");
        }
      } else {
        console.error("Failed to disable/enable user");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
