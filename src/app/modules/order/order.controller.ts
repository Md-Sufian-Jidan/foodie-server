import { Request, Response } from "express";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { OrderService } from "./order.service";
import { catchAsync } from "../../shared/catchAsync";
import { OrderStatus } from "../../../generated/prisma/enums";

const createOrder = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error("User not found");
        }
        const result = await OrderService.createOrderIntoDB(payload, userId);

        sendResponse(res, {
            statusCode: status.CREATED,
            success: true,
            message: "Order created successfully",
            data: result,
        });
    }
);

const getAllOrders = catchAsync(
    async (req: Request, res: Response) => {
        const result = await OrderService.getAllOrdersFromDB();
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Orders fetched successfully",
            data: result
        });
    }
);

const getMyOrders = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error("User not found");
        }
        const result = await OrderService.getMyOrdersFromDB(userId);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Orders fetched successfully",
            data: result
        });
    }
);

const getOrderById = catchAsync(
    async (req: Request, res: Response) => {
        const orderId = req.params.id as string;
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error("User not found");
        }
        const result = await OrderService.getOrderByIdFromDB(orderId, userId);

        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Order fetched successfully",
            data: result,
        });
    }
);

const updateOrderStatus = () => catchAsync(
    async (req: Request, res: Response) => {
        const orderId = req.params.id as string;
        const orderStatus = req.body.status as OrderStatus;
        const providerId = req.user?.userId;
        if (!providerId) {
            throw new Error("Provider not found");
        }
        const result = await OrderService.updateOrderStatusIntoDB(orderId, orderStatus, providerId);

        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Order status updated successfully",
            data: result,
        });
    }
);

const trackOrderStatus = () => catchAsync(
    async (req: Request, res: Response) => {
        const orderId = req.params.id as string;
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error("User not found");
        }
        const result = await OrderService.trackOrderStatusIntoDB(orderId, userId);

        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Order status tracked successfully",
            data: result,
        });
    }
);

const cancelOrder = () => catchAsync(
    async (req: Request, res: Response) => {
        const orderId = req.params.id as string;
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error("User not found");
        }
        const result = await OrderService.cancelOrderIntoDB(orderId, userId);

        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Order cancelled successfully",
            data: result,
        });
    }
);

export const OrderController = {
    createOrder,
    getAllOrders,
    getOrderById,
    getMyOrders,
    updateOrderStatus,
    trackOrderStatus,
    cancelOrder
};