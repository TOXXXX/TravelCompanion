(() => {
  let post = document.getElementById("create-post");
  if (post) {
    post.addEventListener("change", (event) => {
      let postType = document.getElementById("post-type");
      let startDiv = document.getElementById("start-div");
      let endDiv = document.getElementById("end-div");
      console.log("before if");
      if (postType.value == "route") {
        console.log("in if");
        startDiv.style.display = "none";
        endDiv.style.display = "none";
      } else {
        console.log("in else");
        startDiv.style.display = "block";
        endDiv.style.display = "block";
      }
    });
  }
})();
