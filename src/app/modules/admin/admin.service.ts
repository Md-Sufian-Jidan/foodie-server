import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"

const getAllUsers = async () => {
    const users = await prisma.user.findMany();

    const result = users.filter((res) => res.status !== UserStatus.DELETED && res.status !== UserStatus.BLOCKED);

    return result;
};

const updateUserStatus = async (id: string, status: UserStatus) => {
    const isUserExists = await prisma.user.findUnique({
        where: {
            id
        }
    });

    if (!isUserExists) {
        throw new Error("User not found");
    }
    if (isUserExists.status === UserStatus.BLOCKED || isUserExists.status === UserStatus.DELETED) {
        throw new Error("User is blocked or deleted");
    }

    const result = await prisma.user.update({
        where: {
            id
        },
        data: {
            status
        }
    });
    return result;
};

export const AdminServices = {
    getAllUsers,
    updateUserStatus
};