// Used for route functions that render handlebars pages
export const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Used for API calls
export const isAuthenticatedAPI = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const setAuth = (req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  next();
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.session.role === role) {
      next();
    } else {
      res.status(403).json({ message: "Unauthorized" });
    }
  };
};
