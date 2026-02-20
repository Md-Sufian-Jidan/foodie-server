import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { MealServices } from "./meal.service";
import { Request, Response } from "express";

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

const getAllMealsFromDB = catchAsync(
    async (req: Request, res: Response) => {
        console.log(req.query);
        const result = await MealServices.getAllMeals(req.query);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Meals fetched successfully",
            data: result
        });
    }
);

const getSingleMealFromDB = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await MealServices.getSingleMeal(id as string);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Meal fetched successfully",
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

export const MealController = {
    createMealIntoDB,
    getAllMealsFromDB,
    getSingleMealFromDB,
    deleteMealFromDB,
    updateMealIntoDB
}