import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../config/db.js";

dotenv.config();

function generateToken(user_id, role) {
  return jwt.sign(
    { user_id, role }, 
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

export async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nome, email e senha são obrigatórios." });
    }

    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email já cadastrado." });
    }

    const hash = await bcrypt.hash(password, 10);
    const userRole = role || "aluno";

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, points_balance) VALUES (?, ?, ?, ?, 0)",
      [name, email, hash, userRole]
    );

    const newUserId = result.insertId; 
    const token = generateToken(newUserId, userRole);

    return res.status(201).json({
      user: {
        user_id: newUserId, 
        name,
        email,
        role: userRole,
        points_balance: 0
      },
      token
    });
  } catch (err) {
    console.error("Erro no signup:", err);
    return res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    const [rows] = await pool.query(
      "SELECT user_id, name, email, password_hash, role, points_balance FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = generateToken(user.user_id, user.role); 
    delete user.password_hash;

    return res.json({ user, token });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ message: "Erro ao fazer login." });
  }
}