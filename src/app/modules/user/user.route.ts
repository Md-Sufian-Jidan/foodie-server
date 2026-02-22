import express from "express";
import { UserController } from "./user.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

const router = express.Router();

router.get(
    "/me",
    auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
    UserController.getCurrentUser,
);

router.get("/", auth(Role.ADMIN),
    UserController.getAllUsers
);

router.patch(
    "/:id",
    auth(Role.ADMIN),
    UserController.updateUserStatus,
);

router.patch(
    "/profile/update",
    auth(Role.ADMIN, Role.CUSTOMER, Role.PROVIDER),
    UserController.updateProfile,
);

export const UserRoutes = router;