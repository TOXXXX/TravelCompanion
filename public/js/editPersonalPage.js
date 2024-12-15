document.getElementById("phoneNumber").addEventListener("input", (e) => {
  const value = e.target.value;
  const regex = /^[0-9+\-\(\)\s]{7,15}$/;

  if (!regex.test(value)) {
    e.target.setCustomValidity(
      "Phone number must be 7-15 digits and can include dashes, parentheses, or spaces"
    );
  } else {
    e.target.setCustomValidity("");
  }
});
document.querySelector(".edit-form").addEventListener("submit", (e) => {
  const phoneInput = document.getElementById("phoneNumber");
  const emailInput = document.getElementById("email");

  const phonePattern = /^[0-9+\-\(\)\s]{7,15}$/;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!phonePattern.test(phoneInput.value)) {
    alert("Invalid phone number format!");
    e.preventDefault();
  }

  if (!emailPattern.test(emailInput.value)) {
    alert("Invalid email format!");
    e.preventDefault();
  }
});
