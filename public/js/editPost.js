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
  let postPictures = document.getElementById("postPictures");
  let postDescription = document.getElementById("postDescription");
  let postContent = document.getElementById("postContent");

  function editPostCheckForm(event) {
    errorDiv.hidden = true;
    submitButton.disabled = false;
    errorDiv.innerHTML = "<h4>Submission Errors:</h4>";
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
    // console.log(postDescription.value.length);
    if (postDescription.value.length > 100) {
      errors.push("Description must be less than 100 characters");
    }
    if (postContent.value.length > 10000) {
      errors.push("Content must be less than 10000 characters");
    }

    if (startDate.valueAsNumber > endDate.valueAsNumber) {
      errors.push("Start date must be before or same as the end date");
    }

    let existingPics = document.getElementById("edit-thumbnail-container");

    if (existingPics) {
      if (existingPics.childElementCount + postPictures.files.length > 5) {
        errors.push("You can only have up to 5 pictures for a post");
      }
    }

    if (postPictures.files.length > 5) {
      errors.push("You can only have up to 5 pictures for a post");
    }

    if (errors.length > 0) {
      submitButton.disabled = true;
      errorDiv.hidden = false;
      errors = [...new Set(errors)];
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
  }

  if (createPost) {
    createPost.addEventListener("change", (event) => {
      errorDiv.hidden = true;
      submitButton.disabled = false;
      errorDiv.innerHTML = "<h4>Submission Errors:</h4>";
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

      if (postDescription.value.length > 100) {
        errors.push("Description must be less than 100 characters");
      }
      if (postContent.value.length > 10000) {
        errors.push("Content must be less than 10000 characters");
      }

      if (startDate.valueAsNumber > endDate.valueAsNumber) {
        errors.push("Start date must be before or same as the end date");
      }

      if (postPictures.files.length > 5) {
        errors.push("You can only upload up to 5 pictures");
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

    let thumbnails = [];
    for (let i = 0; i < 5; i++) {
      if (document.getElementById(`thumbnail${i}`)) {
        thumbnails.push(document.getElementById(`thumbnail${i}`));
      } else {
        break;
      }
    }

    for (let i = 0; i < thumbnails.length; i++) {
      thumbnails[i].addEventListener("click", async (event) => {
        event.preventDefault();
        console.log(window.location.pathname.split("/")[3]);
        console.log(thumbnails[i].getAttribute("src"));
        try {
          let request = new Request(`/post/image/delete`);
          const response = await fetch(request, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              postId: window.location.pathname.split("/")[3],
              imgSrc: thumbnails[i].getAttribute("src")
            })
          });
          if (response.ok) {
            alert("Image sucessfully deleted");
            thumbnails[i].remove();
          }
        } catch (error) {
          alert(`Error: ${error.message}`);
          // window.location.reload();
        }
        editPostCheckForm(event);
      });
    }

    editPost.addEventListener("change", (event) => {
      editPostCheckForm(event);
    });

    editPost.addEventListener("submit", async (event) => {
      event.preventDefault();
      let postId = window.location.pathname.split("/")[3];
      let request = new Request(`/post/edit/${postId}`);

      const formData = new FormData();
      formData.append("postTitle", document.getElementById("postTitle").value);
      formData.append(
        "postDescription",
        document.getElementById("postDescription").value
      );
      formData.append(
        "postContent",
        document.getElementById("postContent").value
      );
      formData.append("postType", document.getElementById("postType").value);
      formData.append("startDate", document.getElementById("startDate").value);
      formData.append("endDate", document.getElementById("endDate").value);
      // formData.append("postPictures", postPictures.files);

      const files = postPictures.files; // FileList
      for (let i = 0; i < files.length; i++) {
        formData.append("postPictures", files[i]); // Add each file individually
      }

      try {
        const response = await fetch(request, {
          method: "PATCH",
          body: formData
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
