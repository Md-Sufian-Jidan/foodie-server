import { prisma } from "../../lib/prisma";
import { IOrderData } from "./order.interface";

const createOrder = async (payload: IOrderData) => {
    const { mealId, quantity, userId, providerId, totalPrice, status } = payload;
    const meal = await prisma.meal.findUnique({
        where: {
            id: mealId
        }
    });
    if (!meal) {
        throw new Error("Meal not found");
    }
    // const result = await prisma.order.create({
    //     data: {
    //         userId,
    //         mealId,
    //         quantity,
    //         providerId,
    //         totalPrice: meal.price * quantity,
    //         status
    //     }
    // });

    return;
};

const getAllOrders = async () => {
    const result = await prisma.order.findMany();
    return result;
};

const getSingleOrder = async (id: string) => {

    const isExistOrder = await prisma.order.findUnique({
        where: {
            id
        }
    });
    if (!isExistOrder) {
        throw new Error("Order not found");
    }

    const result = await prisma.order.findUnique({
        where: {
            id
        }
    });
    return result;
};

export const OrderServices = {
    createOrder,
    getAllOrders,
    getSingleOrder
};