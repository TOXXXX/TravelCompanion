import authRoutes from "./auth.js";

// Wrapper function to register routes
const registerRoutes = (app) => {
  app.use("/", authRoutes);
};

export default registerRoutes;
