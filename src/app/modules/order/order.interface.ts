import { OrderStatus } from "../../../generated/prisma/enums";

export interface IOrderData {
    userId: string;
    providerId: string;
    mealId: string;
    quantity: number;
    totalPrice: number;
    status: OrderStatus;
}