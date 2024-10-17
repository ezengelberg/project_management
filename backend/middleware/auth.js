export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log("User is authenticated");
    return next();
  } else {
    console.log("User is not authenticated");
    res.status(401).send("Unauthorized: Please log in");
  }
};


export const isCoordinator = (req, res, next) => {
  if (req.user.isCoordinator) {
    console.log("User is a coordinator");
    return next();
  } else {
    res.status(403).send("Forbidden: User is not a coordinator");
  }
};
