export const ensureAuthenticated = (req, res, next) => {
  console.log(req.isAuthenticated());
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
    return next();
  } else {
    res.status(403).send("Forbidden: User is not an advisor");
  }
};

export const isAdvisorOrCoordinator = (req, res, next) => {
  if (req.user.isAdvisor || req.user.isCoordinator) {
    return next();
  } else {
    res.status(403).send("Forbidden: User is not an advisor or coordinator");
  }
};
