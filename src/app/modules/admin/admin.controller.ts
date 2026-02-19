import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AdminServices } from "./admin.service";
import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllUsersFromDB = catchAsync(async (req: Request, res: Response) => {
    const result = await AdminServices.getAllusers();
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Users fetched successfully",
        data: result
    });
});

const updateStatusFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status: UpdatedUserStatus } = req.body;
    const result = await AdminServices.updateStatus(id as string, UpdatedUserStatus as UserStatus);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User status updated successfully",
        data: result
    });
});

export const AdminController = {
    getAllUsersFromDB,
    updateStatusFromDB
};
