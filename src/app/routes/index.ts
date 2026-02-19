import { Router } from "express";
import { CategoryRoutes } from "../modules/category/category.route";
import { MealRoutes } from "../modules/meal/meal.route";
import { AdminRoutes } from "../modules/admin/admin.route";

const router = Router();
router.use("/category", CategoryRoutes);
router.use("/meal", MealRoutes);
router.use("/admin", AdminRoutes);

export const IndexRoutes = router;