export const ensureAuthenticated = (req, res, next) => {
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
