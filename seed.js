import {
  createUser,
  toggleFollowUser,
  addCommentToUser
} from "./data/userService.js";
import { createPost } from "./data/post.js";
import { createRoute } from "./data/route.js";
import { createComment } from "./data/comment.js";
import { dropDB, disconnectDB } from "./config/db.js";
import mongoose from "mongoose";

const seedDatabase = async () => {
  try {
    // Clear existing data
    await dropDB();

    const sampleUsers = [
      {
        userName: "maheshs85",
        password: "Maheshs85",
        email: "maheshs85@example.com",
        phoneNumber: "123-456-7890",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: [],
        role: "Moderator"
      },
      {
        userName: "toxxxx",
        password: "Toxxxxx1",
        email: "TOXXXX@example.com",
        phoneNumber: "123-456-7891",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: [],
        role: "Moderator"
      },
      {
        userName: "chenhaolinolym",
        password: "Chenhaolinolym1",
        email: "ChenHaolinOlym@example.com",
        phoneNumber: "123-456-7892",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: [],
        role: "Moderator"
      },
      {
        userName: "junrantao",
        password: "Junrantao1",
        email: "JunranTao@example.com",
        phoneNumber: "123-456-7893",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: [],
        role: "Moderator"
      },
      {
        userName: "armansingh",
        password: "Armansingh1",
        email: "ArmanSingh@example.com",
        phoneNumber: "123-456-7894",
        followers: [],
        following: [],
        posts: [],
        personalPageComments: [],
        role: "Moderator"
      }
    ];

    const createdUsers = [];

    for (const userData of sampleUsers) {
      const user = await createUser(userData);
      createdUsers.push(user);
    }

    for (let i = 0; i < createdUsers.length; i++) {
      for (let j = i; j < createdUsers.length; j++) {
        if (i !== j) {
          toggleFollowUser(createdUsers[i]._id, createdUsers[j]._id);
        }
      }
    }

    // Comments posted on the personal page
    const userComments = [
      {
        uid: createdUsers[0]._id,
        content: "Great post! Keep it up!",
        postID: null
      },
      {
        uid: createdUsers[1]._id,
        content: "Nice photo!",
        postID: null
      },
      {
        uid: createdUsers[2]._id,
        content: "I love this!",
        postID: null
      }
    ];

    for (const commentData of userComments) {
      await addCommentToUser(createdUsers[0]._id, commentData);
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
        routeName: "San Francisco Route",
        routeDesc: "A scenic route through San Francisco.",
        tripDuration: 120, // in minutes
        origin: {
          name: "Start Point",
          coordinates: [-122.4194, 37.7749],
          description: "Starting point in San Francisco."
        },
        destination: {
          name: "End Point",
          coordinates: [-122.4194, 37.85],
          description: "Ending point in San Francisco."
        },
        routeType: "Scenic",
        mapDataUrl:
          "data:image/jpeg;base64,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"
      },
      {
        routeName: "Los Angeles Route",
        routeDesc: "A popular route through Los Angeles.",
        tripDuration: 90,
        origin: {
          name: "Start Point",
          coordinates: [-118.2437, 34.0522],
          description: "Starting point in Los Angeles."
        },
        destination: {
          name: "End Point",
          coordinates: [-118.2437, 34.07],
          description: "Ending point in Los Angeles."
        },
        routeType: "Urban",
        mapDataUrl:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBggIBwgICAgJCwoLFwoKCxsIFQ0WIB0iIiAdHx8kKCgsJCYlJx8fLTEtJSkrLi4uIyszODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAMgAyAMBIgACEQEDEQH/xAAaAAEBAAMBAQAAAAAAAAAAAAAABAIDBQEH/8QAPBAAAgICAQIEAwMJBgcAAAAAAAECAwQREgUhExQxQVGBkTJhcRUiMzVSobHB0XSEk7LC8CNCRVNUcnP/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A+yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHNwOoTuzMjHvjGDjbbGE16TSemvxXb6gdIEt98683EpXHhd429rv2W1owycm6WSsXEVatUPElZYnJQTel2Xq2BaDnzuysOyt5cqr8eyca/FhDwnW36bW2mm+x0AAJXfNdTWP+b4bolb6d97SNDz7I9ZeJNR8vKEEp67qbTen+KT+gHRBhbZGqudlkuMK4yk38EiPo+XdmUWWZEIwlG2UeKXHS0mt/f3AvBzup59mJZVGmMZpLxZ7/AOWtNJtff3/czoJpraaaffYHoOdTdl5qduPZVjY3KUYudfjuxJ636pJG7Dvuldbj5UYK6pRlzrTjGxP0a36PtpoCsHNhZm5ORlqm/Hqrot8NKdTm32T3va+JVjQyoyk8m6q1NdlXW6tP6sCgAAAAAAAAAAAAAORRjPJxspQl4d9ebkWQs/Zkn2+T9Gdc0YmN5ZWrlz8S2230462/QDnxyVlZvTZuPh2ReVCVb9YSSW1/v2KMbS6v1BP1deK/lpmU+nwfU686EnCUYyi4JdptrSf3PRllYjtuhfRa6MiEeHPjzU18GvdAa+u/qy1L7TnSl975LReyJYd1ttdmbfC2NUuca66/Cjv2b7ttr2LQIH+vIf2Of+ZE2TTK/N6lGt6trrwrIP4SW2v4a+Z0Xjbzo5XL0qlVw18XvezyrG8PMvyOW/GhTHjr7Ot+/wAwI8i+PUKcKiv7OZxskv2YLu0/npfU29L+3n/2yz+CM8PAhi5ORdGTl4r7Ra7Vre2l+LbZ7DElXVmRhbxnk2W2KfH9G2kvj31oDn4+Zj2X5tt8bpq6XgrjTKa8NduzS13bbKekXO7prrbk7KOdP5ycW9Ls9Pv3Wi3GpjjY9dNf2a4Rh9EYQxvDzbciM9K6EIuvXuvR7/DsBo6U5fkXFdKhOxVRSjJ8U38G/Yyxcq+eZZjZNVVcoVwt3XY5pptrXdL4GKwr6LJvBvhXXZJz8KyvxVFv1a001v4GzFxJVX2ZF9zvvshGvaiqlFJ7SS/F+4EeNVk2ZfUXRlKmPmdcXUrdviu+2zo41d1cWr71e2/VVqrS+HYlWHlV35FmNlVwjfZ4nCdPitPSXrtfAoxq8qEm8i+u6LXZQq8LT+rAoAAAAAAAAAAAAAACHB6gsu/IrUHBVvcZb/Sx202vmmgLgTLJfn5Ys4qP/CjbGe/tremvl2+oz8nymNKxR5zcoQjDfHk29JAUg05d6xsWy6a3whvivd+yX4sxwMnzeNC1x4TblGVe/sNPTX1AoBP5l+f8rxWvB8Xnv79aFWQ55eTQ4pKlVPlv12m/5AUAEWf1BYl+PW4Oase5S3+ijtLb+bQFoPH7nNxszPyKIX14uM65qTSdzi/XXw0B0wT4eSsqh2KEq5QlOuVc/WDXqhgZDy8Om9xUHZHlxT5aAoBN1DJni0KdcIznKyqpRlLgtt69TW7Op/8AjYf+O/6AWg8W3FNpJ69F8T0AAAAAAAAAAAI+rZPlMC2xSUZyXhxbfFJvsn8vX5HPnk4WLPp8sbJon4PHHkozUnKL7b+TSf1OjkY8r8vGnJwdFHOfB+spNaXb4JbNmTi1ZGPbS4QSnCUdqK2tr1An6qnT5fNXri299fsPs/5P5Hl+snquPUu9eLDzD+Dk+0f5sorplPCjRl8ZzlV4cnF8lLtps09Kw7MSmfmLI2X2Sjua+CSSX0X7wNXVcilZeHjXWwrr5ePJzkoppei+b/geYGTj/lTJpoursrvjHIXCSlqXpJfPs/qU0YrWTlX3qE5WyjGK1y4wS7Lv77bYy8R2Tx7cdQhbRbGfdcVJPs12+5ga/wDrn9z/ANQxf1t1D/0xf4M3eXn+UfM7j4fgeHr33vf0NE6c2rOyL8aONOF0alqyx1taTXsn8QOgcOGThZU+oyyMmitXcsaKnNRcYrtv5tt/JHQfn7KL4zji12SrkoyhY5JN+72jbjYtWPj1UqEGoQjHbitv7wNPScnzXT6rHJSnFSrk0+SbXZv5+vzI+lPqH5MoVEcPhxlp2Slv1froux8aVGXlThwVF6hPgvzXGaWn2+DWifDq6liY1dEa8KagpLk7ZbfffpoDLpD1TkV2KSyoWzlZvXeTW9rXs1rRl0P9UYf/AM/5s2YWNOlX2XWRsvyJ85SiuKWlpJfckTYVXUsTFqx414U1XHjydkot/uA2db5eUq8Pjz8zi65em+S9TYn1LkuSweO/Zy3r3McynKycKtONEciFtVnHm+PZ71vW/wBx659T/wCxgf4sv6AWg8jvS2kpa9vTZ6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//2Q=="
      },
      {
        routeName: "New York Route",
        routeDesc: "A bustling route through New York City.",
        tripDuration: 75,
        origin: {
          name: "Start Point",
          coordinates: [-74.006, 40.7128],
          description: "Starting point in New York City."
        },
        destination: {
          name: "End Point",
          coordinates: [-74.006, 40.73],
          description: "Ending point in New York City."
        },
        routeType: "Urban",
        mapDataUrl:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBggIBwgICAgJCwoLFwoKCxsIFQ0WIB0iIiAdHx8kKCgsJCYlJx8fLTEtJSkrLi4uIyszODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAMgAyAMBIgACEQEDEQH/xAAaAAEBAAMBAQAAAAAAAAAAAAAABAIDBQEH/8QAPBAAAgICAQIEAwMJBgcAAAAAAAECAwQREgUhExQxQVGBkTJhcRUiMzVSobHB0XSEk7LC8CNCRVNUcnP/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A+yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHNwOoTuzMjHvjGDjbbGE16TSemvxXb6gdIEt98683EpXHhd429rv2W1owycm6WSsXEVatUPElZYnJQTel2Xq2BaDnzuysOyt5cqr8eyca/FhDwnW36bW2mm+x0AAJXfNdTWP+b4bolb6d97SNDz7I9ZeJNR8vKEEp67qbTen+KT+gHRBhbZGqudlkuMK4yk38EiPo+XdmUWWZEIwlG2UeKXHS0mt/f3AvBzup59mJZVGmMZpLxZ7/AOWtNJtff3/czoJpraaaffYHoOdTdl5qduPZVjY3KUYudfjuxJ636pJG7Dvuldbj5UYK6pRlzrTjGxP0a36PtpoCsHNhZm5ORlqm/Hqrot8NKdTm32T3va+JVjQyoyk8m6q1NdlXW6tP6sCgAAAAAAAAAAAAAORRjPJxspQl4d9ebkWQs/Zkn2+T9Gdc0YmN5ZWrlz8S2230462/QDnxyVlZvTZuPh2ReVCVb9YSSW1/v2KMbS6v1BP1deK/lpmU+nwfU686EnCUYyi4JdptrSf3PRllYjtuhfRa6MiEeHPjzU18GvdAa+u/qy1L7TnSl975LReyJYd1ttdmbfC2NUuca66/Cjv2b7ttr2LQIH+vIf2Of+ZE2TTK/N6lGt6trrwrIP4SW2v4a+Z0Xjbzo5XL0qlVw18XvezyrG8PMvyOW/GhTHjr7Ot+/wAwI8i+PUKcKiv7OZxskv2YLu0/npfU29L+3n/2yz+CM8PAhi5ORdGTl4r7Ra7Vre2l+LbZ7DElXVmRhbxnk2W2KfH9G2kvj31oDn4+Zj2X5tt8bpq6XgrjTKa8NduzS13bbKekXO7prrbk7KOdP5ycW9Ls9Pv3Wi3GpjjY9dNf2a4Rh9EYQxvDzbciM9K6EIuvXuvR7/DsBo6U5fkXFdKhOxVRSjJ8U38G/Yyxcq+eZZjZNVVcoVwt3XY5pptrXdL4GKwr6LJvBvhXXZJz8KyvxVFv1a001v4GzFxJVX2ZF9zvvshGvaiqlFJ7SS/F+4EeNVk2ZfUXRlKmPmdcXUrdviu+2zo41d1cWr71e2/VVqrS+HYlWHlV35FmNlVwjfZ4nCdPitPSXrtfAoxq8qEm8i+u6LXZQq8LT+rAoAAAAAAAAAAAAAACHB6gsu/IrUHBVvcZb/Sx202vmmgLgTLJfn5Ys4qP/CjbGe/tremvl2+oz8nymNKxR5zcoQjDfHk29JAUg05d6xsWy6a3whvivd+yX4sxwMnzeNC1x4TblGVe/sNPTX1AoBP5l+f8rxWvB8Xnv79aFWQ55eTQ4pKlVPlv12m/5AUAEWf1BYl+PW4Oase5S3+ijtLb+bQFoPH7nNxszPyKIX14uM65qTSdzi/XXw0B0wT4eSsqh2KEq5QlOuVc/WDXqhgZDy8Om9xUHZHlxT5aAoBN1DJni0KdcIznKyqpRlLgtt69TW7Op/8AjYf+O/6AWg8W3FNpJ69F8T0AAAAAAAAAAAI+rZPlMC2xSUZyXhxbfFJvsn8vX5HPnk4WLPp8sbJon4PHHkozUnKL7b+TSf1OjkY8r8vGnJwdFHOfB+spNaXb4JbNmTi1ZGPbS4QSnCUdqK2tr1An6qnT5fNXri299fsPs/5P5Hl+snquPUu9eLDzD+Dk+0f5sorplPCjRl8ZzlV4cnF8lLtps09Kw7MSmfmLI2X2Sjua+CSSX0X7wNXVcilZeHjXWwrr5ePJzkoppei+b/geYGTj/lTJpoursrvjHIXCSlqXpJfPs/qU0YrWTlX3qE5WyjGK1y4wS7Lv77bYy8R2Tx7cdQhbRbGfdcVJPs12+5ga/wDrn9z/ANQxf1t1D/0xf4M3eXn+UfM7j4fgeHr33vf0NE6c2rOyL8aONOF0alqyx1taTXsn8QOgcOGThZU+oyyMmitXcsaKnNRcYrtv5tt/JHQfn7KL4zji12SrkoyhY5JN+72jbjYtWPj1UqEGoQjHbitv7wNPScnzXT6rHJSnFSrk0+SbXZv5+vzI+lPqH5MoVEcPhxlp2Slv1froux8aVGXlThwVF6hPgvzXGaWn2+DWifDq6liY1dEa8KagpLk7ZbfffpoDLpD1TkV2KSyoWzlZvXeTW9rXs1rRl0P9UYf/AM/5s2YWNOlX2XWRsvyJ85SiuKWlpJfckTYVXUsTFqx414U1XHjydkot/uA2db5eUq8Pjz8zi65em+S9TYn1LkuSweO/Zy3r3McynKycKtONEciFtVnHm+PZ71vW/wBx659T/wCxgf4sv6AWg8jvS2kpa9vTZ6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//2Q=="
      },
      {
        routeName: "Washington D.C. Route",
        routeDesc: "A historic route through Washington D.C.",
        tripDuration: 105,
        origin: {
          name: "Start Point",
          coordinates: [-77.0369, 38.9072],
          description: "Starting point in Washington D.C."
        },
        destination: {
          name: "End Point",
          coordinates: [-77.0369, 38.92],
          description: "Ending point in Washington D.C."
        },
        routeType: "Historic",
        mapDataUrl:
          "data:image/jpeg;base64,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"
      },
      {
        routeName: "Portland Route",
        routeDesc: "A beautiful route through Portland.",
        tripDuration: 180,
        origin: {
          name: "Start Point",
          coordinates: [-122.6784, 45.5231],
          description: "Starting point in Portland."
        },
        destination: {
          name: "End Point",
          coordinates: [-122.6784, 45.54],
          description: "Ending point in Portland."
        },
        routeType: "Scenic",
        mapDataUrl:
          "data:image/jpeg;base64,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"
      }
    ];

    let createdPosts = [];

    // Create Posts and Routes in a one-to-one relationship
    for (let i = 0; i < postData.length; i++) {
      const userId = createdUsers[i]._id;
      const post = await createPost(userId, postData[i]);
      createdPosts.push(post);

      // Add postID and uid to the route data
      const routeToCreate = {
        uid: userId,
        postId: post._id,
        ...routeData[i]
      };

      // Last post does not have a route
      if (i !== postData.length - 1) {
        const route = await createRoute(routeToCreate);
      }
    }

    // Comments on the posts
    const postComments = [
      {
        uid: createdUsers[1]._id,
        content: "This is amazing!",
        postId: createdPosts[0]._id
      },
      {
        uid: createdUsers[2]._id,
        content: "Great work!",
        postId: createdPosts[1]._id
      },
      {
        uid: createdUsers[3]._id,
        content: "I love this place!",
        postId: createdPosts[2]._id
      },
      {
        uid: createdUsers[4]._id,
        content: "Fantastic view!",
        postId: createdPosts[3]._id
      },
      {
        uid: createdUsers[0]._id,
        content: "Beautiful scenery!",
        postId: createdPosts[4]._id
      }
    ];

    for (const commentData of postComments) {
      await createComment(commentData);
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
