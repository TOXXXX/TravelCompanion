import authRoutes from "./auth.js";
import homeRoutes from "./home.js";
import postRoutes from "./post.js";
import personalRoutes from "./personal.js";
import mapRoutes from "./routes.js";
import compDiscRoutes from "./compDisc.js";

// Wrapper function to register routes
const registerRoutes = (app) => {
  app.use("/", homeRoutes);
  app.use("/", authRoutes);
  app.use("/post", postRoutes);
  app.use("/personal", personalRoutes);
  app.use("/route", mapRoutes);
  app.use("/companions", compDiscRoutes);
  app.use("/route", mapRoutes);
};

export default registerRoutes;
