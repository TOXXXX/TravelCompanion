import express from "express";
import axios from "axios";
import dotenv from 'dotenv';
import Route from '../models/routes.js';
import Post from '../models/posts.js';

dotenv.config();

const router = express.Router();
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

router.get("/new/:postId", async(req, res) => {
  const { postId } = req.params;
  // console.log(`Mapbox Token: ${MAPBOX_ACCESS_TOKEN}`);
  // console.log(postId);
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found.");
    }

    res.render("create-route", {
      title: "Create Route",
      customCSS: "create-route",
      MAPBOX_ACCESS_TOKEN,
      postId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error.");
  }
});

router.post("/new/:postId", async(req, res) => {
  const { postId } = req.params;
  const action = req.body.action;
  let {
    'route-name': routeName,
    'route-description': routeDesc,
    'route-duration': routeDuration,
    'waypoint-1-coordinates': waypoint1Coordinates,
    'waypoint-2-coordinates': waypoint2Coordinates,
    'waypoint-1-name': waypoint1Name,
    'waypoint-2-name': waypoint2Name,
    'waypoint-1-description': waypoint1Description,
    'waypoint-2-description': waypoint2Description,
    'route-type': routeType,
  } = req.body;

  //console.log(req.body, {routeType});
    routeName = routeName.trim();
    routeDesc = routeDesc.trim();
    routeDuration = routeDuration.trim();
    waypoint1Description = waypoint1Description.trim();
    waypoint2Description = waypoint2Description.trim();
    waypoint1Name = waypoint1Name.trim();
    waypoint2Name = waypoint2Name.trim();
    routeType = routeType.trim();

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
        message: "Invalid Route Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed."
    });
    }

    const durationNumber = Number(routeDuration);
    if (isNaN(durationNumber) || durationNumber < 1) {
      //return res.status(400).send("Invalid Trip Duration. It must be a number greater than or equal to 1.");
      return res.status(404).render("error", {
        message: "Invalid Trip Duration. It must be a number greater than or equal to 1."
    });
    }

    if (waypoint1Description && !/^[A-Za-z0-9\s.,!?-]*$/.test(waypoint1Description)) {
      //return res.status(400).send("Invalid Waypoint 1 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed.");
      return res.status(404).render("error", {
        message: "Invalid Waypoint 1 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed."
    });
    }

    if (waypoint2Description && !/^[A-Za-z0-9\s.,!?-]*$/.test(waypoint2Description)) {
      //return res.status(400).send("Invalid Waypoint 2 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed.");
      return res.status(404).render("error", {
        message: "Invalid Waypoint 2 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed."
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
    if(!routeType){
      //return res.status(400).send("Route type is required");
      return res.status(400).render("error", {
        message: "Route type is required"
    });
    }
  
  try {
    const [lng1, lat1] = waypoint1Coordinates.split(",").map((coord) => parseFloat(coord.trim()));
    const [lng2, lat2] = waypoint2Coordinates.split(",").map((coord) => parseFloat(coord.trim()));

    const profileMapping = {
      driving: 'mapbox/driving',
      walking: 'mapbox/walking',
      cycling: 'mapbox/cycling'
    };
    const profile = profileMapping[routeType] || 'mapbox/driving';
    //console.log("profile;", profile);

    const directionsUrl = `https://api.mapbox.com/directions/v5/${profile}/${lng1},${lat1};${lng2},${lat2}`;
    const directionsResponse = await axios.get(directionsUrl, {
      params: {
        access_token: MAPBOX_ACCESS_TOKEN,
        steps: true,
        geometries: 'polyline' 
      }
    });

    // console.log(directionsUrl, {
    //   access_token: MAPBOX_ACCESS_TOKEN,
    //   steps: true,
    //   geometries: 'polyline' 
    // });

    //console.log("directionURL:", directionsUrl);

    const directionsData = directionsResponse.data;
    if (!directionsData.routes || directionsData.routes.length === 0) {
      //return res.status(404).send('No routes found');
      return res.status(404).render("error", {
        message: "No routes found"
    });
  }

    //console.log("direactions data :", directionsData);

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
      formattedDuration += `${durationInHours} hour${durationInHours > 1 ? 's' : ''} `;
    }
    if (remainingMinutes > 0) {
      formattedDuration += `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    }
    if (formattedDuration === "") {
      formattedDuration = "Less than a minute";
    }

    const steps = route.legs[0].steps;
    const instructions = steps.map(step => step.maneuver.instruction);

    const encodedPolylineEscaped = encodeURIComponent(encodedPolyline);
    const pathOverlay = `path-5+f44-0.8(${encodedPolylineEscaped})`;
    const startPin = `pin-s+FF0000(${lng1},${lat1})`;
    const endPin = `pin-s+00FF00(${lng2},${lat2})`;

    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${pathOverlay},${startPin},${endPin}/auto/800x400@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;

    //console.log("mapUrl:", mapUrl);
    //const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+FF0000(${lng1},${lat1}),pin-s-l+00FF00(${lng2},${lat2})/auto/800x400@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
    //console.log({mapUrl})
    const response = await axios.get(mapUrl, { responseType: 'arraybuffer' });
    //console.log("response :", response);

    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const mapDataUrl = `data:image/png;base64,${base64Image}`;

    if(action === "createRoute"){
      res.render("create-route", {
        title: "Create Route",
        mapDataUrl,
        customCSS: "create-route",
        MAPBOX_ACCESS_TOKEN,
        instructions,
        routeName,
        routeDesc,
        routeDuration,
        waypoint1Name,
        waypoint2Name,
        waypoint1Description,
        waypoint2Description,
        routeType,
        distance: `${distanceInKm} km`,
        duration: formattedDuration
      });
    const uid = req.session.userId;
    const routeDoc = new Route({
      uid,
      postId,
      routeName,
      routeDesc,
      tripDuration: routeDuration ? parseInt(routeDuration, 10) : undefined,
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
      mapDataUrl
    });

    await routeDoc.save();
    return res.redirect(`/post/${postId}`);
  }
     
  } catch (error) {
    //console.error("Error generating map URL:", error.message);
    //res.status(500).send("Failed to generate map URL.");
    return res.status(500).render("error", {
      message: "Failed to generate map URL."
    });
  }
});

router.get("/:postId", async (req, res) => {
  try {
    //const route = await Route.findById(${}) 
    return res.render("route-detail", {
      title: `Route: ${route.routeName}`,
      customCSS: "routes",
      route: route,
      post: post,
      alertMessage: req.query.alert || null // Pass alert message if any
    });
  } catch (e) {
    console.error(e);
    return res.status(404).render("error", {
      message: e.message
    });
  }
});

router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const route = await Route.findById(id);
    if (!route) {
      return res.status(404).render("error", { message: "Route not found." });
    }
    
    res.render("edit-route", { 
      route,
      MAPBOX_ACCESS_TOKEN
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { message: "Server Error." });
  }
});

router.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const {
    'route-name': routeName,
    'route-description': routeDesc,
    'route-duration': routeDuration,
    'waypoint-1-coordinates': waypoint1Coordinates,
    'waypoint-2-coordinates': waypoint2Coordinates,
    'waypoint-1-name': waypoint1Name,
    'waypoint-2-name': waypoint2Name,
    'waypoint-1-description': waypoint1Description,
    'waypoint-2-description': waypoint2Description,
    'route-type': routeType,
  } = req.body;

  // Trim inputs
  const trimmedData = {
    routeName: routeName.trim(),
    routeDesc: routeDesc.trim(),
    routeDuration: routeDuration.trim(),
    waypoint1Coordinates: waypoint1Coordinates.trim(),
    waypoint2Coordinates: waypoint2Coordinates.trim(),
    waypoint1Name: waypoint1Name.trim(),
    waypoint2Name: waypoint2Name.trim(),
    waypoint1Description: waypoint1Description.trim(),
    waypoint2Description: waypoint2Description.trim(),
    routeType: routeType.trim(),
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
    errors.push("Invalid Route Name. Only letters and underscores are allowed.");
  }

  const descriptionRegex = /^[A-Za-z0-9\s.,!?-]*$/;
  if (trimmedData.routeDesc && !descriptionRegex.test(trimmedData.routeDesc)) {
    errors.push("Invalid Route Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed.");
  }

  const durationNumber = Number(trimmedData.routeDuration);
  if (isNaN(durationNumber) || durationNumber < 1) {
    errors.push("Invalid Trip Duration. It must be a number greater than or equal to 1.");
  }

  if (trimmedData.waypoint1Description && !descriptionRegex.test(trimmedData.waypoint1Description)) {
    errors.push("Invalid Waypoint 1 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed.");
  }

  if (trimmedData.waypoint2Description && !descriptionRegex.test(trimmedData.waypoint2Description)) {
    errors.push("Invalid Waypoint 2 Description. Only letters, numbers, spaces, and common punctuation (.,!?-) are allowed.");
  }

  if (errors.length > 0) {
    return res.status(400).render("error", { message: errors.join(" ") });
  }

  try {
    const [lng1, lat1] = trimmedData.waypoint1Coordinates.split(",").map(coord => parseFloat(coord.trim()));
    const [lng2, lat2] = trimmedData.waypoint2Coordinates.split(",").map(coord => parseFloat(coord.trim()));

    const encodedPolylineEscaped = encodeURIComponent(encodedPolyline);
    const pathOverlay = `path-5+f44-0.8(${encodedPolylineEscaped})`;
    const startPin = `pin-s+FF0000(${lng1},${lat1})`;
    const endPin = `pin-s+00FF00(${lng2},${lat2})`;

    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${pathOverlay},${startPin},${endPin}/auto/800x400@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;

    //console.log("mapUrl:", mapUrl);
    //const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+FF0000(${lng1},${lat1}),pin-s-l+00FF00(${lng2},${lat2})/auto/800x400@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
    //console.log({mapUrl})
    const response = await axios.get(mapUrl, { responseType: 'arraybuffer' });
    //console.log("response :", response);

    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const mapDataUrl = `data:image/png;base64,${base64Image}`;

    // Update Route Document
    const updatedRoute = await Route.findByIdAndUpdate(id, {
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
      mapDataUrl
    }, { new: true, runValidators: true });

    if (!updatedRoute) {
      return res.status(404).render("error", { message: "Route not found." });
    }
    res.redirect(`/`);
  } catch (error) {
    console.error("Failed to update route:", error.message);
    res.status(500).render("error", { message: "Failed to update route." });
  }

});

router.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const route = await Route.findByIdAndDelete(id);
    if (!route) {
      return res.status(404).render("error", { message: "Route not found." });
    }
    
    // Redirect to home with success alert
    res.redirect(`/`);
  } catch (error) {
    console.error("Failed to delete route:", error.message);
    res.status(500).render("error", { message: "Failed to delete route." });
  }
});

export default router;