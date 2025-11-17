// Arquivo: incentiveplus-backend/src/routes/redemptionRoutes.js
import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import { 
  listAllRedemptions,
  approveRedemption,
  rejectRedemption
} from "../controllers/redemptionController.js";

const router = Router();

// Todas as rotas de gerenciamento de resgates são apenas para Admins
router.use(authRequired, adminOnly);

// GET /redemptions - Lista todos os resgates
router.get("/", listAllRedemptions);

// POST /redemptions/:id/approve - Aprova um resgate
router.post("/:id/approve", approveRedemption);

// POST /redemptions/:id/reject - Nega um resgate
router.post("/:id/reject", rejectRedemption);

export default router;