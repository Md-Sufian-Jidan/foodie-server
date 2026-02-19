import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.use("/", UserController.getCurrentUserFromDB);

export const UserRoutes = router;