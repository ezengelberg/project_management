export const ensureAuthenticated = (req, res, next) => {
  console.log("Checking authentication");
  console.log(req);
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).send("Unauthorized");
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
