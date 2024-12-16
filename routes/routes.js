import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Route from "../models/routes.js";
import Post from "../models/posts.js";
import User from "../models/users.js";
import { isAuthenticated } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

router.get("/new/:postId", isAuthenticated, async (req, res) => {
  const { postId } = req.params;
  let postOwner = await Post.findById(postId);
  if (postOwner) {
    postOwner = postOwner.uid;
    if (postOwner.toString() !== req.session.userId.toString()) {
      return res.status(403).render("error", {
        message: "You are not authorized to create a route for this post."
      });
    }
  } else {
    return res.status(404).render("error", {
      message: "Post owner not found in this post."
    });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found.");
    }

    res.render("create-route", {
      pageHeading: "Create new route",
      customCSS: "create-route",
      MAPBOX_ACCESS_TOKEN,
      postId
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error.");
  }
});

router.post("/new/:postId", isAuthenticated, async (req, res) => {
  const { postId } = req.params;
  const action = req.body.action;

  const post = await Post.findById(postId);
  const routeOwnerId = post.uid;
  if (routeOwnerId.toString() !== req.session.userId.toString()) {
    return res.status(403).render("error", {
      message: "You are not authorized to create a route for this post."
    });
  }

  let {
    "route-name": routeName,
    "route-description": routeDesc,
    "route-duration": routeDuration,
    "waypoint-1-coordinates": waypoint1Coordinates,
    "waypoint-2-coordinates": waypoint2Coordinates,
    "waypoint-1-name": waypoint1Name,
    "waypoint-2-name": waypoint2Name,
    "waypoint-1-description": waypoint1Description,
    "waypoint-2-description": waypoint2Description,
    "route-type": routeType
  } = req.body;

  routeName = routeName?.trim();
  routeDesc = routeDesc?.trim();
  routeDuration = routeDuration?.trim();
  waypoint1Description = waypoint1Description?.trim();
  waypoint2Description = waypoint2Description?.trim();
  waypoint1Name = waypoint1Name?.trim();
  waypoint2Name = waypoint2Name?.trim();
  routeType = routeType?.trim();

  // Server-Side Validation
  if (!routeName) {
    //return res.status(400).send("Route name is required and cannot be empty.");
    return res.status(400).render("error", {
      message: "Route name is required and cannot be empty."
    });
  }

  if (!routeDuration) {
    //return res.status(400).send("Trip duration is required and cannot be empty.");
    return res.status(400).render("error", {
      message: "Trip duration is required and cannot be empty."
    });
  }

  if (!routeType) {
    //return res.status(400).send("Route type is required and cannot be empty.");
    return res.status(400).render("error", {
      message: "Route type is required and cannot be empty."
    });
  }

  if (!waypoint1Coordinates || !waypoint2Coordinates) {
    //return res.status(400).send("Both origin and destination waypoints are required.");
    return res.status(400).render("error", {
      message: "Both origin and destination waypoints are required."
    });
  }

  const routeNameRegex = /^[A-Za-z_]+$/;
  if (!routeNameRegex.test(routeName)) {
    //return res.status(400).send("Invalid Route Name. Only letters and spaces are allowed.");
    return res.status(404).render("error", {
      message: "Invalid Route Name. Only letters and spaces are allowed."
    });
  }

  if (routeDesc && !/^[A-Za-z0-9\s.,!?-]*$/.test(routeDesc)) {
    //return res.status(400).send("Invalid Route Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed.");
    return res.status(404).render("error", {
      message:
        "Invalid Route Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed."
    });
  }

  const durationNumber = Number(routeDuration);
  if (isNaN(durationNumber) || durationNumber < 1) {
    //return res.status(400).send("Invalid Trip Duration. It must be a number greater than or equal to 1.");
    return res.status(404).render("error", {
      message:
        "Invalid Trip Duration. It must be a number greater than or equal to 1."
    });
  }

  if (
    waypoint1Description &&
    !/^[A-Za-z0-9\s.,!?-]*$/.test(waypoint1Description)
  ) {
    //return res.status(400).send("Invalid Waypoint 1 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed.");
    return res.status(404).render("error", {
      message:
        "Invalid Waypoint 1 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed."
    });
  }

  if (
    waypoint2Description &&
    !/^[A-Za-z0-9\s.,!?-]*$/.test(waypoint2Description)
  ) {
    //return res.status(400).send("Invalid Waypoint 2 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed.");
    return res.status(404).render("error", {
      message:
        "Invalid Waypoint 2 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed."
    });
  }

  if (!waypoint1Coordinates || !waypoint2Coordinates) {
    //return res.status(400).send("Waypoints are required.");
    return res.status(404).render("error", {
      message: "Waypoints are required."
    });
  }
  if (!routeName) {
    //return res.status(400).send("Route name is required.");
    return res.status(404).render("error", {
      message: "Route name is required."
    });
  }
  if (!routeType) {
    //return res.status(400).send("Route type is required");
    return res.status(400).render("error", {
      message: "Route type is required"
    });
  }

  try {
    const [lng1, lat1] = waypoint1Coordinates
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    const [lng2, lat2] = waypoint2Coordinates
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    const profileMapping = {
      driving: "mapbox/driving",
      walking: "mapbox/walking",
      cycling: "mapbox/cycling"
    };
    const profile = profileMapping[routeType] || "mapbox/driving";

    const directionsUrl = `https://api.mapbox.com/directions/v5/${profile}/${lng1},${lat1};${lng2},${lat2}`;
    const directionsResponse = await axios.get(directionsUrl, {
      params: {
        access_token: MAPBOX_ACCESS_TOKEN,
        steps: true,
        geometries: "polyline"
      }
    });

    const directionsData = directionsResponse.data;
    if (!directionsData.routes || directionsData.routes.length === 0) {
      //return res.status(404).send('No routes found');
      return res.status(404).render("error", {
        message: "No routes found"
      });
    }

    const route = directionsData.routes[0];
    const encodedPolyline = route.geometry;

    const distanceInMeters = route.distance;
    const durationInSeconds = route.duration;

    const distanceInKm = (distanceInMeters / 1000).toFixed(2);

    const durationInMinutes = Math.floor(durationInSeconds / 60);
    const durationInHours = Math.floor(durationInMinutes / 60);
    const remainingMinutes = durationInMinutes % 60;

    let formattedDuration = "";
    if (durationInHours > 0) {
      formattedDuration += `${durationInHours} hour${durationInHours > 1 ? "s" : ""} `;
    }
    if (remainingMinutes > 0) {
      formattedDuration += `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
    }
    if (formattedDuration === "") {
      formattedDuration = "Less than a minute";
    }

    const steps = route.legs[0].steps;
    const instructions = steps.map((step) => step.maneuver.instruction);

    const encodedPolylineEscaped = encodeURIComponent(encodedPolyline);
    const pathOverlay = `path-5+f44-0.8(${encodedPolylineEscaped})`;
    const startPin = `pin-s+FF0000(${lng1},${lat1})`;
    const endPin = `pin-s+00FF00(${lng2},${lat2})`;

    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${pathOverlay},${startPin},${endPin}/auto/800x400@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;

    const response = await axios.get(mapUrl, { responseType: "arraybuffer" });

    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    const mapDataUrl = `data:image/png;base64,${base64Image}`;

    const uid = req.session.userId;

    let routeDoc = await Route.findOne({ postId, routeName, uid });

    if (!routeDoc) {
      routeDoc = new Route({
        uid,
        postId,
        routeName,
        routeDesc,
        tripDuration: durationNumber,
        origin: {
          name: waypoint1Name || "Origin",
          coordinates: [lng1, lat1],
          description: waypoint1Description
        },
        destination: {
          name: waypoint2Name || "Destination",
          coordinates: [lng2, lat2],
          description: waypoint2Description
        },
        routeType,
        mapDataUrl,
        distance: `${distanceInKm} km`,
        duration: formattedDuration
      });

      await routeDoc.save();
    }

    if (action === "createRoute") {
      return res.render("create-route", {
        pageHeading: "Review your route",
        customCSS: "create-route",
        MAPBOX_ACCESS_TOKEN,
        postId,
        instructions,
        mapDataUrl,
        routeName,
        routeDesc,
        routeDuration: durationNumber,
        waypoint1Name,
        waypoint2Name,
        waypoint1Description,
        waypoint2Description,
        routeType,
        distance: `${distanceInKm} km`,
        duration: formattedDuration,
        hideCreateBtn: true
      });
    } else {
      return res.status(400).json({ error: "Invalid action." });
    }
  } catch (error) {
    return res.status(500).render("error", {
      message: "Failed to generate map URL."
    });
  }
});

router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const route = await Route.findOne({ postId });
    const isRouteOwner = route.uid.toString() == req.session.userId;

    const routeOwner = await User.findById(route.uid);
    if (routeOwner.isHidden) {
      return res.status(403).render("error", {
        message: "This user's route is hidden from public view."
      });
    }

    if (!route) {
      return res.status(404).render("error", { message: "Route not found." });
    }
    const post = await Post.findById(postId);
    return res.render("route-detail", {
      customCSS: "create-route",
      route,
      post,
      isRouteOwner: isRouteOwner
    });
  } catch (e) {
    console.error(e);
    return res.status(404).render("error", {
      message: e.message
    });
  }
});

router.get("/edit/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const route = await Route.findById(id);
    if (!route) {
      return res.status(404).render("error", { message: "Route not found." });
    }

    const routeOwnerId = route.uid;
    if (routeOwnerId.toString() !== req.session.userId.toString()) {
      return res.status(403).render("error", {
        message: "You are not authorized to create a route for this post."
      });
    }

    console.log({ ...route.toJSON() });

    res.render("create-route", {
      pageHeading: `Edit route: ${route.routeName}`,
      customCSS: "create-route",
      MAPBOX_ACCESS_TOKEN,
      ...route.toJSON(),
      routeId: route._id,
      routeDuration: route?.tripDuration,
      isEdit: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { message: "Server Error." });
  }
});

router.post("/edit/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  const route = await Route.findById(id);

  const routeOwnerId = route.uid;
  if (routeOwnerId.toString() !== req.session.userId.toString()) {
    return res.status(403).render("error", {
      message: "You are not authorized to edit this route."
    });
  }

  const {
    "route-name": routeName,
    "route-description": routeDesc,
    "route-duration": routeDuration,
    "waypoint-1-coordinates": waypoint1Coordinates,
    "waypoint-2-coordinates": waypoint2Coordinates,
    "waypoint-1-name": waypoint1Name,
    "waypoint-2-name": waypoint2Name,
    "waypoint-1-description": waypoint1Description,
    "waypoint-2-description": waypoint2Description,
    "route-type": routeType
  } = req.body;

  // Trim inputs
  const trimmedData = {
    routeName: routeName?.trim(),
    routeDesc: routeDesc?.trim(),
    routeDuration: routeDuration?.trim(),
    waypoint1Coordinates: waypoint1Coordinates?.trim(),
    waypoint2Coordinates: waypoint2Coordinates?.trim(),
    waypoint1Name: waypoint1Name?.trim(),
    waypoint2Name: waypoint2Name?.trim(),
    waypoint1Description: waypoint1Description?.trim(),
    waypoint2Description: waypoint2Description?.trim(),
    routeType: routeType?.trim()
  };

  // Server-Side Validation
  const errors = [];

  if (!trimmedData.routeName) {
    errors.push("Route name is required and cannot be empty.");
  }

  if (!trimmedData.routeDuration) {
    errors.push("Trip duration is required and cannot be empty.");
  }

  if (!trimmedData.routeType) {
    errors.push("Route type is required and cannot be empty.");
  }

  if (!trimmedData.waypoint1Coordinates || !trimmedData.waypoint2Coordinates) {
    errors.push("Both origin and destination waypoints are required.");
  }

  const routeNameRegex = /^[A-Za-z_]+$/;
  if (!routeNameRegex.test(trimmedData.routeName)) {
    errors.push(
      "Invalid Route Name. Only letters and underscores are allowed."
    );
  }

  const descriptionRegex = /^[A-Za-z0-9\s.,!?-]*$/;
  if (trimmedData.routeDesc && !descriptionRegex.test(trimmedData.routeDesc)) {
    errors.push(
      "Invalid Route Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed."
    );
  }

  const durationNumber = Number(trimmedData.routeDuration);
  if (isNaN(durationNumber) || durationNumber < 1) {
    errors.push(
      "Invalid Trip Duration. It must be a number greater than or equal to 1."
    );
  }

  if (
    trimmedData.waypoint1Description &&
    !descriptionRegex.test(trimmedData.waypoint1Description)
  ) {
    errors.push(
      "Invalid Waypoint 1 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed."
    );
  }

  if (
    trimmedData.waypoint2Description &&
    !descriptionRegex.test(trimmedData.waypoint2Description)
  ) {
    errors.push(
      "Invalid Waypoint 2 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed."
    );
  }

  if (errors.length > 0) {
    return res.status(400).render("error", { message: errors.join(" ") });
  }

  try {
    const [lng1, lat1] = waypoint1Coordinates
      .split(",")
      .map((coord) => parseFloat(coord.trim()));
    const [lng2, lat2] = waypoint2Coordinates
      .split(",")
      .map((coord) => parseFloat(coord.trim()));

    const profileMapping = {
      driving: "mapbox/driving",
      walking: "mapbox/walking",
      cycling: "mapbox/cycling"
    };
    const profile = profileMapping[routeType] || "mapbox/driving";

    const directionsUrl = `https://api.mapbox.com/directions/v5/${profile}/${lng1},${lat1};${lng2},${lat2}`;
    const directionsResponse = await axios.get(directionsUrl, {
      params: {
        access_token: MAPBOX_ACCESS_TOKEN,
        steps: true,
        geometries: "polyline"
      }
    });

    const directionsData = directionsResponse.data;
    if (!directionsData.routes || directionsData.routes.length === 0) {
      //return res.status(404).send('No routes found');
      return res.status(404).render("error", {
        message: "No routes found"
      });
    }

    const route = directionsData.routes[0];
    const encodedPolyline = route.geometry;

    const durationInSeconds = route.duration;

    const durationInMinutes = Math.floor(durationInSeconds / 60);
    const durationInHours = Math.floor(durationInMinutes / 60);
    const remainingMinutes = durationInMinutes % 60;

    const distanceInMeters = route.distance;
    const distanceInKm = (distanceInMeters / 1000).toFixed(2);

    let formattedDuration = "";
    if (durationInHours > 0) {
      formattedDuration += `${durationInHours} hour${durationInHours > 1 ? "s" : ""} `;
    }
    if (remainingMinutes > 0) {
      formattedDuration += `${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
    }
    if (formattedDuration === "") {
      formattedDuration = "Less than a minute";
    }

    const encodedPolylineEscaped = encodeURIComponent(encodedPolyline);
    const pathOverlay = `path-5+f44-0.8(${encodedPolylineEscaped})`;
    const startPin = `pin-s+FF0000(${lng1},${lat1})`;
    const endPin = `pin-s+00FF00(${lng2},${lat2})`;

    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${pathOverlay},${startPin},${endPin}/auto/800x400@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;

    const response = await axios.get(mapUrl, { responseType: "arraybuffer" });

    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    const mapDataUrl = `data:image/png;base64,${base64Image}`;
    // Update Route Document
    const updatedRoute = await Route.findByIdAndUpdate(
      id,
      {
        routeName: trimmedData.routeName,
        routeDesc: trimmedData.routeDesc,
        tripDuration: durationNumber,
        origin: {
          name: trimmedData.waypoint1Name || "Origin",
          coordinates: [lng1, lat1],
          description: trimmedData.waypoint1Description
        },
        destination: {
          name: trimmedData.waypoint2Name || "Destination",
          coordinates: [lng2, lat2],
          description: trimmedData.waypoint2Description
        },
        routeType: trimmedData.routeType,
        mapDataUrl,
        distance: `${distanceInKm} km`,
        duration: formattedDuration
      },
      { new: true, runValidators: true }
    );
    if (!updatedRoute) {
      return res.status(404).render("error", { message: "Route not found." });
    }
    res.redirect(`/post/${updatedRoute.postId}`);
  } catch (error) {
    console.error("Failed to update route:", error);
    res.status(500).render("error", { message: "Failed to update route." });
  }
});

router.post("/delete/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  const route = await Route.findById(id);
  const routeOwnerId = route.uid;
  if (routeOwnerId.toString() !== req.session.userId.toString()) {
    return res.status(403).render("error", {
      message: "You are not authorized to delete this route."
    });
  }

  try {
    const route = await Route.findByIdAndDelete(id);
    if (!route) {
      return res.status(404).render("error", { message: "Route not found." });
    }

    // Redirect to original post
    res.redirect(`/post/${route.postId}`);
  } catch (error) {
    console.error("Failed to delete route:", error.message);
    res.status(500).render("error", { message: "Failed to delete route." });
  }
});

export default router;
