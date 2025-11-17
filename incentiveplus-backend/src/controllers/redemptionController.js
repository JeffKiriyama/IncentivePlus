import { pool } from "../config/db.js";

export async function listAllRedemptions(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
         r.redemption_id, r.status, r.requested_at, r.approved_at, r.admin_notes, r.user_id,
         u.name AS user_name,
         u.email AS user_email,
         ri.item_id, ri.quantity, ri.points_spent,
         rew.name AS reward_name
       FROM redemptions r
       JOIN users u ON r.user_id = u.user_id
       JOIN redemption_items ri ON r.redemption_id = ri.redemption_id
       JOIN rewards rew ON ri.reward_id = rew.reward_id
       ORDER BY r.status = 'pendente' DESC, r.requested_at DESC`,
      []
    );

    const redemptionsMap = new Map();
    rows.forEach(row => {
      if (!redemptionsMap.has(row.redemption_id)) {
        redemptionsMap.set(row.redemption_id, {
          redemption_id: row.redemption_id,
          status: row.status,
          requested_at: row.requested_at,
          approved_at: row.approved_at,
          admin_notes: row.admin_notes,
          user: {
            user_id: row.user_id, // Passa o INT
            name: row.user_name,
            email: row.user_email
          },
          total_points_spent: 0,
          items: []
        });
      }
      
      const redemption = redemptionsMap.get(row.redemption_id);
      redemption.total_points_spent += row.points_spent;
      redemption.items.push({
        item_id: row.item_id,
        reward_name: row.reward_name,
        quantity: row.quantity,
        points_spent: row.points_spent
      });
    });

    return res.json(Array.from(redemptionsMap.values()));
  } catch (err) {
    console.error("Erro listAllRedemptions:", err);
    return res.status(500).json({ message: "Erro ao listar resgates." });
  }
}

export async function approveRedemption(req, res) {
  try {
    const { id } = req.params; 

    const [result] = await pool.query(
      "UPDATE redemptions SET status = 'aprovado', approved_at = NOW() WHERE redemption_id = ? AND status = 'pendente'",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Resgate não encontrado ou já processado." });
    }

    return res.json({ message: "Resgate aprovado com sucesso." });
  } catch (err) {
    console.error("Erro approveRedemption:", err);
    return res.status(500).json({ message: "Erro ao aprovar resgate." });
  }
}

export async function rejectRedemption(req, res) {
  const { id } = req.params; // ID do resgate
  const { reason, user_id, points_spent } = req.body; // user_id é o INT

  if (!user_id || !points_spent) {
     return res.status(400).json({ message: "Faltando dados do usuário ou pontos para reembolso." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [updateResult] = await conn.query(
      "UPDATE redemptions SET status = 'negado', approved_at = NOW(), admin_notes = ? WHERE redemption_id = ? AND status = 'pendente'",
      [reason || 'Negado pelo administrador', id]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Resgate não encontrado ou já processado." });
    }

    await conn.query(
      "UPDATE users SET points_balance = points_balance + ? WHERE user_id = ?",
      [points_spent, user_id]
    );

    await conn.query(
      `INSERT INTO points_transactions 
       (user_id, tx_type, points_delta, reason, ref_table, ref_id)
       VALUES (?, 'credito', ?, ?, 'redemptions', ?)`,
      [user_id, points_spent, reason || "Resgate negado - Devolução", id]
    );

    await conn.commit();
    return res.json({ message: "Resgate negado e pontos devolvidos." });

  } catch (err) {
    await conn.rollback();
    console.error("Erro rejectRedemption:", err);
    return res.status(500).json({ message: "Erro ao negar resgate." });
  } finally {
    conn.release();
  }
}