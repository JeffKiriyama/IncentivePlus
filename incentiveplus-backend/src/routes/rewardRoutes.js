import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/authMiddleware.js";
import { listRewards, createReward, redeemRewards } from "../controllers/rewardController.js";

const router = Router();

// aluno/admin: listar recompensas
router.get("/", authRequired, listRewards);

// admin: criar recompensa
router.post("/", authRequired, adminOnly, createReward);

// aluno: resgatar recompensa
router.post("/redeem", authRequired, redeemRewards);

export default router;
