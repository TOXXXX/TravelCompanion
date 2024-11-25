export const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.session.userRole === role) {
      next();
    } else {
      res.status(403).json({ message: "Unauthorized" });
    }
  };
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    // TODO: Redirect to main page
  }
  next();
};
