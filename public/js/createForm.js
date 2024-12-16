mapboxgl.accessToken = "{{MAPBOX_ACCESS_TOKEN}}";

const waypoints = [
  {
    geocoderId: "geocoder-1",
    hiddenInputId: "waypoint-1-coordinates",
    nameInputId: "waypoint-1-name"
  },
  {
    geocoderId: "geocoder-2",
    hiddenInputId: "waypoint-2-coordinates",
    nameInputId: "waypoint-2-name"
  }
];

//console.log(waypoints);

waypoints.forEach(({ geocoderId, hiddenInputId, nameInputId }) => {
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    language: "en-US",
    placeholder: "Search for a location..."
  });

  document.getElementById(geocoderId).appendChild(geocoder.onAdd());

  geocoder.on("result", (e) => {
    const { center, place_name } = e.result;
    //console.log("place name:", place_name);
    //console.log(typeof(place_name));
    document.getElementById(hiddenInputId).value = `${center[0]},${center[1]}`;
    document.getElementById(nameInputId).value = place_name;
  });
});

// Client-Side Validation for Route Name
const routeForm = document.getElementById("route-form");
const routeNameInput = document.getElementById("route-name");
const routeNameError = document.getElementById("route-name-error");

const routeDescriptionInput = document.getElementById("route-description");
const routeDescriptionError = document.getElementById(
  "route-description-error"
);

const routeDurationInput = document.getElementById("route-duration");
const routeDurationError = document.getElementById("route-duration-error");

const waypoint1DescriptionInput = document.getElementById(
  "waypoint-1-description"
);
const waypoint1DescriptionError = document.getElementById(
  "waypoint-1-description-error"
);

const waypoint2DescriptionInput = document.getElementById(
  "waypoint-2-description"
);
const waypoint2DescriptionError = document.getElementById(
  "waypoint-2-description-error"
);

if (
  routeForm &&
  routeNameInput &&
  routeNameError &&
  routeDescriptionInput &&
  routeDescriptionError &&
  routeDurationInput &&
  routeDurationError &&
  waypoint1DescriptionInput &&
  waypoint1DescriptionError &&
  waypoint2DescriptionInput &&
  waypoint2DescriptionError
) {
  function validateRouteName() {
    const routeNameRegex = /^[A-Za-z_]+$/;
    const value = routeNameInput.value.trim();
    if (!routeNameRegex.test(value)) {
      routeNameError.textContent =
        "Route name can only contain letters and underscore.";
      routeNameError.classList.add("active");
      routeNameInput.classList.add("invalid");
      return false;
    } else {
      routeNameError.textContent = "";
      routeNameError.classList.remove("active");
      routeNameInput.classList.remove("invalid");
      return true;
    }
  }

  function validateDescription(input, errorElement) {
    const descriptionRegex = /^[A-Za-z0-9\s.,!?-]*$/;
    const value = input.value.trim();
    if (!descriptionRegex.test(value)) {
      errorElement.textContent =
        "Description can only contain letters, numbers, spaces, and common punctuation (.,!?-).";
      errorElement.classList.add("active");
      input.classList.add("invalid");
      return false;
    } else {
      errorElement.textContent = "";
      errorElement.classList.remove("active");
      input.classList.remove("invalid");
      return true;
    }
  }

  function validateRouteDuration() {
    const value = routeDurationInput.value.trim();
    const duration = Number(value);
    if (value === "" || isNaN(duration) || duration < 1) {
      routeDurationError.textContent =
        "Trip duration must be a number greater than or equal to 1.";
      routeDurationError.classList.add("active");
      routeDurationInput.classList.add("invalid");
      return false;
    } else {
      routeDurationError.textContent = "";
      routeDurationError.classList.remove("active");
      routeDurationInput.classList.remove("invalid");
      return true;
    }
  }

  routeForm.addEventListener("submit", function (event) {
    const isRouteNameValid = validateRouteName();
    const isRouteDescriptionValid = validateDescription(
      routeDescriptionInput,
      routeDescriptionError
    );
    const isRouteDurationValid = validateRouteDuration();
    const isWaypoint1DescriptionValid = validateDescription(
      waypoint1DescriptionInput,
      waypoint1DescriptionError
    );
    const isWaypoint2DescriptionValid = validateDescription(
      waypoint2DescriptionInput,
      waypoint2DescriptionError
    );

    if (
      !isRouteNameValid ||
      !isRouteDescriptionValid ||
      !isWaypoint1DescriptionValid ||
      !isWaypoint2DescriptionValid
    ) {
      event.preventDefault();
      console.log("Form submission prevented due to validation errors.");
    } else {
      console.log("Form validation passed. Submitting form.");
    }
  });

  routeNameInput.addEventListener("input", validateRouteName);

  routeDescriptionInput.addEventListener("input", function () {
    validateDescription(routeDescriptionInput, routeDescriptionError);
  });

  routeDurationInput.addEventListener("input", validateRouteDuration);

  waypoint1DescriptionInput.addEventListener("input", function () {
    validateDescription(waypoint1DescriptionInput, waypoint1DescriptionError);
  });

  waypoint2DescriptionInput.addEventListener("input", function () {
    validateDescription(waypoint2DescriptionInput, waypoint2DescriptionError);
  });
} else {
  console.error(
    "Form, Route Name input, or Error message container not found."
  );
}
