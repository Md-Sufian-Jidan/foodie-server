import { prisma } from "../../lib/prisma";

const createCategory = async (payload: Record<string, any>) => {
    const { name, image } = payload;
    const exist = await prisma.category.findFirst({
        where: {
            name
        }
    });
    if (exist) {
        throw new Error("Category already exists");
    }
    const result = await prisma.category.create({
        data: {
            name,
            image
        }
    });
    return result;
};

const getAllCategories = async () => {
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

const deleteCategory = async (id: string) => {

    const exist = await prisma.category.findUnique({
        where: {
            id
        }
    });
    if (!exist) {
        throw new Error("Category not found");
    }
    const result = await prisma.category.delete({
        where: {
            id
        }
    });
    return result;
};

export const CategoryService = {
    createCategory,
    getAllCategories,
    getCategoryById,
    deleteCategory
};