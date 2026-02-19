import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"

const getCurrentUser = async (id: string, status: UserStatus) => {
    const isExistUser = await prisma.user.findUnique({
        where: {
            id
        }
    });
    if (!isExistUser) {
        throw new Error("User not found");
    }

    if (isExistUser.status === UserStatus.BLOCKED) {
        throw new Error("User is blocked");
    }
    if (isExistUser.status === UserStatus.DELETED) {
        throw new Error("User is deleted");
    }

    const result = await prisma.user.findUnique({
        where: {
            id,
            status
        }
    });
    return result;
};

export const UserServices = {
    getCurrentUser
};