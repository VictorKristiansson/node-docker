// Imports
import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import { z } from "zod";

// Port
const PORT = 3000;

// player schema
const playerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name is too long"),
});

// .env and app setup
dotenv.config();
const app = express();
const { Pool } = pg;
app.use(express.json());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
});

// Get all players (just their names)
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM players");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all players with their scores
app.get("/players-scores", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT players.name, games.title, scores.score
      FROM scores
      JOIN players ON scores.player_id = players.player_id
      JOIN games ON scores.game_id = games.game_id
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get high scores
app.get("/top-players", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT players.name, games.title, scores.score
      FROM scores
      JOIN players ON scores.player_id = players.player_id
      JOIN games ON scores.game_id = games.game_id
      ORDER BY score DESC

      LIMIT 3;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get players with no games played
app.get("/inactive-players", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT players.name
      FROM players
      LEFT OUTER JOIN scores
      ON players.player_id = scores.player_id
      WHERE scores.score IS NULL;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find popular game genres
app.get("/popular-genres", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT games.genre, COUNT(*) 
      FROM scores
      JOIN games ON scores.game_id = games.game_id
      GROUP BY games.genre
      ORDER BY COUNT(*) DESC
      LIMIT 2;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find recently joined players
app.get("/recent-players", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT players.name, players.join_date
      FROM players

      -- AI helped me with INTERVAL to filter the last 30 days instead of just today
      WHERE join_date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY join_date DESC;
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new player
app.post("/players", async (req, res) => {
  const validatedPlayer = playerSchema.safeParse(req.body);
  if (!validatedPlayer.success) {
    return res.status(400).json({ errors: validatedPlayer.error.errors });
  }
  try {
    const { name } = validatedPlayer.data;
    const result = await pool.query(
      "INSERT INTO players (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a player's name
app.put("/players/:id", async (req, res) => {
  const validatedPlayer = playerSchema.safeParse(req.body);
  if (!validatedPlayer.success) {
    return res.status(400).json({ errors: validatedPlayer.error.errors });
  }

  try {
    const { id } = req.params;
    const { name } = validatedPlayer.data;

    const result = await pool.query(
      "UPDATE players SET name = $1 WHERE player_id = $2 RETURNING *",
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a player
app.delete("/players/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM players WHERE player_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No players found!" });
    }

    res.status(200).json({ message: "Player deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
