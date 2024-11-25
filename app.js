import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import registerRoutes from "./routes/index.js";
import seedDatabase from "./seed.js";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await seedDatabase();

    app.use(express.json());

    app.use(
      session({
        secret: process.env.SECRET_KEY, // Use the secret key from .env file
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: process.env.MONGO_URI, // Your MongoDB connection string
          ttl: 14 * 24 * 60 * 60 // Time to live in seconds (14 days here)
        }),
        cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
        name: "sessionId"
      })
    );

    registerRoutes(app);

    app.listen(port, async () => {
      await connectDB();
      console.log("We've now got a server!");
      console.log(`Your routes will be running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1); // Exit the process with a non-zero status code
  }
};

startServer();
