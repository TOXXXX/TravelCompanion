document.addEventListener("DOMContentLoaded", () => {
  const followButton = document.getElementById("follow-button");

  if (followButton) {
    followButton.addEventListener("click", async () => {
      const username = followButton.getAttribute("data-username");

      try {
        const response = await fetch(`/personal/${username}/toggleFollow`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (response.ok) {
          followButton.textContent = data.isFollowing ? "Unfollow" : "Follow";
          followButton.classList.toggle("btn-unfollow", data.isFollowing);
          followButton.classList.toggle("btn-follow", !data.isFollowing);
        } else {
          alert(data.error || "An unexpected error occurred.");
        }
      } catch (error) {
        alert("An error occurred. Please try again.");
      }
    });
  }

  const commentForm = document.getElementById("commentForm");

  if (commentForm) {
    commentForm.addEventListener("submit", (e) => {
      const commentContent = document
        .getElementById("commentContent")
        .value.trim();
      if (!commentContent) {
        e.preventDefault();
        alert("Comment cannot be empty!");
      }
    });
  }
});
