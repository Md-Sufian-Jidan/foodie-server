import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ProviderServices } from "./provider.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getAllProvidersFromDB = () => catchAsync(
    async (req: Request, res: Response) => {
        const result = await ProviderServices.getAllProviders();
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Providers fetched successfully",
            data: result
        });

    }
);

const getProviderWithMenuFromDB = () => catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await ProviderServices.getProviderWithMenu(id as string);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Provider with menu fetched successfully",
            data: result
        });
    }
);

const deleteMealFromDB = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        await MealServices.deleteMeal(id as string);
        sendResponse(res, {
            statusCode: status.NO_CONTENT,
            success: true,
            message: "Meal deleted successfully",
        });
    }
);

const updateMealIntoDB = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;
        const result = await MealServices.updateMeal(payload, id as string);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Meal updated successfully",
            data: result
        });
    }
);

const createMealIntoDB = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await MealServices.createMeal(payload);
        sendResponse(res, {
            statusCode: status.CREATED,
            success: true,
            message: "Meal created successfully",
            data: result
        });
    }
);

export const ProviderController = {
    getAllProvidersFromDB,
    getProviderWithMenuFromDB
}
