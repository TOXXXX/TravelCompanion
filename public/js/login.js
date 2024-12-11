document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userName, password })
      });

      if (response.ok) {
        document.getElementById("message").textContent =
          response.json().message;
        document.getElementById("message").style.color = "green";
        window.location.href = "/"; // Redirect to home page
      } else {
        const errorText = await response.text();
        document.getElementById("message").textContent = `Error: ${errorText}`;
        document.getElementById("message").style.color = "red";
      }
    } catch (error) {
      document.getElementById("message").textContent =
        `Error: ${error.message}`;
      document.getElementById("message").style.color = "red";
    }
  });
