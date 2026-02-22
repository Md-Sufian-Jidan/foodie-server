import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"
import { Request } from "express";
import { IUser } from "./user.interface";

const getCurrentUserFromDB = async (req: Request) => {
    return req.user;
};

const getAllUsersFromDB = async () => {
    const result = await prisma.user.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });
    return result;
};

const updateUserStatusIntoDB = async (id: string, newStatus: UserStatus) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!isExistUser) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (isExistUser.status === UserStatus.BLOCKED) {
        throw new AppError(status.BAD_REQUEST, "User is blocked");
    }
    if (isExistUser.status === UserStatus.DELETED) {
        throw new AppError(status.BAD_REQUEST, "User is deleted");
    }

    const result = await prisma.user.update({
        where: {
            id,
        },
        data: {
            status: newStatus
        }
    });
    return result;
};

const updateProfileIntoDB = async (req: Request, id: string, payload: Partial<IUser>) => {
    const userId = req.user?.userId as string;
    if (!userId) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized");
    }

    const isExistUser = await prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!isExistUser) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    const result = await prisma.user.update({
        where: {
            id,
        },
        data: {
            ...payload
        }
    });
    return result;
};

export const UserServices = {
    getCurrentUserFromDB,
    getAllUsersFromDB,
    updateUserStatusIntoDB,
    updateProfileIntoDB
};