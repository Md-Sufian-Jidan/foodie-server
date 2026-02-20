import { Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"

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
}

export const ProviderServices = {
    getAllProviders,
    getProviderWithMenu
}