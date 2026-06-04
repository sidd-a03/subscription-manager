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
  },
  google: {
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!
  },
  backend: {
    url: process.env.BACKEND_URL!
  },
  otp: {
    secret: process.env.OTP_SECRET!
  }
});
