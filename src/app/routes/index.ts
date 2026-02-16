import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoutes } from "../modules/category/category.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/category", CategoryRoutes);

export const IndexRoutes = router;