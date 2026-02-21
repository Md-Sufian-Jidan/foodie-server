import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"
import { IMealData } from "./provider.interface";

// Provider Management
// Method	Endpoint	Description
// POST	/api/provider/meals	Add meal to menu
// PUT	/api/provider/meals/:id	Update meal
// DELETE	/api/provider/meals/:id	Remove meal
// PATCH	/api/provider/orders/:id	Update order status

const getAllProviders = async () => {
    const result = await prisma.user.findMany({
        where: {
            role: Role.PROVIDER
        },
        include: {
            providerProfile: true
        }
    });
    return result;
};

const getProviderWithMenu = async (id: string) => {

    const isUserExists = await prisma.user.findUnique({
        where: {
            id
        }
    });

    if (!isUserExists) {
        throw new Error("User not found");
    }

    if (isUserExists.role === Role.CUSTOMER) {
        throw new Error("User is not a provider");
    }

    if (isUserExists.status === UserStatus.BLOCKED) {
        throw new Error("User is blocked");
    }

    if (isUserExists.status === UserStatus.DELETED) {
        throw new Error("User is deleted");
    }

    const provider = await prisma.user.findUnique({
        where: {
            id
        },
        include: {
            providerProfile: true
        }
    });

    const result = await prisma.providerProfile.findUnique({
        where: {
            userId: provider?.id
        },
        include: {
            meals: true
        }
    });
    return result;
};

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
};

const upateOrderStatus = () => {}

export const ProviderServices = {
    getAllProviders,
    getProviderWithMenu,
    createMeal,
    updateMeal,
    deleteMeal
}