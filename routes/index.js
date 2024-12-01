import authRoutes from "./auth.js";
import homeRoutes from "./home.js";
import routeRoutes from "./routes.js";

// Wrapper function to register routes
const registerRoutes = (app) => {
  app.use("/", homeRoutes);
  app.use("/", authRoutes);
  app.use("/", routeRoutes);
};

export default registerRoutes;
