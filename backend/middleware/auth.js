export const ensureAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    console.log("Authentication failed:", {
      sessionID: req.sessionID,
      session: req.session,
      user: req.user,
      headers: req.headers,
    });
    return res.status(401).json({ error: "Unauthorized access" });
  }
  next();
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
