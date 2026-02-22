import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ProviderServices } from "./provider.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createProviderProfile = () => catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId as string;
        const payload = req.body;
        const result = await ProviderServices.createProviderProfileIntoDB({ ...payload, userId });
        sendResponse(res, {
            statusCode: status.CREATED,
            success: true,
            message: "Provider profile created successfully",
            data: result
        });
    }
);

const getAllProviders = () => catchAsync(
    async (req: Request, res: Response) => {
        const result = await ProviderServices.getAllProvidersFromDB();
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Providers fetched successfully",
            data: result
        });

    }
);

const getProviderWithId = () => catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const result = await ProviderServices.getProviderWithIdFromDB(id);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Provider with menu fetched successfully",
            data: result
        });
    }
);

export const ProviderController = {
    createProviderProfile,
    getAllProviders,
    getProviderWithId
}
