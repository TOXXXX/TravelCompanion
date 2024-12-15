(() => {
  let postComment = document.getElementById("postComment");
  let deletePost = document.getElementById("deletePost");

  if (deletePost) {
    deletePost.addEventListener("click", async (event) => {
      event.preventDefault();
      let postId = window.location.pathname.split("/")[2];
      try {
        let request = new Request(`/post/delete/${postId}`);
        const response = await fetch(request, {
          method: "DELETE"
        });
        if (response.ok) {
          alert("Post sucessfully deleted");
        }
        window.location.href = "/";
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    });
  }

  if (postComment) {
    let errorDiv = document.getElementById("errorDiv");
    let submitButton = document.getElementById("submit");
    let makeComment = document.getElementById("makeComment");

    makeComment.addEventListener("input", (event) => {
      errorDiv.hidden = true;
      submitButton.disabled = false;
      errorDiv.innerHTML = "";
    });
    postComment.addEventListener("submit", (event) => {
      errorDiv.hidden = true;
      submitButton.disabled = false;
      errorDiv.innerHTML = "";
      let commentContent = document.getElementById("makeComment").value;
      commentContent = commentContent.trim();
      let errors = [];
      if (!commentContent) {
        errors.push("Comment cannot be empty");
      }
      if (errors.length > 0) {
        event.preventDefault();
        submitButton.disabled = true;
        errorDiv.hidden = false;
        let errorUl = document.createElement("ul");
        for (let error of errors) {
          let li = document.createElement("li");
          li.innerText = error;
          errorUl.appendChild(li);
        }
        errorDiv.appendChild(errorUl);
      }
    });
  }

  let commentList = document.getElementById("commentList");

  if (commentList) {
    for (let comment of commentList.children) {
      let deleteComment = comment.getElementsByClassName("deleteComment")[0];
      if (deleteComment) {
        deleteComment.addEventListener("click", async (event) => {
          event.preventDefault();
          try {
            let request = new Request(
              `/post/comment/delete/${comment.getAttribute("data-commentid")}`
            );
            const response = await fetch(request, {
              method: "DELETE"
            });
            if (response.ok) {
              alert("Comment sucessfully deleted");
              window.location.reload();
            }
          } catch (error) {
            alert(`Error: ${error.message}`);
          }
        });
      }
    }
  }

  // Like
  let like = document.getElementById("likes");
  if (like) {
    like.addEventListener("click", async (event) => {
      event.preventDefault();
      let postId = window.location.pathname.split("/")[2];
      let request = new Request(`/post/${postId}/like`);
      const response = await fetch(request, {
        method: "POST"
      });
      if (response.ok) {
        const data = await response.json();
        like.innerText = `Like by ${data.likes} people.`;
      }
    });
  }
})();
