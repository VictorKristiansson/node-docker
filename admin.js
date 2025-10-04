import express from "express";
import pg from "pg";
import dotenv from "dotenv";
const PORT = 3000;

dotenv.config();
const app = express();
const { Pool } = pg;

app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
});

app.get("/", (req, res) => {
  res.send("Welcome to this NodeJS and PostgreSQL lesson.");
});

app.listen(3000, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
