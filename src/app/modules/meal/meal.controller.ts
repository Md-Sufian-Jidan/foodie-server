import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { MealService } from "./meal.service";
import { Request, Response } from "express";
import paginationSortingHelper from "../../helpers/PaginationSortingHelper";
import { OrderStatus } from "../../../generated/prisma/enums";

const createMeal = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId as string;
        const result = await MealService.createMealIntoDB({ ...req.body, userId });
        sendResponse(res, {
            statusCode: status.CREATED,
            success: true,
            message: "Meal created successfully",
            data: result
        });
    },
);

const getAllMeals = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.query;
        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(payload);
        const result = await MealService.getAllMealsFromDB({
            ...payload,
            page,
            limit,
            skip,
            ...(sortBy && { sortBy }),
            ...(sortOrder && { sortOrder }),
        });
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Meals fetched successfully",
            data: result
        });
    }
);

const getSingleMeal = catchAsync(
    async (req: Request, res: Response) => {
        const mealId = req.params.id as string;
        const result = await MealService.getSingleMealFromDB(mealId);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Meal fetched successfully",
            data: result
        });
    }
);

const getProviderMeals = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId as string;
        const result = await MealService.getProviderMealsFromDB(userId);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Provider meals fetched successfully",
            data: result
        });
    }
);

const updateMeal = catchAsync(
    async (req: Request, res: Response) => {
        const mealId = req.params.id as string;
        const userId = req.user?.userId as string;
        const result = await MealService.updateMealIntoDB(mealId, userId, req.body);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Meal updated successfully",
            data: result
        });
    }
);

const deleteMeal = catchAsync(
    async (req: Request, res: Response) => {
        const mealId = req.params.id as string;
        const userId = req.user?.userId as string;
        const result = await MealService.deleteMealFromDB(mealId, userId);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Meal deleted successfully",
            data: result
        });
    }
);

const getProviderOrders = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId as string;
        const result = await MealService.getProviderOrdersFromDB(userId);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Provider orders fetched successfully",
            data: result
        });
    }
);

const updateOrderStatus = catchAsync(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId as string;
        const orderId = req.params.id as string;
        const orderStatus = req.body.status as OrderStatus;
        const result = await MealService.updateOrderStatusIntoDB(orderId, userId, orderStatus);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Order status updated successfully",
            data: result
        });
    }
);

const getMealTypes = catchAsync(
    async (req: Request, res: Response) => {
        const result = await MealService.getMealTypesFromDB();
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Meal types fetched successfully",
            data: result
        });
    }
);

const getDietaryOptions = catchAsync(
    async (req: Request, res: Response) => {
        const result = await MealService.dietaryOptionsFromDB();
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Dietary options fetched successfully",
            data: result
        });
    }
);

const getCuisineOptions = catchAsync(
    async (req: Request, res: Response) => {
        const result = await MealService.getCusineOptionsFromDB();
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Cuisine options fetched successfully",
            data: result
        });
    }
);

const getPopularMeals = catchAsync(
    async (req: Request, res: Response) => {
        const result = await MealService.getPopularMealsFromDB();
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Popular meals fetched successfully",
            data: result
        });
    }
);

export const MealController = {
    getProviderMeals,
    updateMeal,
    deleteMeal,
    getProviderOrders,
    updateOrderStatus,
    getMealTypes,
    getDietaryOptions,
    getCuisineOptions,
    getPopularMeals,
    getSingleMeal,
    getAllMeals,
    createMeal
}