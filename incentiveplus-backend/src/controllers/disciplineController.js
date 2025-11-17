import { pool } from "../config/db.js";

export async function listDisciplines(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM disciplines ORDER BY name"
    );
    return res.json(rows);
  } catch (err) {
    console.error("Erro listDisciplines:", err);
    return res.status(500).json({ message: "Erro ao listar disciplinas." });
  }
}

export async function listMyEnrollmentIDs(req, res) {
  try {
    const { user_id } = req.user; // INT
    const [rows] = await pool.query(
      "SELECT discipline_id FROM enrollments WHERE user_id = ?",
      [user_id]
    );
    const idArray = rows.map(r => r.discipline_id);
    return res.json(idArray);
  } catch (err) {
    console.error("Erro listMyEnrollmentIDs:", err);
    return res.status(500).json({ message: "Erro ao listar matrículas." });
  }
}

export async function enrollInDiscipline(req, res) {
  try {
    const { user_id, role } = req.user; // INT
    const { id } = req.params; // ID da disciplina

    if (role !== 'aluno') {
      return res.status(403).json({ message: "Apenas alunos podem se matricular." });
    }

    await pool.query(
      "INSERT INTO enrollments (user_id, discipline_id) VALUES (?, ?)",
      [user_id, id]
    );

    return res.status(201).json({ message: "Matrícula realizada com sucesso." });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "Você já está matriculado nesta disciplina." });
    }
    console.error("Erro enrollInDiscipline:", err);
    return res.status(500).json({ message: "Erro ao realizar matrícula." });
  }
}

export async function getDisciplineById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM disciplines WHERE discipline_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Disciplina não encontrada." });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Erro getDisciplineById:", err);
    return res.status(500).json({ message: "Erro ao buscar disciplina." });
  }
}

export async function getMyTaughtDisciplines(req, res) {
  try {
    const { user_id } = req.user; // INT do professor

    const [rows] = await pool.query(
      `SELECT d.*, 
              (SELECT COUNT(*) FROM enrollments e WHERE e.discipline_id = d.discipline_id) AS student_count
       FROM disciplines d
       WHERE d.teacher_id = ?
       ORDER BY d.name`,
      [user_id]
    );

    return res.json(rows);
  } catch (err) {
    console.error("Erro getMyTaughtDisciplines:", err);
    return res.status(500).json({ message: "Erro ao buscar suas disciplinas." });
  }
}


export async function getEnrollmentsForDiscipline(req, res) {
  try {
    const { id } = req.params; // ID da disciplina

    const [rows] = await pool.query(
      `SELECT
         u.user_id, u.name, u.email, u.points_balance,
         e.enrolled_at
       FROM enrollments e
       JOIN users u ON e.user_id = u.user_id
       WHERE e.discipline_id = ?
       ORDER BY u.name`,
      [id]
    );

    return res.json(rows);
  } catch (err) {
    console.error("Erro getEnrollmentsForDiscipline:", err);
    return res.status(500).json({ message: "Erro ao buscar alunos matriculados." });
  }
}