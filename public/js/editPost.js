post = document.getElementById("create-post");

(() => {
  if (post) {
    postType = post.getElementById("post-type");
    if ((postType.value = "route")) {
      startDiv = post.getElementById("start-div");
      endDiv = post.getElementById("end-div");
      startDiv.style.display = "none";
      endDiv.style.display = "none";
    }
  }
})();
