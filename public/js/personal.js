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
          // Update button text and class based on follow state
          followButton.textContent = data.isFollowing ? "Unfollow" : "Follow";
          followButton.classList.toggle("btn-unfollow", data.isFollowing);
          followButton.classList.toggle("btn-follow", !data.isFollowing);
        } else {
          console.error("Failed to toggle follow:", data.error);
          alert(data.error || "An unexpected error occurred.");
        }
      } catch (error) {
        console.error("Error toggling follow:", error);
        alert("An error occurred. Please try again.");
      }
    });
  }
});
document.getElementById("commentForm").addEventListener("submit", (e) => {
  const commentContent = document.getElementById("commentContent").value.trim();
  if (!commentContent) {
    e.preventDefault();
    alert("Comment cannot be empty!");
  }
});
