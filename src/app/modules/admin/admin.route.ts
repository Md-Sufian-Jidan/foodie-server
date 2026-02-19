import { Router } from "express";
import { AdminController } from "./admin.controller";

const router = Router();

router.get("/users", AdminController.getAllUsersFromDB);
router.patch("/users/:id", AdminController.updateStatusFromDB);

export const AdminRoutes = router;