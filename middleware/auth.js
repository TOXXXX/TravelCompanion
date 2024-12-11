export const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect("/login");
  }
};

export const setAuth = (req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  next();
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
