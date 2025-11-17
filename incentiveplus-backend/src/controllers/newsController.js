import { pool } from "../config/db.js";

export async function listNews(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT news_id, title, category, link, published_at
       FROM news
       ORDER BY published_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error("Erro listNews:", err);
    return res.status(500).json({ message: "Erro ao listar notícias." });
  }
}
