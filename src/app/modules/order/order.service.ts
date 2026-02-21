import { prisma } from "../../lib/prisma";
import { IOrderData } from "./order.interface";

// Orders
// Method	Endpoint	Description
// POST	/api/orders	Create new order
// GET	/api/orders	Get user's orders
// GET	/api/orders/:id	Get order details

const createOrder = async (payload: IOrderData) => {
    const { mealId } = payload;
    const meal = await prisma.meal.findUnique({
        where: {
            id: mealId
        }
    });
    if (!meal) {
        throw new Error("Meal not found");
    }

    const result = await prisma.order.create({
        data: payload,
    });
    return result;
};

// const getAllOrders = async () => {
//     const result = await prisma.order.findMany();
//     return result;
// };

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