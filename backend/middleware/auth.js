export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).send("Unauthorized");
  }
};

export const isStudent = (req, res, next) => {
  if (req.user.isStudent) {
    return next();
  } else {
    res.status(403).send("Forbidden: User is not a student");
  }
};

export const isCoordinator = (req, res, next) => {
  if (req.user.isCoordinator) {
    return next();
  } else {
    res.status(403).send("Forbidden: User is not a coordinator");
  }
};

export const isAdvisor = (req, res, next) => {
  if (req.user.isAdvisor) {
    console.log("User is an advisor");
    return next();
  } else {
    res.status(403).send("Forbidden: User is not an advisor");
  }
};

export const isAdvisorOrCoordinator = (req, res, next) => {
  if (req.user.isAdvisor || req.user.isCoordinator) {
    console.log("User is an advisor or coordinator");
    return next();
  } else {
    res.status(403).send("Forbidden: User is not an advisor or coordinator");
  }
};
