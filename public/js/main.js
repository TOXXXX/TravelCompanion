const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", async function (event) {
    event.preventDefault();

    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error(`Error logging out: ${error.message}`);
    }
  });
}
