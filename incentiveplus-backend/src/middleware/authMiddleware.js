import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não enviado." });
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Formato de token inválido." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { user_id: payload.user_id, role: payload.role };
    next();
  } catch (err) {
    console.error("Erro ao validar token:", err.message);
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Acesso restrito ao administrador." });
  }
  next();
}

export function professorOrAdmin(req, res, next) {
  if (!req.user || (req.user.role !== "professor" && req.user.role !== "admin")) {
    return res.status(403).json({ message: "Acesso restrito a professores ou administradores." });
  }
  next();
}
