import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICategory } from "./category.interface";
import slugify from "slugify";

const createCategoryIntoDB = async (payload: ICategory) => {
    const { name } = payload;
    const data = await prisma.category.create({
        data: {
            name,
            slug: slugify(name, {
                replacement: "-",
                lower: true,
                trim: true,
                remove: /[*+~.()'"!:@]/g,
                strict: true,
            }),
        },
    });
    if (!data) {
        throw new AppError(status.BAD_REQUEST, "Failed to create category");
    }
    return data;
};

const getAllCategoriesFromDB = async () => {
    // const result = await prisma.category.findMany({
    //     include: {
    //         _count: {
    //             select: { meals: true },
    //         },
    //     },
    //     orderBy: {
    //         createdAt: "desc",
    //     },
    // });

    const result = await prisma.category.findMany();

    return result;
};

const getCategoryById = async (id: string) => {
    const result = await prisma.category.findUnique({
        where: {
            id
        }
    });
    if (!result) {
        throw new Error("Category not found");
    }
    return result;
};

const updateCategoryIntoDB = async (id: string, payload: ICategory) => {
    const { name } = payload;

    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }

    const data = await prisma.category.update({
        where: { id },
        data: {
            name,
            slug: slugify(name, {
                replacement: "-",
                lower: true,
                trim: true,
                remove: /[*+~.()'"!:@]/g,
                strict: true,
            }),
        },
    });

    return data;
};

const deleteCategoryFromDB = async (id: string) => {

    const categoryIsExists = await prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { meals: true },
            },
        },
    });
    if (!categoryIsExists) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }

    if (categoryIsExists._count.meals > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "Cannot delete category with meals",
        );
    }

    await prisma.category.delete({
        where: { id },
    });

    return { message: "Meal category deleted successfully" };
};

export const CategoryService = {
    createCategoryIntoDB,
    getAllCategoriesFromDB,
    updateCategoryIntoDB,
    getCategoryById,
    deleteCategoryFromDB
};  