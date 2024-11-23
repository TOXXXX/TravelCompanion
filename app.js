import express from "express";
import { seedDatabase } from "./seed.js";

const app = express();

await seedDatabase();

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
