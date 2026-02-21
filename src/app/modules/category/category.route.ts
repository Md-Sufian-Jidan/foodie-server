import { Router } from "express";
import { CategoryController } from "./category.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import validateRequest from "../../middleware/validateRequest";
import { CategoryValidation } from "./category.validation";

const router = Router();

router.post(
    "/create-category",
    auth(Role.ADMIN),
    validateRequest(CategoryValidation.categoryZodSchema),
    CategoryController.createCategory
);

router.get(
    "/get-all-category",
    CategoryController.getAllCategories
);

router.get(
    "/:id",
    CategoryController.getCategoryById
);

router.patch(
    "/:id",
    auth(Role.ADMIN),
    validateRequest(CategoryValidation.categoryZodSchema),
    CategoryController.updateCategory
);

router.delete(
    "/:id",
    auth(Role.ADMIN),
    CategoryController.deleteCategory
);

export const CategoryRoutes = router;
