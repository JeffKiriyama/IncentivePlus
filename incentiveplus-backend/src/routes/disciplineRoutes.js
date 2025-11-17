// Arquivo: incentiveplus-backend/src/routes/disciplineRoutes.js

import { Router } from "express";
import { authRequired, professorOrAdmin } from "../middleware/authMiddleware.js";
import { 
  listDisciplines, 
  listMyEnrollmentIDs, 
  enrollInDiscipline,
  getDisciplineById,
  getMyTaughtDisciplines,
  getEnrollmentsForDiscipline // <-- 1. Importar a nova função
} from "../controllers/disciplineController.js";

const router = Router();

// --- Rotas de Aluno/Geral ---
router.get("/", authRequired, listDisciplines);
router.get("/my-ids", authRequired, listMyEnrollmentIDs);
router.get("/:id", authRequired, getDisciplineById);
router.post("/:id/enroll", authRequired, enrollInDiscipline);

// --- Rotas de Professor ---
router.get("/professor/my-taught", authRequired, professorOrAdmin, getMyTaughtDisciplines);
router.get("/:id/enrollments", authRequired, professorOrAdmin, getEnrollmentsForDiscipline); // <-- 2. Rota Adicionada

export default router;