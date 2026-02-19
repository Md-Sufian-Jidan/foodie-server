import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CategoryService } from "./category.services";

const createCategory = catchAsync(
    async (req, res) => {
        const payload = req.body;
        const result = await CategoryService.createCategory(payload);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Category created successfully",
            data: result
        });
    }
);

const getAllCategories = catchAsync(
    async (req, res) => {
        const result = await CategoryService.getAllCategories();
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Categories fetched successfully",
            data: result
        });
    }
);

const getCategoryById = catchAsync(
    async (req, res) => {
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

const deleteCategory = catchAsync(
    async (req, res) => {
        const { id } = req.params;
        await CategoryService.deleteCategory(id as string);
        sendResponse(res, {
            statusCode: status.OK,
            success: true,
            message: "Category deleted successfully",
        });
    }
);

export const CategoryController = {
    createCategory,
    getAllCategories,
    getCategoryById,
    deleteCategory
};
