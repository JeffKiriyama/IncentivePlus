import { pool } from "../config/db.js";

export async function createFeedback(req, res) {
  const { user_id } = req.user; // INT do Token
  const { discipline_id, rating, comment } = req.body;

  if (!discipline_id || !rating) {
    return res.status(400).json({ message: "Disciplina e nota são obrigatórias." });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Nota deve estar entre 1 e 5." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [feedbackResult] = await conn.query(
      `INSERT INTO feedbacks (user_id, discipline_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [user_id, discipline_id, rating, comment || null]
    );

    const feedback_id = feedbackResult.insertId;

    await conn.query(
      `INSERT INTO points_transactions 
       (user_id, tx_type, points_delta, reason, ref_table, ref_id)
       VALUES (?, 'credito', ?, ?, 'feedbacks', ?)`,
      [user_id, 10, "Feedback enviado", feedback_id]
    );

    await conn.query(
      "UPDATE users SET points_balance = points_balance + 10 WHERE user_id = ?",
      [user_id]
    );

    await conn.commit();
    
    return res.status(201).json({ message: "Feedback registrado com sucesso. Você ganhou 10 pontos!" });

  } catch (err) {
    await conn.rollback();
    console.error("Erro createFeedback:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Você já enviou um feedback para esta disciplina recentemente." });
    }
    return res.status(500).json({ message: "Erro ao registrar feedback." });
  } finally {
    conn.release();
  }
}

export async function listFeedbacksByDiscipline(req, res) {
  try {
    const { discipline_id } = req.params;

    const [rows] = await pool.query(
      `SELECT f.feedback_id, f.rating, f.comment, f.created_at,
              u.name AS user_name
       FROM feedbacks f
       JOIN users u ON f.user_id = u.user_id
       WHERE f.discipline_id = ?
       ORDER BY f.created_at DESC`,
      [discipline_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("Erro listFeedbacksByDiscipline:", err);
    return res.status(500).json({ message: "Erro ao listar feedbacks." });
  }
}

export async function listMyFeedbacksForDiscipline(req, res) {
  try {
    const { user_id } = req.user; // INT
    const { discipline_id } = req.params;

    const [rows] = await pool.query(
      `SELECT feedback_id, rating, comment, created_at
       FROM feedbacks
       WHERE discipline_id = ? AND user_id = ?
       ORDER BY created_at DESC`,
      [discipline_id, user_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("Erro listMyFeedbacksForDiscipline:", err);
    return res.status(500).json({ message: "Erro ao listar seus feedbacks." });
  }
}

export async function listFeedbacksForMyDisciplines(req, res) {
  try {
    const { user_id } = req.user; // INT do Professor

    const [rows] = await pool.query(
      `SELECT 
         f.feedback_id, f.rating, f.comment, f.created_at,
         d.name AS discipline_name,
         u.name AS user_name
       FROM feedbacks f
       JOIN disciplines d ON f.discipline_id = d.discipline_id
       JOIN users u ON f.user_id = u.user_id
       WHERE d.teacher_id = ?
       ORDER BY f.created_at DESC`,
      [user_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("Erro listFeedbacksForMyDisciplines:", err);
    return res.status(500).json({ message: "Erro ao listar feedbacks." });
  }
}