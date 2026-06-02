export default () => ({
  port: parseInt(process.env.PORT!) || 8000,
  database: {
    url: process.env.DATABASE_URL!
  },
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET!,
    refresh_secret: process.env.JWT_REFRESH_SECRET!
  },
  pepper: {
    argon_pepper: process.env.ARGON2_PEPPER!
  }
});
