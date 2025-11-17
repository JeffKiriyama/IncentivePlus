import { Router } from "express";
import { authRequired } from "../middleware/authMiddleware.js";
import { listNews } from "../controllers/newsController.js";

const router = Router();

router.get("/", authRequired, listNews);

export default router;
