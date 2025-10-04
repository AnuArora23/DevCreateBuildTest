const oidcConfig = {
  authRequired: false, // we'll selectively require via routes
  auth0Logout: true,
  secret: process.env.SESSION_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  routes: {
    login: "/auth0/login",
    callback: "/auth0/callback",
    logout: "/auth0/logout",
  },
};

export { oidcConfig };
