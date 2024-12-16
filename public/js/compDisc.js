$(document).ready(function () {
  $("#user-search-form").on("submit", function (e) {
    e.preventDefault();

    const searchTerm = $("#search-input").val().trim();

    if (!searchTerm) {
      alert("Please enter a search term.");
      return;
    }

    $.ajax({
      url: "/companions/search",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ search: searchTerm }),
      success: function (data) {
        // Clear previous results
        const $resultsContainer = $("#search-results-container");
        $resultsContainer.empty();

        // Check if users were found
        if (data && data.length > 0) {
          // Create results HTML
          const $resultsList = $('<ul id="search-results"></ul>');

          data.forEach(function (user) {
            const $userItem = $(`
                <div class="companion-div search-result">
                  <li class="companion">
                    <a href="/personal/${user.userName}">
                      <img src="${user.profilePic}" alt="Profile Picture" class="profile-pic">
                      <h2>${user.userName}</h2>
                    </a>
                    <p>About me: <br>${user.bio}</p>
                    <p>Contact me at: ${user.email}</p>
                  </li>
                </div>
              `);

            $resultsList.append($userItem);
          });

          // Add results to container
          $resultsContainer.append("<h3>Search Results</h3>", $resultsList);

          $resultsContainer.append($resetButton);
        } else {
          $resultsContainer.html("<p>No users found matching your search.</p>");
        }
      },
      error: function (xhr, status, error) {
        console.error("Search error:", error);
        $("#search-results-container").html(
          "<p>An error occurred while searching. Please try again.</p>"
        );
      }
    });
  });
});
