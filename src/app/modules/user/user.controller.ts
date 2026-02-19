import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserStatus } from "../../../generated/prisma/enums";
import { UserServices } from "./user.service";
import status from "http-status";

const getCurrentUserFromDB = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const { status: CurrentUserStatus } = req.body;
        const result = await UserServices.getCurrentUser(id as string, CurrentUserStatus as UserStatus);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "User fetched successfully",
            data: result
        });
    }
);

export const UserController = {
    getCurrentUserFromDB
}