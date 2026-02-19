import { Router } from "express";
import { CategoryRoutes } from "../modules/category/category.route";
import { MealRoutes } from "../modules/meal/meal.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { UserRoutes } from "../modules/user/user.route";

const router = Router();

router.use("/category", CategoryRoutes);
router.use("/meal", MealRoutes);
router.use("/admin", AdminRoutes);
router.use("/user", UserRoutes);

export const IndexRoutes = router;