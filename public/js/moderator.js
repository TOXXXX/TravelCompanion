document.addEventListener("DOMContentLoaded", () => {
  setButtonStates();
});

function setButtonStates() {
  const buttons = document.querySelectorAll("[data-id^='hideAccount-']");
  buttons.forEach((button) => {
    const username = button.getAttribute("data-id").split("-")[1];
    fetch(`/user/${username}/hidden`)
      .then((response) => response.json())
      .then((data) => {
        if (data.isHidden) {
          button.innerText = "Show Account";
          button.classList.remove("btn-danger");
          button.classList.add("btn-warning");
        } else {
          button.innerText = "Hide Account";
          button.classList.remove("btn-warning");
          button.classList.add("btn-danger");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

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
    }
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        const buttons = document.querySelectorAll(
          `[data-id='hideAccount-${username}']`
        );
        buttons.forEach((button) => {
          if (button.innerText === "Hide Account") {
            button.innerText = "Show Account";
            button.classList.remove("btn-danger");
            button.classList.add("btn-warning");
          } else {
            button.innerText = "Hide Account";
            button.classList.remove("btn-warning");
            button.classList.add("btn-danger");
          }
        });
      } else {
        console.error("Failed to disable/enable user");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
