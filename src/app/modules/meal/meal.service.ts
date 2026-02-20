import { prisma } from "../../lib/prisma";
import { IMealData } from "./meal.interface";

const createMeal = async (payload: IMealData) => {
    const { name, description, price, image, categoryId, providerId, createdAt, updatedAt } = payload;

    const category = await prisma.category.findUnique({
        where: {
            id: categoryId
        }
    });

    if (!category) {
        throw new Error("Category not found");
    }

    const provider = await prisma.providerProfile.findUnique({
        where: {
            id: providerId
        }
    });

    if (!provider) {
        throw new Error("Provider not found");
    }

    const result = await prisma.meal.create({
        data: {
            name,
            description,
            price,
            image,
            categoryId,
            providerId,
            createdAt,
            updatedAt
        }
    });
    return result;
};

// const getAllMeals = async () => {
//     const result = await prisma.meal.findMany();
//     return result;
// };

const getAllMeals = async (query: any) => {
    const {
        search,
        minPrice,
        maxPrice,
        categoryId,
        providerId,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 10,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const whereCondition: any = {};

    // 🔎 Search by name
    if (search) {
        whereCondition.name = {
            contains: search,
            mode: "insensitive",
        };
    }

    // 💰 Price filter
    if (minPrice || maxPrice) {
        whereCondition.price = {
            gte: minPrice ? Number(minPrice) : undefined,
            lte: maxPrice ? Number(maxPrice) : undefined,
        };
    }

    // 🏷 Category filter
    if (categoryId) {
        whereCondition.categoryId = categoryId;
    }

    // 👤 Provider filter
    if (providerId) {
        whereCondition.providerId = providerId;
    }

    const result = await prisma.meal.findMany({
        where: whereCondition,
        skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            category: true,
            provider: true,
            reviews: true,
        },
    });

    const total = await prisma.meal.count({
        where: whereCondition,
    });

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
        },
        data: result,
    };
};

const getSingleMeal = async (id: string) => {
    const result = await prisma.meal.findUnique({
        where: {
            id
        }
    });
    return result

};

const deleteMeal = async (id: string) => {
    const isExistMeal = await prisma.meal.findUnique({
        where: {
            id
        }
    })
    if (!isExistMeal) {
        throw new Error("Meal not found");
    }
    const result = await prisma.meal.delete({
        where: {
            id
        },
    });
    return result

};

const updateMeal = async (payload: IMealData, mealId: string) => {
    const { name, description, price, image, categoryId, providerId, createdAt, updatedAt } = payload;

    const category = await prisma.category.findUnique({
        where: {
            id: categoryId
        }
    });

    if (!category) {
        throw new Error("Category not found");
    }

    const provider = await prisma.providerProfile.findUnique({
        where: {
            id: providerId
        }
    });

    if (!provider) {
        throw new Error("Provider not found");
    }

    const result = await prisma.meal.update({
        where: {
            id: mealId
        },
        data: {
            name,
            description,
            price,
            image,
            categoryId,
            providerId,
            createdAt,
            updatedAt
        }
    });
    return result;
}

export const MealServices = {
    createMeal,
    getAllMeals,
    getSingleMeal,
    deleteMeal,
    updateMeal
}