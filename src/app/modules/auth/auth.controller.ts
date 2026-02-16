import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";

const registerUser = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await AuthService.registerUser(payload);
        sendResponse(res, {
            success: true,
            message: "User registered successfully",
            statusCode: 200,
            data: result
        });
    }
);

export const AuthController = {
    registerUser
};