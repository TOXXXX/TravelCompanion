document.querySelector(".edit-form").addEventListener("submit", (e) => {
  const phoneInput = document.getElementById("phoneNumber");
  const emailInput = document.getElementById("email");

  const phonePattern = /^[0-9+\-\(\)\s]{7,15}$/;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (phoneInput.value && !phonePattern.test(phoneInput.value)) {
    alert("Invalid phone number format!");
    e.preventDefault();
  }
  if (emailInput.value && !emailPattern.test(emailInput.value)) {
    alert("Invalid email format!");
    e.preventDefault();
  }
});
document.querySelector("form").addEventListener("submit", function (e) {
  const fileInput = document.getElementById("profilePicture");
  const file = fileInput.files[0];

  if (file) {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only .jpg, .jpeg, and .png files are allowed.");
      e.preventDefault();
      return;
    }
  }
});
