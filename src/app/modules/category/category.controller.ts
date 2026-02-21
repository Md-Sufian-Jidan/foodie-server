import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CategoryService } from "./category.services";
import { Request, Response } from "express";

const createCategory = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const result = await CategoryService.createCategoryIntoDB(payload);
        sendResponse(res, {
            statusCode: status.CREATED,
            success: true,
            message: "Category created successfully",
            data: result
        });
    }
);

const getAllCategories = catchAsync(
    async (req: Request, res: Response) => {
        const result = await CategoryService.getAllCategoriesFromDB();
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Categories fetched successfully",
            data: result
        });
    }
);

const getCategoryById = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await CategoryService.getCategoryById(id as string);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Category fetched successfully",
            data: result
        });
    }
);

const updateCategory = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;
        const result = await CategoryService.updateCategoryIntoDB(id as string, payload);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Category updated successfully",
            data: result
        });
    }
)

const deleteCategory = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        await CategoryService.deleteCategoryFromDB(id as string);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Category deleted successfully",
            data: null
        });
    }
);

export const CategoryController = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
