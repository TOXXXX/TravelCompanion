function validInputDateFrontend(input) {
  input = input.trim();
  let errors = [];
  if (!input) {
    return ["You must provide both dates for plan"];
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    errors.push("Invalid date format from user post input");
  }
  let inputDate = new Date(input);
  let today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  inputDate.setUTCHours(0, 0, 0, 0);
  if (today.getTime() > inputDate.getTime()) {
    // untested
    errors.push("You can only plan for the future");
  }
  return errors;
}

(() => {
  let createPost = document.getElementById("createPost");
  let editPost = document.getElementById("editPost");
  let errorDiv = document.getElementById("errorDiv");
  let submitButton = document.getElementById("submitBTN");
  if (createPost) {
    createPost.addEventListener("change", (event) => {
      errorDiv.hidden = true;
      submitButton.disabled = false;
      errorDiv.innerHTML = "";
      let postType = document.getElementById("postType");
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
        errors = errors.concat(validInputDateFrontend(endDate.value));
        errors = [...new Set(errors)];
      }

      if (postType.value == "route" && (startDate.value || endDate.value)) {
        if (!startDate.value || !endDate.value) {
          errors.push("Fill in both dates or leave both empty for route");
        }
      }

      if (startDate.valueAsNumber > endDate.valueAsNumber) {
        errors.push("Start date must be before or same as the end date");
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

  if (editPost) {
    if (document.getElementById("postType").value == "route") {
      document.getElementById("startDate").required = false;
      document.getElementById("endDate").required = false;
    }

    editPost.addEventListener("change", (event) => {
      errorDiv.hidden = true;
      submitButton.disabled = false;
      errorDiv.innerHTML = "";
      let postType = document.getElementById("postType");
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
        errors = errors.concat(validInputDateFrontend(endDate.value));
        errors = [...new Set(errors)];
      }

      if (postType.value == "route" && (startDate.value || endDate.value)) {
        if (!startDate.value || !endDate.value) {
          errors.push("Fill in both dates or leave both empty for route");
        }
      }

      if (startDate.valueAsNumber > endDate.valueAsNumber) {
        errors.push("Start date must be before or same as the end date");
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

    editPost.addEventListener("submit", async (event) => {
      event.preventDefault();
      let postId = window.location.pathname.split("/")[3];
      let request = new Request(`/post/edit/${postId}`);
      try {
        const response = await fetch(request, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            postTitle: document.getElementById("postTitle").value,
            postDescription: document.getElementById("postDescription").value,
            postContent: document.getElementById("postContent").value,
            postType: document.getElementById("postType").value,
            startDate: document.getElementById("startDate").value,
            endDate: document.getElementById("endDate").value
          })
        });
        if (response.ok) {
          alert("Post successfully updated");
          window.location.href = `/post/${postId}`;
        } else {
          alert("Error updating post");
        }
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }
})();
