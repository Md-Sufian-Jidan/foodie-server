import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateOrderPayload } from "./order.interface";
import { OrderStatus } from "../../../generated/prisma/enums";

const createOrderIntoDB = async (payload: CreateOrderPayload, userId: string) => {
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
            userId,
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

const getMyOrdersFromDB = (customerId: string) => {
    const orders = prisma.order.findMany({
        where: {
            userId: customerId
        },
        include: {
            items: {
                include: {
                    meal: true,
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return orders;
};

const getOrderByIdFromDB = (orderId: string, customerId: string) => {
    const order = prisma.order.findFirst({
        where: {
            id: orderId,
            userId: customerId
        },
        include: {
            items: {
                include: {
                    meal: {
                        include: {
                            provider: true
                        }
                    },
                }
            },
            provider: true
        },
    });

    if (!order) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    return order;
};

const updateOrderStatusIntoDB = (orderId: string, orderStatus: OrderStatus, providerId: string) => {

    const order = prisma.order.findFirst({
        where: {
            id: orderId,
            providerId: providerId
        }
    });

    if (!order) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    const updatedOrder = prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status: orderStatus
        },
        include: {
            items: {
                include: {
                    meal: true,
                }
            }
        }
    });

    if (!updatedOrder) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    return updatedOrder;
};

const trackOrderStatusIntoDB = (orderId: string, userId: string) => {
    const order = prisma.order.findFirst({
        where: {
            id: orderId,
            userId: userId
        },
        select: {
            id: true,
            status: true,
            address: true,
            totalAmount: true,
            createdAt: true,
            updatedAt: true,
            items: {
                include: {
                    meal: true
                },
            },
            provider: true
        },
    });

    if (!order) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    return order;
};

const cancelOrderIntoDB = (orderId: string, customerId: string) => {

    const order = prisma.order.findFirst({
        where: {
            id: orderId,
            userId: customerId
        }
    });

    if (!order) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    if (order?.status === OrderStatus.CANCELLED) {
        throw new AppError(status.BAD_REQUEST, "Order is already cancelled");
    }

    const updatedOrder = prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status: OrderStatus.CANCELLED
        },
        include: {
            items: {
                include: {
                    meal: true,
                }
            }
        }
    });

    if (!updatedOrder) {
        throw new AppError(status.NOT_FOUND, "Order not found");
    }

    return updatedOrder;
};

const getAllOrdersFromDB = async () => {

    const orders = prisma.order.findMany({
        include: {
            items: {
                include: {
                    meal: true,
                },
            },
            provider: true,
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    if (!orders) {
        throw new AppError(status.NOT_FOUND, "Orders not found");
    }

    return orders;
}

export const OrderService = {
    createOrderIntoDB,
    getMyOrdersFromDB,
    getOrderByIdFromDB,
    updateOrderStatusIntoDB,
    trackOrderStatusIntoDB,
    getAllOrdersFromDB,
    cancelOrderIntoDB
};