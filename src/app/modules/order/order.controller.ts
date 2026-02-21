import { Request, Response } from "express";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { OrderServices } from "./order.service";
import { catchAsync } from "../../shared/catchAsync";

const createOrderIntoDB = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;

        const result = await OrderServices.createOrder(payload);

        sendResponse(res, {
            statusCode: status.CREATED,
            success: true,
            message: "Order created successfully",
            data: result,
        });
    }
);

const getAllOrdersFromDB = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error("User not found");
        }
        const result = await OrderServices.getAllOrders(userId);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Orders fetched successfully",
            data: result
        });
    }
);

const getSingleOrderFromDB = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await OrderServices.getSingleOrder(
            id as string,
            req.user
        );

        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Order fetched successfully",
            data: result,
        });
    }
);
export const OrderController = {
    createOrderIntoDB,
    getAllOrdersFromDB,
    getSingleOrderFromDB
};