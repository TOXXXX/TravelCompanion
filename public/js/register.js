document
  .getElementById("registerForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const userName = document.getElementById("userName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userName, email, password, confirmPassword })
      });

      if (response.ok) {
        document.getElementById("message").textContent =
          "User registered successfully";
        document.getElementById("message").style.color = "green";
      } else {
        document.getElementById("message").textContent =
          `Error: ${jqXHR.responseText}`;
        document.getElementById("message").style.color = "red";
      }
    } catch (error) {
      document.getElementById("message").textContent =
        `Error: ${error.message}`;
      document.getElementById("message").style.color = "red";
    }
  });
