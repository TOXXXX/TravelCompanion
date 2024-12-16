import { getUserById } from "./userService.js";
import { getPostById } from "./post.js";
import Route from "../models/routes.js";

// change the input to two coordinates(arrays of two numbers)
function distance(coord1, coord2) {
  if (coord1.length !== 2 || coord2.length !== 2) {
    throw new Error("Invalid input format to distance function");
  }

  // The math module contains a function named toRadians which converts from
  // degrees to radians.
  coord1[0] = (coord1[0] * Math.PI) / 180;
  coord2[0] = (coord2[0] * Math.PI) / 180;
  coord1[1] = (coord1[1] * Math.PI) / 180;
  coord2[1] = (coord2[1] * Math.PI) / 180;

  // Haversine formula
  let dlon = coord2[0] - coord1[0];
  let dlat = coord2[1] - coord1[1];
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(coord1[1]) * Math.cos(coord2[1]) * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956 for miles
  let r = 6371;

  // calculate the result
  return c * r;
}

export const matchUsersById = async (userId) => {
  try {
    // const user = await getUserById(userId);

    let myRoutes = await Route.find({ uid: userId }).populate("postId").lean();
    let othersRoutes = await Route.find({ uid: { $ne: userId } })
      .populate("postId")
      .lean();
    let matchedUsers = [];

    myRoutes = myRoutes.filter((route) => route.postId.isPlan === true);
    othersRoutes = othersRoutes.filter((route) => route.postId.isPlan === true);

    for (let myRoute of myRoutes) {
      for (let otherRoute of othersRoutes) {
        let myPost = await getPostById(myRoute.postId);
        let otherPost = await getPostById(otherRoute.postId);
        // If the time of the two posts overlap
        if (
          (myPost.intendedTime[0].getTime() >=
            otherPost.intendedTime[0].getTime() &&
            myPost.intendedTime[0].getTime() <=
              otherPost.intendedTime[1].getTime()) ||
          (myPost.intendedTime[1].getTime() >=
            otherPost.intendedTime[0].getTime() &&
            myPost.intendedTime[1].getTime() <=
              otherPost.intendedTime[1].getTime())
        ) {
          let myOrigin = myRoute.origin.coordinates;
          let myDestination = myRoute.destination.coordinates;
          let otherOrigin = otherRoute.origin.coordinates;
          let otherDestination = otherRoute.destination.coordinates;

          // Find the start date of the overlapping period
          let startDate =
            myPost.intendedTime[0].getTime() >=
            otherPost.intendedTime[0].getTime()
              ? myPost.intendedTime[0]
              : otherPost.intendedTime[0];
          // Find the end date of the overlapping period
          let endDate =
            myPost.intendedTime[1].getTime() <=
            otherPost.intendedTime[1].getTime()
              ? myPost.intendedTime[1]
              : otherPost.intendedTime[1];

          startDate = startDate.toDateString();
          endDate = endDate.toDateString();

          // If the two routes are within 10 km of each other
          let minDist = Math.min(
            distance(myOrigin, otherOrigin),
            distance(myDestination, otherDestination),
            distance(otherOrigin, myOrigin),
            distance(otherDestination, myDestination)
          );

          if (minDist < 10) {
            const matchedUser = await getUserById(otherRoute.uid);
            matchedUsers.push({
              userName: matchedUser.userName,
              profilePic: matchedUser.profilePic,
              bio: matchedUser.bio,
              email: matchedUser.email,
              distance: minDist,
              startDate: startDate,
              endDate: endDate
            });
          }
        }
      }
    }

    return matchedUsers;
  } catch (e) {
    throw new Error(`Unable to match users: ${e.message}`);
  }
};
