import { Router } from "express";
import { MealController } from "./meal.controller";

const router = Router();

router.get("/", MealController.getAllMealsFromDB);
router.get("/:id", MealController.getSingleMealFromDB);

export const MealRoutes = router;