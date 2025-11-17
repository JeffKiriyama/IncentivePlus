// Arquivo: incentiveplus-backend/src/routes/feedbackRoutes.js
import { Router } from "express";
import { authRequired, professorOrAdmin } from "../middleware/authMiddleware.js"; // Importa o novo middleware
import { 
  createFeedback, 
  listFeedbacksByDiscipline,
  listMyFeedbacksForDiscipline,
  listFeedbacksForMyDisciplines // <-- Importar nova função
} from "../controllers/feedbackController.js";

const router = Router();

// --- Rotas de Aluno ---
router.post("/", authRequired, createFeedback);
router.get("/discipline/:discipline_id/my-feedbacks", authRequired, listMyFeedbacksForDiscipline);

// --- Rotas de Professor/Admin ---
router.get("/discipline/:discipline_id", authRequired, professorOrAdmin, listFeedbacksByDiscipline);
router.get("/professor/my-disciplines", authRequired, professorOrAdmin, listFeedbacksForMyDisciplines); // <-- Rota Adicionada

export default router;