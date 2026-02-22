import { Router } from "express";
import { OrderController } from "./order.controller";

const router = Router();

router.post("/", OrderController.createOrder);
router.get("/", OrderController.getAllOrders);
router.get("/:id", OrderController.getOrderById);
router.get("/my-orders", OrderController.getMyOrders);
router.patch("/:id", OrderController.updateOrderStatus);
router.patch("/track/:id", OrderController.trackOrderStatus);
router.patch("/cancel/:id", OrderController.cancelOrder);

export const OrderRoutes = router;  