// Arquivo: incentiveplus-backend/src/routes/index.js
import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import rewardRoutes from "./rewardRoutes.js";
import feedbackRoutes from "./feedbackRoutes.js";
import newsRoutes from "./newsRoutes.js";
import disciplineRoutes from "./disciplineRoutes.js";
import redemptionRoutes from "./redemptionRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/rewards", rewardRoutes);
router.use("/feedbacks", feedbackRoutes);
router.use("/news", newsRoutes);
router.use("/disciplines", disciplineRoutes);
router.use("/redemptions", redemptionRoutes);

export default router;