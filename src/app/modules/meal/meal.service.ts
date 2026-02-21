import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IMeal, MealFilterPayload, UpdateMealPayload } from "./meal.interface";
import { buildMealQueryCondition } from "../../helpers/QueryBuilder";
import { OrderStatus } from "../../../generated/prisma/enums";

const createMealIntoDB = async (payload: IMeal & { userId: string }) => {
    const { name, calories, ingredients, description, price, image, isAvailable, categoryId, dietary, cuisine, mealType, spiceLevel, userId } = payload;

    const meal = await prisma.$transaction(async (tx) => {
        const provider = await tx.providerProfile.findUnique({
            where: {
                userId
            }
        })

        if (!provider) {
            throw new AppError(status.NOT_FOUND, "Provider not found");
        }


        const data = await tx.meal.create({
            data: {
                name,
                calories: Number(calories),
                ingredients,
                description: description ?? null,
                price: Number(price),
                image: image ?? null,
                isAvailable,
                categoryId,
                providerId: provider.id,
                dietary,
                cuisine,
                mealType,
                spiceLevel,
            },
        });

        return data;
    });

    return meal;
};

const getAllMealsFromDB = async (payload: MealFilterPayload) => {

    const meal = await prisma.meal.findMany({
        take: Number(payload.limit),
        skip: Number(payload.skip),
        where: buildMealQueryCondition(payload),
        ...(payload.sortBy && { orderBy: { [payload.sortBy]: payload.sortOrder } }),
    });

    const total = await prisma.meal.count({
        where: buildMealQueryCondition(payload),
    });

    if (!meal || meal.length === 0) {
        throw new AppError(status.NOT_FOUND, "Meal not found");
    }

    const totalPages = Math.ceil(total / Number(payload.limit));


    return {
        data: meal,
        pagination: {
            total,
            page: payload.page || 1,
            limit: payload.limit || 10,
            totalPages,
        },
    };
};

const getSingleMealFromDB = async (mealId: string) => {
    const result = await prisma.meal.findUnique({
        where: {
            id: mealId
        },
        include: {
            reviews: true,
            category: true,
            provider: {
                select: {
                    id: true,
                    shopName: true,
                    address: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(status.NOT_FOUND, "Meal not found");
    }

    return result;
};

const getProviderMealsFromDB = async (userId: string) => {
    const provider = await prisma.providerProfile.findUnique({
        where: {
            userId: userId
        }
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider not found");
    }

    const result = await prisma.meal.findMany({
        where: {
            providerId: provider.id
        },
        include: {
            category: true,
            reviews: true,
            provider: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });


    return {
        data: result,
        pagination: {
            total: result.length,
        },
    };
};

const updateMealIntoDB = async (mealId: string, userId: string, payload: UpdateMealPayload) => {

    const provider = await prisma.providerProfile.findUnique({
        where: {
            userId: userId
        }
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider not found");
    }

    const isExistMeal = await prisma.meal.findUnique({
        where: {
            id: mealId,
            providerId: provider.id
        }
    });

    if (!isExistMeal) {
        throw new AppError(status.NOT_FOUND, "Meal not found");
    }

    if (isExistMeal.providerId !== provider.id) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to update this meal");
    }

    const result = await prisma.meal.update({
        where: {
            id: mealId
        },
        data: {
            ...payload,
            updatedAt: new Date()
        }
    });
    return result;
};

const deleteMealFromDB = async (mealId: string, userId: string) => {
    const provider = await prisma.providerProfile.findUnique({
        where: {
            userId: userId
        }
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider not found");
    }

    const isExistMeal = await prisma.meal.findUnique({
        where: {
            id: mealId,
            providerId: provider.id
        }
    });

    if (!isExistMeal) {
        throw new AppError(status.NOT_FOUND, "Meal not found");
    }

    if (isExistMeal.providerId !== provider.id) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to delete this meal");
    }

    const runningOrder = await prisma.order.findFirst({
        where: {
            status: {
                in: [OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.COOKING, OrderStatus.ON_THE_WAY]
            },
            items: {
                some: {
                    mealId
                }
            },
        },
    });

    if (runningOrder) {
        throw new AppError(status.BAD_REQUEST, "Meal is already ordered");
    }

    const result = await prisma.meal.delete({
        where: {
            id: mealId
        }
    });
    return result;
};

const getProviderOrdersFromDB = async (userId: string) => {
    const provider = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider profile not found");
    }

    const orders = await prisma.order.findMany({
        where: { providerId: provider.id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            items: {
                include: {
                    meal: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            image: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return {
        data: orders,
        pagination: {
            total: orders.length,
        },
    };
};

const getPopularMealsFromDB = async () => {
    const meals = await prisma.meal.findMany({
        orderBy: {
            reviews: {
                _count: "desc",
            },
        },
        take: 8,
        include: {
            reviews: true,
            category: true,
            provider: {
                select: {
                    id: true,
                    shopName: true,
                    address: true,
                },
            },
        },
    });

    return {
        data: meals,
        pagination: {
            total: meals.length,
        },
    };
};

const dietaryOptionsFromDB = async () => {
    const result = await prisma.meal.findMany({
        distinct: ["dietary"],
        select: {
            dietary: true,
        },
    });

    const dietarySet = new Set<string>();
    result.forEach((meal) => {
        meal.dietary.forEach((dietary) => {
            dietarySet.add(dietary);
        });
    });

    return Array.from(dietarySet);
};

const getCusineOptionsFromDB = async () => {
    const result = await prisma.meal.findMany({
        distinct: ["cuisine"],
        select: {
            cuisine: true,
        },
    });

    return result.map((meal) => meal.cuisine).filter((cusine) => cusine !== null);
};

const updateOrderStatusIntoDB = async (userId: string, orderId: string, orderStatus: OrderStatus) => {

    const provider = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider profile not found");
    }

    const isExistOrder = await prisma.meal.findUnique({
        where: {
            id: orderId,
            providerId: provider.id
        }
    });

    if (!isExistOrder) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    if (isExistOrder.providerId !== provider.id) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to delete this meal");
    }

    const result = await prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status: orderStatus,
            updatedAt: new Date(),
        },
    });

    return result;
};

const getMealTypesFromDB = async (): Promise<string[]> => {
    const mealTypes = await prisma.meal.findMany({
        distinct: ["mealType"],
        select: {
            mealType: true,
        },
    });

    return mealTypes
        .map((meal) => meal.mealType)
        .filter((type): type is string => type !== null);
};

export const MealService = {
    createMealIntoDB,
    getAllMealsFromDB,
    getSingleMealFromDB,
    updateMealIntoDB,
    deleteMealFromDB,
    updateOrderStatusIntoDB,
    getProviderMealsFromDB,
    getPopularMealsFromDB,
    dietaryOptionsFromDB,
    getCusineOptionsFromDB,
    getProviderOrdersFromDB,
    getMealTypesFromDB
}