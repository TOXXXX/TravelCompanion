import Route from "../models/routes.js";

export const createRoute = async (uid, postID, routes) => {
  try {
    const newRoute = new Route({ uid, postID, routes });
    await newRoute.save();
    return newRoute;
  } catch (error) {
    throw new Error(`Unable to create route: ${error.message}`);
  }
};
