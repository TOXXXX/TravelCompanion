$(document).ready(function () {
  // Function to render posts
  function renderPosts(posts) {
    const postsContainer = $("#posts-container");
    if (posts && posts.length > 0) {
      let newPostsHtml = "";
      posts.forEach((post) => {
        newPostsHtml += `
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <h3>
                  <a href="/post/${post.id}">${post.title}</a>
                </h3>
                <h4 class="card-type">${post.type}</h4>
              </div>
              <div class="card-actions">
                <button class="btn edit" data-postid="${post.id}">
                  <i class="far fa-edit"></i>
                </button>
                <button class="btn delete" data-postid="${post.id}">
                  <i class="far fa-trash-can"></i>
                </button>
              </div>
            </div>
            <p class="card-description">${post.intro}</p>
            <div class="card-footer">
              <div class="card-metadata">
                <span class="metadata-item">
                  <i class="far fa-clock icon"></i>
                  ${post.duration} minutes
                </span>
                <span class="metadata-item">
                  <i class="far fa-map icon"></i>
                  ${post.distance} kilometers
                </span>
                <span class="metadata-item">
                  <i class="far fa-compass icon"></i>
                  ${post.locations}
                </span>
              </div>
              <div class="card-interactions">
                <span class="interaction-item comments" data-postid="${post.id}">
                  <i class="far fa-comments icon"></i>
                  ${post.comments}
                </span>
                <span class="interaction-item likes ${post.liked ? "red-icon" : ""}" data-postid="${post.id}">
                  <i class="far fa-thumbs-up icon"></i>
                  <span id="like">${post.likes}</span>
                </span>
              </div>
            </div>
          </div>`;
      });
      postsContainer.html(newPostsHtml);
    } else {
      postsContainer.html("<p>No posts found</p>");
    }
  }

  // Initial AJAX request on page load
  $.ajax({
    url: "/post",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      isPlan: true,
      isRoute: true,
      following: false,
      search: ""
    }),
    success: function (response) {
      renderPosts(response.posts);
    },
    error: function () {
      $("#posts-container").html(
        "<p>An error occurred while loading posts.</p>"
      );
    }
  });

  // AJAX request on form submit
  $(".search-form").on("submit", function (event) {
    event.preventDefault();

    // Validate search input, it can be empty signaling no search term should be used
    const search = $('input[name="search"]').val();
    if (typeof search !== "string") {
      alert("Search term must be a string.");
      return;
    }

    const formData = {
      isPlan: $('input[name="isPlan"]').is(":checked"),
      isRoute: $('input[name="isRoute"]').is(":checked"),
      following: $('input[name="following"]').is(":checked"),
      search: $('input[name="search"]').val() || ""
    };

    // At least one of isPlan or isRoute must be true
    if (!formData.isPlan && !formData.isRoute) {
      alert("All posts are either plans or routes. Please select one.");
      return;
    }

    // Needs login to see following users' posts
    const userId = $("#posts-container").data("user");
    if (!userId && formData.following) {
      alert("Please login to see posts from users you are following.");
      window.location.replace("/login");
      return;
    }

    $.ajax({
      url: "/post",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(formData),
      success: function (response) {
        renderPosts(response.posts);
      },
      error: function () {
        $("#posts-container").html(
          "<p>An error occurred while processing your request.</p>"
        );
      }
    });
  });

  // Click event for edit button
  $("#posts-container").on("click", ".edit", function () {
    const postId = $(this).data("postid");
    window.location.replace(`/post/edit/${postId}`);
  });

  // Click event for delete button
  $("#posts-container").on("click", ".delete", function () {
    const postId = $(this).data("postid");
    window.location.replace(`/post/delete/${postId}`);
  });

  // Click event for comments
  $("#posts-container").on("click", ".comments", function () {
    const postId = $(this).data("postid");
    window.location.replace(`/post/${postId}/#comments-div`);
  });

  // Click event for likes
  $("#posts-container").on("click", ".likes", function () {
    const $like = $(this);
    const postId = $(this).data("postid");
    const userId = $("#posts-container").data("user");
    if (!userId) {
      alert("Please login to like a post");
      window.location.replace("/login");
      return;
    }
    $.ajax({
      url: `/post/${postId}/like`,
      method: "POST",
      success: function (response) {
        if (response.state === true) {
          $like.addClass("red-icon");
        } else {
          $like.removeClass("red-icon");
        }
        $like.find("#like").text(response.likes);
      },
      error: function () {
        alert("An error occurred while processing your request.");
      }
    });
  });
});
