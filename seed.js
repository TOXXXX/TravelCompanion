import { createUser } from "./data/userService.js";
import { dropDB, disconnectDB } from "./config/db.js";

const seedDatabase = async () => {
  try {
    // Clear existing data
    await dropDB();

    const sampleUsers = [
      {
        userName: "maheshs85",
        password: "1234",
        email: "maheshs85@example.com",
        phoneNumber: "123-456-7890",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: []
      },
      {
        userName: "TOXXXX",
        password: "1234",
        email: "TOXXXX@example.com",
        phoneNumber: "123-456-7891",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: []
      },
      {
        userName: "ChenHaolinOlym",
        password: "1234",
        email: "ChenHaolinOlym@example.com",
        phoneNumber: "123-456-7892",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: []
      },
      {
        userName: "Junran Tao",
        password: "1234",
        email: "Junran Tao@example.com",
        phoneNumber: "123-456-7893",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: []
      },
      {
        userName: "Arman Singh",
        password: "1234",
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

export default seedDatabase;
