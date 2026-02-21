import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateOrderPayload } from "./order.interface";
import { OrderStatus } from "../../../generated/prisma/enums";

const createOrderIntoDB = async (payload: CreateOrderPayload, customerId: string) => {
    const provider = await prisma.providerProfile.findUnique({
        where: {
            id: payload.providerId
        },
        include: {
            user: {
                select: {
                    status: true
                }
            }
        },
    });

    if (!provider) {
        throw new AppError(status.NOT_FOUND, "Provider not found");
    }
    if (provider.user.status !== "ACTIVE") {
        throw new AppError(status.BAD_REQUEST, "Provider is not active");
    }

    const mealsId = payload.items.map((item) => item.mealId);
    const meals = await prisma.meal.findMany({
        where: {
            id: {
                in: mealsId
            }
        }
    });
    if (!meals) {
        throw new AppError(status.NOT_FOUND, "Meal not found");
    }

    if (meals.length !== payload.items.length) {
        throw new AppError(status.BAD_REQUEST, "Meal not found");
    }

    let totalPrice = 0;
    const orderItems = payload.items.map((item) => {
        const meal = meals.find((meal) => meal.id === item.mealId);
        if (!meal) {
            throw new AppError(status.NOT_FOUND, "Meal not found");
        }
        totalPrice += meal.price * item.quantity;

        return {
            mealId: meal.id,
            quantity: item.quantity,
            price: meal.price,
        };
    });

    const orderNumber = `ORD-${Date.now()}`;

    const result = await prisma.order.create({
        data: {
            orderNumber: orderNumber,
            userId: customerId,
            providerId: provider.id,
            address: payload.address,
            totalAmount: totalPrice,
            status: OrderStatus.PENDING,
            items: {
                create: orderItems,
            },
        },
        include: {
            items: {
                include: {
                    meal: true,
                }
            }
        }
    });
    return result;
};

const getAllOrders = async (userId: string) => {
    const result = await prisma.order.findMany({
        where: {
            userId
        },
        include: {
            meal: true,
            provider: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return result;
};

const getSingleOrder = async (id: string, user: any) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            meal: true,
            provider: true,
            user: true,
        },
    });

    if (!order) {
        throw new Error("Order not found");
    }

    // যদি admin না হয়, তাহলে নিজের order কিনা check করো
    if (user.role !== "ADMIN" && order.userId !== user.userId) {
        throw new Error("You are not authorized to view this order");
    }

    return order;
};

export const OrderServices = {
    createOrder,
    getAllOrders,
    getSingleOrder
};