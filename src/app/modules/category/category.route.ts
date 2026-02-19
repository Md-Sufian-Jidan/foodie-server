import { Router } from "express";
import { CategoryController } from "./category.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
    "/create-category",
    // auth(Role.ADMIN),
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

router.delete(
    "/:id",
    auth(Role.ADMIN),
    CategoryController.deleteCategory
);

export const CategoryRoutes = router;
