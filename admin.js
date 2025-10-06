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

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM players");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

app.post("/players", async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO players (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

app.listen(3000, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
