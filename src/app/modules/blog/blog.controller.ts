import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BlogService } from "./blog.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import paginationSortingHelper from "../../helpers/PaginationSortingHelper";

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
    const payload = req.query as unknown as {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: "title" | "createdAt" | "updatedAt";
        sortOrder?: "asc" | "desc";
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
        payload as any,
    );

    const normalizedSearch =
        typeof payload.search === "string" && payload.search.trim()
            ? payload.search.trim()
            : undefined;

    const result = await BlogService.getAllBlogs({
        page: Number(page),
        limit: Number(limit),
        skip: Number(skip),
        ...(normalizedSearch ? { search: normalizedSearch } : {}),
        sortBy: sortBy as "title" | "createdAt" | "updatedAt",
        sortOrder: sortOrder as "asc" | "desc",
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Blogs retrieved successfully",
        data: result.data,
        meta: {
            page: result.pagination.page,
            limit: result.pagination.limit,
            total: result.pagination.total,
            totalPages: result.pagination.totalPages,
        },
    });
});

const getAllForAdmin = catchAsync(async (req: Request, res: Response) => {
    const payload = req.query as unknown as {
        page?: number;
        limit?: number;
        sortBy?: "title" | "createdAt" | "updatedAt";
        sortOrder?: "asc" | "desc";
    };
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
        payload as any,
    );

    const result = await BlogService.getAllForAdmin({
        page: Number(page),
        limit: Number(limit),
        skip: Number(skip),
        sortBy: sortBy as "title" | "createdAt" | "updatedAt",
        sortOrder: sortOrder as "asc" | "desc",
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Blogs retrieved successfully",
        data: result.data,
        meta: {
            page: result.pagination.page,
            limit: result.pagination.limit,
            total: result.pagination.total,
            totalPages: result.pagination.totalPages,
        },
    });
});

const getBlogBySlug = catchAsync(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const blog = await BlogService.getBlogBySlug(slug as string);

    if (!blog) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Blog post not found");
    }

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Blog retrieved successfully",
        data: blog,
    });
});

const deleteBlogById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await BlogService.deleteBlogById(Number(id));

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Blog deleted successfully",
    });
});

export const BlogController = {
    getAllBlogs,
    getAllForAdmin,
    getBlogBySlug,
    deleteBlogById,
};