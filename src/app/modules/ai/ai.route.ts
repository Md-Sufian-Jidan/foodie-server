import express from "express";
import { aiController } from "./ai.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
const router = express.Router();

router.post("/chat", aiController.chatAI);
router.post(
    "/blog-post",
    auth(Role.ADMIN),
    aiController.blogPostGenerator,
);
router.post(
    "/meal-description",
    auth(Role.PROVIDER),
    aiController.generateMealDescription,
);

router.get("/health-tip", aiController.aiHealthTipSuggestion);

export const aiRoutes = router;