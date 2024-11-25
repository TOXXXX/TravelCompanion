import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Store the connection promise to prevent multiple connection attempts
let connectionPromise = null;

export const connectDB = async () => {
  try {
    if (!connectionPromise) {
      const uri = process.env.MONGO_URI;
      connectionPromise = mongoose.connect(uri);
    }

    await connectionPromise;

    return mongoose.connection;
  } catch (err) {
    // Reset the promise so next connection attempt can try again
    connectionPromise = null;
    throw new Error(`Failed to connect to MongoDB: ${err.message}`);
  }
};

export const dropDB = async () => {
  try {
    // Ensure we're connected
    const conn = await connectDB();

    // Get all collections and drop them
    const collections = Object.keys(conn.collections);

    if (collections.length === 0) {
      console.log("No collections to clear - database is empty");
      return;
    }

    for (const collectionName of collections) {
      await conn.collections[collectionName].drop();
    }
  } catch (error) {
    // Handle "namespace not found" error which occurs when collections don't exist
    if (error.code === 26) {
      console.log("Database already empty");
      return;
    }

    throw new Error(`Failed to clear database: ${error.message}`);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();

    // Reset the promise so new connections can be established after disconnect
    connectionPromise = null;
  } catch (err) {
    throw new Error(`Failed to disconnect from MongoDB: ${err.message}`);
  }
};
