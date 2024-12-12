import { createUser } from "./data/userService.js";
import { createPost } from "./data/post.js";
import { createRoute } from "./data/route.js";
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

    // TODO: Temporary, needs refactor after real route data functions are in.
    const postData = [
      {
        isPlan: true,
        intendedTime: [
          new Date("2024-01-01T08:00:00Z"),
          new Date("2024-01-01T12:00:00Z")
        ],
        title: "Plan a trip to the mountains",
        intro: "An exciting journey to explore the mountains.",
        content: { description: "Hiking and sightseeing in the mountains." }
      },
      {
        isPlan: false,
        intendedTime: [],
        title: "Review of my beach vacation",
        intro: "Sharing my experience of a serene beach holiday.",
        content: {
          description: "Photos and descriptions of the beach and local cuisine."
        }
      },
      {
        isPlan: true,
        intendedTime: [
          new Date("2024-02-15T10:00:00Z"),
          new Date("2024-02-15T18:00:00Z")
        ],
        title: "Plan for city exploration",
        intro: "Exploring the best spots in the city.",
        content: { description: "Museum visits, parks, and local markets." }
      },
      {
        isPlan: false,
        intendedTime: [],
        title: "Reflections on a nature retreat",
        intro: "A rejuvenating experience in nature.",
        content: { description: "Meditation and relaxation amidst nature." }
      },
      {
        isPlan: true,
        intendedTime: [
          new Date("2024-03-10T07:00:00Z"),
          new Date("2024-03-10T14:00:00Z")
        ],
        title: "Plan for a river rafting adventure",
        intro: "A thrilling river rafting expedition.",
        content: {
          description:
            "Preparing for a safe and adventurous rafting experience."
        }
      }
    ];

    const routeData = [
      {
        routes: {
          start: "Base Camp",
          end: "Mountain Summit",
          waypoints: ["Point A", "Point B"]
        }
      },
      {
        routes: { start: "Hotel", end: "Beach", waypoints: ["Cafe", "Market"] }
      },
      {
        routes: {
          start: "City Center",
          end: "Museum",
          waypoints: ["Park", "Restaurant"]
        }
      },
      {
        routes: {
          start: "Cabin",
          end: "Lake",
          waypoints: ["Trailhead", "Waterfall"]
        }
      },
      {
        routes: {
          start: "Rafting Base",
          end: "Finish Line",
          waypoints: ["Checkpoint 1", "Checkpoint 2"]
        }
      }
    ];

    // Create Posts and Routes in a one-to-one relationship
    for (let i = 0; i < postData.length; i++) {
      const userId = `user${i + 1}`;
      const post = await createPost(userId, postData[i]);
      const route = await createRoute(userId, post._id, routeData[i].routes);
    }

    console.log("Sample posts and routes added successfully");

    console.log("Seeding completed.");

    await disconnectDB();
  } catch (error) {
    console.error("Error seeding database:", error);
    await disconnectDB();
  }
};

export default seedDatabase;
