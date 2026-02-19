import { Router } from "express";
import { MealController } from "./meal.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

const router = Router();

router.get("/", MealController.getAllMealsFromDB);
router.get("/:id", MealController.getSingleMealFromDB);
router.post("/create-meal", auth(Role.ADMIN, Role.PROVIDER), MealController.createMealIntoDB);
router.patch("/:id", auth(Role.ADMIN, Role.PROVIDER), MealController.updateMealIntoDB);
router.delete("/:id", auth(Role.ADMIN, Role.PROVIDER), MealController.deleteMealFromDB);


export const MealRoutes = router;