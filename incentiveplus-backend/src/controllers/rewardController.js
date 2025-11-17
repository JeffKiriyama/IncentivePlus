import { pool } from "../config/db.js";

// lista recompensas ativas
export async function listRewards(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT reward_id, name, description, points_cost, is_active, created_at FROM rewards WHERE is_active = TRUE ORDER BY created_at DESC"
    );
    return res.json(rows);
  } catch (err) {
    console.error("Erro listRewards:", err);
    return res.status(500).json({ message: "Erro ao listar recompensas." });
  }
}

// criar recompensa (admin)
export async function createReward(req, res) {
  try {
    const { name, description, points_cost } = req.body;

    if (!name || !points_cost) {
      return res.status(400).json({ message: "Nome e custo em pontos são obrigatórios." });
    }

    if (points_cost <= 0) {
      return res.status(400).json({ message: "Custo em pontos deve ser maior que zero." });
    }

    const [result] = await pool.query(
      "INSERT INTO rewards (name, description, points_cost, is_active) VALUES (?, ?, ?, TRUE)",
      [name, description || null, points_cost]
    );

    return res.status(201).json({
      reward_id: result.insertId,
      name,
      description,
      points_cost,
      is_active: 1
    });
  } catch (err) {
    console.error("Erro createReward:", err);
    return res.status(500).json({ message: "Erro ao criar recompensa." });
  }
}

// resgatar recompensas (aluno)
export async function redeemRewards(req, res) {
  const { user_id } = req.user; // INT do Token
  const { items } = req.body; // [{ reward_id, quantity }]

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Nenhum item para resgatar." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // saldo atual
    const [usrRows] = await conn.query(
      "SELECT points_balance FROM users WHERE user_id = ? FOR UPDATE",
      [user_id]
    );
    if (usrRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    const saldoAtual = usrRows[0].points_balance;

    // carregar recompensas
    const rewardIds = items.map(i => i.reward_id);
    const [rewardRows] = await conn.query(
      "SELECT reward_id, points_cost FROM rewards WHERE reward_id IN (?) AND is_active = TRUE",
      [rewardIds]
    );

    if (rewardRows.length !== items.length) {
      await conn.rollback();
      return res.status(400).json({ message: "Alguma recompensa é inválida ou inativa." });
    }

    // calcular custo total
    let total = 0;
    for (const item of items) {
      const row = rewardRows.find(r => r.reward_id === item.reward_id);
      const quantity = item.quantity || 1;
      total += row.points_cost * quantity;
    }

    if (total > saldoAtual) {
      await conn.rollback();
      return res.status(400).json({ message: "Saldo insuficiente para resgatar." });
    }

    // criar resgate
    const [redResult] = await conn.query(
      "INSERT INTO redemptions (user_id, status) VALUES (?, 'pendente')",
      [user_id]
    );
    const redemption_id = redResult.insertId;

    // criar itens do resgate
    for (const item of items) {
      const row = rewardRows.find(r => r.reward_id === item.reward_id);
      const quantity = item.quantity || 1;
      const points_spent = row.points_cost * quantity;

      await conn.query(
        `INSERT INTO redemption_items 
         (redemption_id, reward_id, quantity, points_spent)
         VALUES (?, ?, ?, ?)`,
        [redemption_id, item.reward_id, quantity, points_spent]
      );
    }

    // atualizar saldo
    const novoSaldo = saldoAtual - total;
    await conn.query(
      "UPDATE users SET points_balance = ? WHERE user_id = ?",
      [novoSaldo, user_id]
    );

    // registrar transação
    await conn.query(
      `INSERT INTO points_transactions 
       (user_id, tx_type, points_delta, reason, ref_table, ref_id)
       VALUES (?, 'debito', ?, ?, 'redemptions', ?)`,
      [user_id, -total, "resgate_recompensa", "redemptions", redemption_id]
    );

    await conn.commit();

    return res.status(201).json({
      redemption_id,
      total_points_spent: total,
      new_balance: novoSaldo
    });
  } catch (err) {
    await conn.rollback();
    console.error("Erro redeemRewards:", err);
    return res.status(500).json({ message: "Erro ao processar resgate." });
  } finally {
    conn.release();
  }
}