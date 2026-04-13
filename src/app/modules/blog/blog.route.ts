import express from "express";
import { BlogController } from "./blog.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
const router = express.Router();

router.get(
    "/",
    BlogController.getAllBlogs
);

router.get(
    "/admin",
    auth(Role.ADMIN),
    BlogController.getAllForAdmin,
);

router.get(
    "/:slug",
    BlogController.getBlogBySlug
);

router.delete(
    "/:id",
    auth(Role.ADMIN),
    BlogController.deleteBlogById,
);

export const BlogRoutes = router;