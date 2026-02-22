import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserStatus } from "../../../generated/prisma/enums";
import { UserServices } from "./user.service";
import status from "http-status";

const getCurrentUser = catchAsync(
    async (req: Request, res: Response) => {
        const result = await UserServices.getCurrentUserFromDB(req);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "User fetched successfully",
            data: result
        });
    }
);

const updateProfile = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;
        const result = await UserServices.updateProfileIntoDB(req, id as string, payload);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Profile updated successfully",
            data: result
        });
    }
);

const getAllUsers = catchAsync(
    async (req: Request, res: Response) => {
        const result = await UserServices.getAllUsersFromDB();
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Users fetched successfully",
            data: result
        });
    }
);

const updateUserStatus = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status: newStatus } = req.body;
        const result = await UserServices.updateUserStatusIntoDB(id as string, newStatus as UserStatus);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "User status updated successfully",
            data: result
        });
    }
);

export const UserController = {
    getCurrentUser,
    updateProfile,
    getAllUsers,
    updateUserStatus
}