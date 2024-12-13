function validInputDateFrontend(input) {
  input = input.trim();
  let errors = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    errors.push("Invalid date format from user post input");
  }
  let inputDate = new Date(input);
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  inputDate.setUTCHours(1, 0, 0, 0);
  if (today > inputDate) {
    errors.push("You can only plan for the future");
  }
  return errors;
}

(() => {
  let post = document.getElementById("createPost");
  let errorDiv = document.getElementById("errorDiv");
  let submitButton = document.getElementById("submitBTN");
  if (post) {
    post.addEventListener("change", (event) => {
      errorDiv.hidden = true;
      submitButton.disabled = false;
      errorDiv.innerHTML = "";
      let postType = document.getElementById("postType");
      // let startDiv = document.getElementById("start-div");
      // let endDiv = document.getElementById("end-div");
      let startDate = document.getElementById("startDate");
      let endDate = document.getElementById("endDate");
      if (postType.value == "route") {
        startDate.required = false;
        endDate.required = false;
      } else if (postType.value == "plan") {
        startDate.required = true;
        endDate.required = true;
      }

      let errors = [];
      if (postType.value == "plan") {
        errors = errors.concat(validInputDateFrontend(startDate.value));
      }

      if (startDate.valueAsNumber > endDate.valueAsNumber) {
        errors.push("Start date must be before or same as the end date");
      }

      if (postType.value == "route" && (startDate.value || endDate.value)) {
        if (!startDate.value || !endDate.value) {
          errors.push("Fill in both dates or leave both empty");
        }
      }

      if (errors.length > 0) {
        submitButton.disabled = true;
        errorDiv.hidden = false;
        let errorUl = document.createElement("ul");
        event.preventDefault();
        event.stopImmediatePropagation();
        for (let error of errors) {
          let li = document.createElement("li");
          li.innerText = error;
          errorUl.appendChild(li);
        }
        errorDiv.appendChild(errorUl);
      }
    });
  }
})();
