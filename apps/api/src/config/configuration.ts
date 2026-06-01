
export default () => ({
  port: parseInt(process.env.PORT!) || 8000,
  database: {
    url: process.env.DATABASE_URL!
  }
});
