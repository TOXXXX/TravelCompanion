import Route from "../models/routes.js";

export const createRoute = async (routeData) => {
  try {
    const newRoute = new Route(routeData);
    await newRoute.save();
    return newRoute;
  } catch (error) {
    throw new Error(`Unable to create route: ${error.message}`);
  }
};
