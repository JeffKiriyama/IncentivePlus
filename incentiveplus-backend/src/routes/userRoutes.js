// Arquivo: incentiveplus-backend/src/routes/userRoutes.js
import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import { 
  getMe, 
  listUsers, 
  updateUserPoints,
  getMyTransactions, // <-- Nova função
  getMyRedemptions   // <-- Nova função
} from "../controllers/userController.js";

const router = Router();

// --- Rotas de Aluno ---
router.get("/me", authRequired, getMe);
router.get("/me/transactions", authRequired, getMyTransactions); // <-- Nova rota
router.get("/me/redemptions", authRequired, getMyRedemptions);   // <-- Nova rota

// --- Rotas de Admin ---
router.get("/", authRequired, adminOnly, listUsers);
router.patch("/:id/points", authRequired, adminOnly, updateUserPoints);

export default router;