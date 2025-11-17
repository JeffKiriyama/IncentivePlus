import { pool } from "../config/db.js";

export async function getMe(req, res) {
  try {
    const user_id_from_token = req.user.user_id; // Este é o INT do token

    const [rows] = await pool.query(
      "SELECT user_id, name, email, role, points_balance, created_at FROM users WHERE user_id = ?",
      [user_id_from_token]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Erro no getMe:", err);
    return res.status(500).json({ message: "Erro ao buscar informações do usuário." });
  }
}

export async function listUsers(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, name, email, role, points_balance, created_at FROM users ORDER BY created_at DESC"
    );

    return res.json(rows);
  } catch (err) {
    console.error("Erro no listUsers:", err);
    return res.status(500).json({ message: "Erro ao listar usuários." });
  }
}

export async function updateUserPoints(req, res) {
  try {
    const { id } = req.params; // Este é o user_id (INT)
    const { delta, reason } = req.body;

    if (!delta || delta === 0) {
      return res.status(400).json({ message: "Delta de pontos inválido." });
    }

    const [rows] = await pool.query(
      "SELECT points_balance FROM users WHERE user_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const saldoAtual = rows[0].points_balance;
    const novoSaldo = saldoAtual + delta;

    if (novoSaldo < 0) {
      return res.status(400).json({ message: "Saldo insuficiente para essa operação." });
    }

    await pool.query(
      "UPDATE users SET points_balance = ? WHERE user_id = ?",
      [novoSaldo, id]
    );

    const tipo = delta > 0 ? "credito" : "debito";
    await pool.query(
      `INSERT INTO points_transactions 
       (user_id, tx_type, points_delta, reason, ref_table, ref_id)
       VALUES (?, ?, ?, ?, ?, NULL)`,
      [id, tipo, delta, reason || "ajuste_manual", "ajuste_pontos"]
    );

    return res.json({
      user_id: Number(id),
      old_balance: saldoAtual,
      new_balance: novoSaldo
    });
  } catch (err) {
    console.error("Erro no updateUserPoints:", err);
    return res.status(500).json({ message: "Erro ao atualizar pontos do usuário." });
  }
}

export async function getMyTransactions(req, res) {
  try {
    const { user_id } = req.user; // INT
    const [rows] = await pool.query(
      `SELECT tx_id, tx_type, points_delta, reason, created_at 
       FROM points_transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [user_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("Erro getMyTransactions:", err);
    return res.status(500).json({ message: "Erro ao buscar transações." });
  }
}

export async function getMyRedemptions(req, res) {
  try {
    const { user_id } = req.user; // INT

    const [rows] = await pool.query(
      `SELECT 
         r.redemption_id, r.status, r.requested_at, r.admin_notes,
         ri.quantity, ri.points_spent,
         rew.name AS reward_name
       FROM redemptions r
       JOIN redemption_items ri ON r.redemption_id = ri.redemption_id
       JOIN rewards rew ON ri.reward_id = rew.reward_id
       WHERE r.user_id = ?
       ORDER BY r.requested_at DESC`,
      [user_id]
    );

    const redemptionsMap = new Map();
    rows.forEach(row => {
      if (!redemptionsMap.has(row.redemption_id)) {
        redemptionsMap.set(row.redemption_id, {
          redemption_id: row.redemption_id,
          status: row.status,
          requested_at: row.requested_at,
          admin_notes: row.admin_notes,
          items: []
        });
      }
      redemptionsMap.get(row.redemption_id).items.push({
        reward_name: row.reward_name,
        quantity: row.quantity,
        points_spent: row.points_spent
      });
    });

    return res.json(Array.from(redemptionsMap.values()));
  } catch (err) {
    console.error("Erro getMyRedemptions:", err);
    return res.status(500).json({ message: "Erro ao buscar resgates." });
  }
}