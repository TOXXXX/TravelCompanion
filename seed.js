import { createUser } from "./data/userService.js";
import bcrypt from "bcrypt";
import { dropDB, disconnectDB } from "./config/db.js";

export const seedDatabase = async () => {
  try {
    // Clear existing data
    await dropDB();

    const hashedPassword = await bcrypt.hash("1234", 10);

    const sampleUsers = [
      {
        userName: "maheshs85",
        password: hashedPassword,
        email: "maheshs85@example.com",
        phoneNumber: "123-456-7890",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: []
      },
      {
        userName: "TOXXXX",
        password: hashedPassword,
        email: "TOXXXX@example.com",
        phoneNumber: "123-456-7891",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: []
      },
      {
        userName: "ChenHaolinOlym",
        password: hashedPassword,
        email: "ChenHaolinOlym@example.com",
        phoneNumber: "123-456-7892",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: []
      },
      {
        userName: "Junran Tao",
        password: hashedPassword,
        email: "Junran Tao@example.com",
        phoneNumber: "123-456-7893",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: []
      },
      {
        userName: "Arman Singh",
        password: hashedPassword,
        email: "Arman Singh@example.com",
        phoneNumber: "123-456-7894",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: []
      }
    ];

    for (const userData of sampleUsers) {
      await createUser(userData);
    }

    console.log("Sample users added successfully");

    await disconnectDB();
  } catch (error) {
    console.error("Error seeding database:", error);
    await disconnectDB();
  }
};
