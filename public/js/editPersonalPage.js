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
