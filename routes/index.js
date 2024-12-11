import authRoutes from "./auth.js";
import homeRoutes from "./home.js";
import postRoutes from "./post.js";
import personalRoutes from "./personal.js";
// Wrapper function to register routes
const registerRoutes = (app) => {
  app.use("/", homeRoutes);
  app.use("/", authRoutes);
  app.use("/post", postRoutes);
  app.use("/personal", personalRoutes);
};

export default registerRoutes;
