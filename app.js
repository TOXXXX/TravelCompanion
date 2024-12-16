import express from "express";
import handlebars from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
import registerRoutes from "./routes/index.js";
import seedDatabase from "./seed.js";
import flash from "connect-flash";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { setAuth } from "./middleware/auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const hbs = handlebars.create({
  defaultLayout: "main",
  helpers: {
    default: (value, defaultValue) => {
      return value || defaultValue;
    },
    ifEquals: function (arg1, arg2, options) {
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    },
    json: (context) => {
      return JSON.stringify(context);
    },
    eq: (a, b) => a === b,
    or: (a, b) => a || b,
    and: (a, b) => a && b,
    not: (a) => !a,
    formatDate: (date) => {
      if (!date) return "Unknown Date";
      return new Date(date).toDateString(); // Format date as "Mon DD YYYY"
    },
    default: (value, defaultValue) => value || defaultValue,
    json: (context) => JSON.stringify(context)
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
});
app.engine("handlebars", hbs.engine);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Handlebars
//app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", "./views");

const startServer = async () => {
  try {
    await seedDatabase();

    app.use(express.json());

    app.use(
      session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: process.env.MONGO_URI,
          ttl: 14 * 24 * 60 * 60 // Time to live in seconds (14 days here)
        }),
        cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
        name: "sessionId"
      })
    );
    app.use((req, res, next) => {
      res.locals.isAuthenticated = req.session.isAuthenticated || false;
      res.locals.isModerator = req.session.role == "Moderator";
      res.locals.session = req.session || {};
      next();
    });
    app.use(setAuth);
    app.use(flash());
    registerRoutes(app);

    app.listen(port, async () => {
      await connectDB();
      console.log("We've now got a server!");
      console.log(`Your routes will be running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
