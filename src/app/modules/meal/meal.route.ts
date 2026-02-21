import { Router } from "express";
import { MealController } from "./meal.controller";
import { MealValidation } from "./meal.validation";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";

const router = Router();

router.get(
    "/",
    MealController.getAllMeals
);

router.get(
    "/:id",
    MealController.getSingleMeal
);

router.get(
    "/types/list",
    MealController.getMealTypes
);

router.get(
    "/dietary-options/list",
    MealController.getDietaryOptions
);

router.get(
    "/cuisine-options/list",
    MealController.getCuisineOptions
);

router.post(
    "/",
    auth(Role.PROVIDER),
    validateRequest(MealValidation.mealCreateZodSchema),
    MealController.createMeal,
);

router.get(
    "/provider/meals",
    auth(Role.PROVIDER),
    MealController.getProviderMeals,
);

router.get(
    "/popular/list",
    MealController.getPopularMeals
);

router.put(
    "/:id",
    auth(Role.PROVIDER),
    validateRequest(MealValidation.mealUpdateZodSchema),
    MealController.updateMeal,
);

router.get(
    "/provider/orders",
    auth(Role.PROVIDER),
    MealController.getProviderOrders,
);

router.put(
    "/orders/:id/status",
    auth(Role.PROVIDER),
    MealController.updateOrderStatus,
);

router.delete(
    "/:id",
    auth(Role.PROVIDER),
    MealController.deleteMeal,
);

export const MealRoutes = router;