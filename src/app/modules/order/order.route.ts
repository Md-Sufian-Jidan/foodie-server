import { Router } from "express";
import { OrderController } from "./order.controller";

const router = Router();

router.post("/", OrderController.createOrderIntoDB);
router.get("/", OrderController.getAllOrdersFromDB);
router.get("/:id", OrderController.getSingleOrderFromDB);

export const OrderRoutes = router;